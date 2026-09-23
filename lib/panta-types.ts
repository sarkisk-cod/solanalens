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

export type Position = {
  marketId: string;
  category?: string | null;
  side: "yes" | "no" | string;
  shares: string;
  phase: string;
  claimable: boolean;
  claimed: boolean;
  outcome?: string | null;
  estimatedValue?: string;
};

export type PositionsResponse = {
  wallet: string;
  positions: Position[];
};

export type ClaimBuild = {
  wallet: string;
  marketId: string;
  outcome: string;
  winningShares: string;
  instructions: BuiltInstruction[];
  recentBlockhash: string;
  lastValidBlockHeight?: number;
};
