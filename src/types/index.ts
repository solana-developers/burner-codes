import type {
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * function that resolves a promise containing a payload for the transaction sheet
 */
export type PrepareTransactionResolver =
  () => Promise<PrepareTransactionResolverPayload>;

export type PrepareTransactionResolverPayload = {
  /** the transaction for the user to sign */
  transaction?: Transaction | VersionedTransaction;

  /** error message and data to be displayed in the UI */
  error?: string;

  /** payload with additional details for the UI */
  payload?: object;
};

export type TransactionDetails = {
  // todo: allow some sort of error message passing?
  feePayer: PublicKey;
  fee: number;
  memo?: string;
  // todo: add the simulation?
};
