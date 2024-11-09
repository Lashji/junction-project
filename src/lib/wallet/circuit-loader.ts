import {
  CircuitId,
  CircuitStorage,
  IndexedDBDataSource,
} from "@0xpolygonid/js-sdk";

type CircuitPath = "wasm" | "zkey" | "verification_key";

export class CircuitLoader {
  private circuitStorage: CircuitStorage;

  constructor() {
    try {
      this.circuitStorage = new CircuitStorage(
        new IndexedDBDataSource("circuits"),
      );
    } catch (error: unknown) {
      console.error("Failed to initialize CircuitStorage:", error);
      throw new Error("Circuit storage initialization failed");
    }
  }

  async init(): Promise<void> {
    try {
      console.time("check loading circuits from DB");
      await this.loadCircuitData(CircuitId.AuthV2);
      console.timeEnd("check loading circuits from DB");
    } catch (e) {
      console.time("CircuitLoader.init");
      await this.fetchAndSaveCircuits();
      console.timeEnd("CircuitLoader.init");
    }
  }

  private async loadCircuitData(circuitId: CircuitId): Promise<void> {
    await this.circuitStorage.loadCircuitData(circuitId);
  }

  private async fetchCircuit(path: CircuitPath): Promise<Uint8Array> {
    const fileIdMap: Record<CircuitPath, string> = {
      wasm: "RmB0mh1bOoe2EM2f20S2KSUOZTYnfJ3wLsAu5h9GFgMDxjV1",
      zkey: "RmB0mh1bOoe2nmedHbioymAxcDa7ST4qQRjGOIku2LeohzXH",
      verification_key: "RmB0mh1bOoe2MpUbcnslMkrFtg95ycVQhX87jTd1HiEPGxDs",
    };

    const response = await fetch(`https://utfs.io/f/${fileIdMap[path]}`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  private async fetchAndSaveCircuits(): Promise<void> {
    try {
      const [auth_w, auth_z, auth_j] = await Promise.all([
        this.fetchCircuit("wasm"),
        this.fetchCircuit("zkey"),
        this.fetchCircuit("verification_key"),
      ]);

      console.time("CircuitLoader.saveCircuitData");
      await Promise.all([
        this.circuitStorage.saveCircuitData(CircuitId.AuthV2, {
          circuitId: CircuitId.AuthV2,
          wasm: auth_w,
          provingKey: auth_z,
          verificationKey: auth_j,
        }),
      ]);
      console.timeEnd("CircuitLoader.saveCircuitData");
    } catch (error) {
      console.error("Error fetching or saving circuits:", error);
      throw error;
    }
  }

  getCircuitStorage(): CircuitStorage {
    return this.circuitStorage;
  }
}
