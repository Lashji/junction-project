import "./config";

import type { W3CCredential } from "@0xpolygonid/js-sdk";
import { DID } from "@iden3/js-iden3-core";

import { WalletEvents, WalletService } from "./wallet-services";
import { type TokenData } from "~/types";

export class Wallet {
  private walletService: WalletService;
  private ready = false;

  constructor(tokenData?: TokenData) {
    this.walletService = new WalletService(tokenData);
    this.walletService.once(WalletEvents.INITIALIZED, () => {
      console.log("wallet initialized");
      this.ready = true;
    });
  }

  isReady = () => {
    return new Promise((resolve) => {
      if (this.ready) {
        resolve(true);
        return;
      }

      this.walletService.once(WalletEvents.INITIALIZED, () => {
        resolve(true);
      });
    });
  };

  saveCredential(credential: W3CCredential) {
    return this.walletService.getCredWallet().save(credential);
  }

  async syncCredentials(creds: W3CCredential[]) {
    await this.walletService.getCredWallet().saveAll(creds);
  }

  async getIdentities() {
    return this.walletService.getIdentities();
  }

  async createProof(request: Uint8Array) {
    const identity = this.walletService.getAccountManager().getActiveIdentity();
    console.log("identity", identity);
    if (!identity) {
      throw new Error("No identity found");
    }

    const authHandler = this.walletService.getAuthHandler();

    if (!authHandler) {
      throw new Error("Auth handler not initialized");
    }

    const authRequest = await authHandler
      .parseAuthorizationRequest(request)
      .catch((e) => {
        console.log("error", e);
        return null;
      });

    if (!authRequest) {
      throw new Error("Invalid authorization request");
    }

    const did = DID.parse(identity.did);

    const response = await authHandler
      .handleAuthorizationRequest(did, request)
      .catch((e) => {
        console.log("error", e);
        return null;
      });

    console.log("response", response);

    return response;
  }

  getActiveIdentityDID() {
    const identity = this.walletService.getAccountManager().getActiveIdentity();
    if (!identity) {
      throw new Error("No identity found");
    }

    return identity.did;
  }

  async getAllCredentials() {
    const identity = this.walletService.getAccountManager().getActiveIdentity();

    if (!identity) {
      console.log("IdentityWallet getAllCredentials: no identity");
      return [];
    }

    try {
      const identityCreds = await this.walletService
        .getWallet()
        .findOwnedCredentialsByDID(DID.parse(identity.did), {});

      return identityCreds;
    } catch (e) {
      console.log(
        `Something went wrong when fetching credentials for identity ${identity.did}`,
        e,
      );
      return [];
    }
  }
}
