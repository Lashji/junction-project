import type {
  AuthDataPrepareFunc,
  IDataStorage,
  Identity,
  StateVerificationOpts,
} from "@0xpolygonid/js-sdk";
import {
  AgentResolver,
  AuthHandler,
  BjjProvider,
  CircuitId,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  DataPrepareHandlerFunc,
  EthStateStorage,
  IdentityStorage,
  IdentityWallet,
  IndexedDBDataSource,
  IndexedDBPrivateKeyStore,
  IssuerResolver,
  KMS,
  KmsKeyType,
  MerkleTreeIndexedDBStorage,
  OnChainResolver,
  PackageManager,
  PlainPacker,
  ProofService,
  RHSResolver,
  VerificationHandlerFunc,
  ZKPPacker,
} from "@0xpolygonid/js-sdk";
import { proving } from "@iden3/js-jwz";

import { defaultEthConnectionConfig, RHS_URL } from "./config";
import { CircuitLoader } from "./circuit-loader";
import { ActiveIdentityManager } from "./local-storage-service";
import { type TokenData } from "~/types";

export class WalletService {
  private wallet: IdentityWallet;
  private credWallet: CredentialWallet;
  private dataStorage: IDataStorage;
  private kms: KMS;
  private circuitLoader: CircuitLoader;
  private proofService: ProofService;
  private packageMgr?: PackageManager;
  private authHandler?: AuthHandler;
  private accountManager: ActiveIdentityManager;
  private initialized: boolean;

  constructor(tokenData: TokenData) {
    console.log("initializing wallet with data:", tokenData);
    this.initialized = false;
    const { wallet, credWallet, dataStorage, kms } = this.createWallet();
    this.wallet = wallet;
    this.credWallet = credWallet;
    this.dataStorage = dataStorage;
    this.kms = kms;
    this.circuitLoader = new CircuitLoader();
    this.proofService = this.createProofService();
    this.accountManager = new ActiveIdentityManager();

    this.init(tokenData)
      .then(() => (this.initialized = true))
      .catch((e) => {
        console.error("Error initializing wallet", e);
      });
  }

  getInitialized = () => {
    return this.initialized;
  };

  getWallet() {
    return this.wallet;
  }

  getCredWallet() {
    return this.credWallet;
  }

  getDataStorage() {
    return this.dataStorage;
  }

  getKms() {
    return this.kms;
  }

  getCircuitLoader() {
    return this.circuitLoader;
  }

  getProofService() {
    return this.proofService;
  }

  getAccountManager() {
    return this.accountManager;
  }

  getAuthHandler() {
    return this.authHandler;
  }

  private async init(tokenData: TokenData) {
    await this.circuitLoader.init();
    this.packageMgr = this.createPackageMgr(
      await this.circuitLoader
        .getCircuitStorage()
        .loadCircuitData(CircuitId.AuthV2),
      this.proofService.generateAuthV2Inputs.bind(this.proofService),
      this.proofService.verifyState.bind(this.proofService),
    );
    this.authHandler = new AuthHandler(this.packageMgr, this.proofService);
    await this.initializeIdentity(tokenData.sub);
  }

  private createWallet() {
    try {
      const keyStore = new IndexedDBPrivateKeyStore();

      const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
      const kms = new KMS();
      kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
      const dataStorage = {
        credential: new CredentialStorage(
          new IndexedDBDataSource(CredentialStorage.storageKey),
        ),
        identity: new IdentityStorage(
          new IndexedDBDataSource(IdentityStorage.identitiesStorageKey),
          new IndexedDBDataSource(IdentityStorage.profilesStorageKey),
        ),
        mt: new MerkleTreeIndexedDBStorage(40),
        states: new EthStateStorage(defaultEthConnectionConfig),
      };

      const resolvers = new CredentialStatusResolverRegistry();
      resolvers.register(
        CredentialStatusType.SparseMerkleTreeProof,
        new IssuerResolver(),
      );
      resolvers.register(
        CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        new RHSResolver(dataStorage.states),
      );
      resolvers.register(
        CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        new OnChainResolver(defaultEthConnectionConfig),
      );
      resolvers.register(
        CredentialStatusType.Iden3commRevocationStatusV1,
        new AgentResolver(),
      );

      const credWallet = new CredentialWallet(dataStorage, resolvers);
      console.log("credWallet", credWallet.list());

      const wallet = new IdentityWallet(kms, dataStorage, credWallet);

      return {
        wallet,
        credWallet,
        dataStorage,
        kms,
      };
    } catch (e) {
      console.error("Error creating wallet", e);
      throw e;
    }
  }

  private async initializeIdentity(subClaim: string) {
    console.log("initializing identity for: ", subClaim);
    if (await this.hasIdentity()) {
      const activeIdentity = this.getActiveIdentity();
      console.log("activeIdentity", activeIdentity);
      if (activeIdentity === undefined) {
        console.log("no active identity");

        const identity = await this.loadIdentityFromDataStorage();
        console.log("loaded identity", identity);

        if (!identity) {
          throw new Error("Failed to load identity, Something went wrong");
        }
        console.log("setting active identity", identity.did.toString());

        this.setActiveIdentity(identity.did.toString());
      }
      console.log("identity already exists", this.getActiveIdentity());
      return this.getActiveIdentity();
    }

    const identity = await this.createIdentity(subClaim);
    this.setActiveIdentity(identity.did.string());

    return identity;
  }

  private async hasIdentity() {
    const identities = await this.dataStorage.identity.getAllIdentities();
    return identities.length > 0;
  }

  private async loadIdentityFromDataStorage() {
    if (!(await this.hasIdentity())) {
      return;
    }

    return (await this.dataStorage.identity.getAllIdentities())[0];
  }

  private createPackageMgr(
    circuitData: {
      circuitId?: string;
      wasm: unknown;
      verificationKey: Uint8Array | null;
      provingKey: unknown;
    },
    prepareFn: AuthDataPrepareFunc,
    stateVerificationFn: {
      (
        circuitId: string,
        pubSignals: string[],
        opts?: StateVerificationOpts,
      ): Promise<boolean>;
      (
        id: string,
        pubSignals: string[],
        opts?: StateVerificationOpts,
      ): Promise<boolean>;
    },
  ) {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);
    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mapKey =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();

    if (!circuitData.verificationKey) {
      throw new Error("Verification parameters not found");
    }

    const verificationParamMap = new Map([
      [
        mapKey,
        {
          key: circuitData.verificationKey,
          verificationFn,
        },
      ],
    ]);

    const provingParamMap = new Map();
    provingParamMap.set(mapKey, {
      dataPreparer: authInputsHandler,
      provingKey: circuitData.provingKey,
      wasm: circuitData.wasm,
    });

    const mgr = new PackageManager();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  }

  private createProofService() {
    return new ProofService(
      this.wallet,
      this.credWallet,
      this.circuitLoader.getCircuitStorage(),
      new EthStateStorage(defaultEthConnectionConfig),
      { ipfsGatewayURL: "https://gateway.pinata.cloud" },
    );
  }

  async createIdentity(subClaim: string) {
    const identity = await this.wallet.createIdentity({
      method: "polygonid",
      blockchain: "polygon",
      networkId: "amoy",
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL,
      },
      seed: new TextEncoder().encode(subClaim),
    });

    console.log("Identity created:", identity);
    return identity;
  }

  getActiveIdentity() {
    return this.accountManager.getActiveIdentity();
  }

  setActiveIdentity(did: string) {
    this.accountManager.setActiveIdentity({
      did,
      isActive: true,
    });
  }

  getIdentities() {
    return this.dataStorage.identity.getAllIdentities();
  }

  getPackageMgr(
    circuitData: {
      circuitId: string;
      wasm: unknown;
      verificationKey: Uint8Array | null;
      provingKey: unknown;
    },
    prepareFn: AuthDataPrepareFunc,
    stateVerificationFn: {
      (
        circuitId: string,
        pubSignals: string[],
        opts?: StateVerificationOpts,
      ): Promise<boolean>;
      (
        id: string,
        pubSignals: string[],
        opts?: StateVerificationOpts,
      ): Promise<boolean>;
    },
  ) {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);
    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mapKey =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();

    if (!circuitData.verificationKey) {
      throw new Error("Verification parameters not found");
    }

    const verificationParamMap = new Map([
      [
        mapKey,
        {
          key: circuitData.verificationKey,
          verificationFn,
        },
      ],
    ]);

    const provingParamMap = new Map();
    provingParamMap.set(mapKey, {
      dataPreparer: authInputsHandler,
      provingKey: circuitData.provingKey,
      wasm: circuitData.wasm,
    });

    const mgr = new PackageManager();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  }
}
