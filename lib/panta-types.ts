export type InstructionAccount = {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
};

export type BuiltInstruction = {
  programId: string;
  data: string;
  accounts: InstructionAccount[];
};

export type PrimaryQuote = {
  quoteId: string;
  marketId: string;
  side: "yes" | "no";
  amountUsdc: string;
  shares: string;
  avgPrice: string;
  feeUsdc: string;
  expiresAt: string;
};

export type PrimaryBuild = {
  orderId: string;
  quoteId: string;
  wallet: string;
  marketId: string;
  side: "yes" | "no";
  amountUsdc: string;
  expectedShares: string;
  feeUsdc: string;
  status: string;
  instructions: BuiltInstruction[];
  recentBlockhash: string;
  lastValidBlockHeight?: number;
  expiresAt?: string;
};

export type TradeProgress =
  | "idle"
  | "quoting"
  | "quoted"
  | "building"
  | "signing"
  | "submitting"
  | "complete"
  | "error";
