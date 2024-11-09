import { env } from "~/env";

export const RHS_URL = "https://rhs-staging.polygonid.me";
export const RPC_URL = env.NEXT_PUBLIC_POLYGON_ID_RPC_URL;

export const defaultEthConnectionConfig = [
  {
    url: RPC_URL,
    defaultGasLimit: 600000,
    minGasPrice: "0",
    maxGasPrice: "100000000000",
    confirmationBlockCount: 5,
    confirmationTimeout: 600000,
    contractAddress: "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124",
    receiptTimeout: 600000,
    rpcResponseTimeout: 5000,
    waitReceiptCycleTime: 30000,
    waitBlockCycleTime: 3000,
    chainId: 80002,
  },
];
