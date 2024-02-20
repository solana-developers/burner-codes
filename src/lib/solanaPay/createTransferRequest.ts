import { TransferRequestURL } from "@solana/pay";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

/** SPL Memo program ID */
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

/**
 * Create a token transfer request based on the
 */
export async function createTransferRequestTransaction(
  req: TransferRequestURL,
  fromPubkey: PublicKey,
): Promise<Transaction> {
  const transaction = new Transaction();
  transaction.feePayer = fromPubkey;

  // todo: add priority fee instruction

  if (req.memo) {
    transaction.add(
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from(new TextEncoder().encode(req.memo)),
        keys: [],
      }),
    );
  }

  if (req.amount) {
    // create a simple SOL transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromPubkey,
        lamports: req.amount.toNumber(),
        toPubkey: req.recipient,
        programId: SystemProgram.programId,
      }),
    );
    // todo: add support for any spl token transfer
  }

  return transaction;
}
