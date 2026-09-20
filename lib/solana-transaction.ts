"use client";

import { Buffer } from "buffer";
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import type { BuiltInstruction } from "./panta-types";

if (typeof window !== "undefined" && !(window as { Buffer?: typeof Buffer }).Buffer) {
  (window as { Buffer: typeof Buffer }).Buffer = Buffer;
}

export function instructionsToVersionedTransaction(
  instructions: BuiltInstruction[],
  feePayer: PublicKey,
  recentBlockhash: string,
): VersionedTransaction {
  const compiledInstructions = instructions.map(
    (instruction) =>
      new TransactionInstruction({
        programId: new PublicKey(instruction.programId),
        keys: instruction.accounts.map((account) => ({
          pubkey: new PublicKey(account.pubkey),
          isSigner: account.isSigner,
          isWritable: account.isWritable,
        })),
        data: Buffer.from(instruction.data, "base64"),
      }),
  );

  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash,
    instructions: compiledInstructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}
