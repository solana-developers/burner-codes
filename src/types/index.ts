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
  payload?: PayloadTransactionRequest;
};

export type TransactionDetails = {
  // todo: allow some sort of error message passing?
  feePayer: PublicKey;
  fee: number;
  memo?: string;
  // todo: add the simulation?
};

export type SolanaPayGetResponse = {
  /**
   * The <label> value must be a UTF-8 string that describes the source of the
   * transaction request. For example, this might be the name of a brand,
   * store, application, or person making the request.
   */
  label?: string;
  /**
   * The <icon> value must be an absolute HTTP or HTTPS URL of an icon image.
   * The file must be an SVG, PNG, or WebP image, or the wallet must reject
   * it as malformed.
   */
  icon?: string;
  /**
   * Other keys might be returned from the
   */
  // todo;
};

export type SolanaPayPostResponse = {
  /** transaction for the user to sign */
  transaction?: Transaction | VersionedTransaction;
  /** optional message to show in the wallet ui */
  message?: string;
  /** optional error message to display in the ui */
  error?: string;
};

export type ProxySolanaPayRequest = {
  get: SolanaPayGetResponse;
  post: SolanaPayPostResponse;
};

export type PayloadTransactionRequest = {
  __ID: "SolanaPay_Transaction";
} & ProxySolanaPayRequest;
