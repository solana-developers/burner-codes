/**
 * Assorted helper for use with Solana Pay
 */

import { PublicKey } from "@solana/web3.js";

/**
 *
 */
export function getSolanaAddress(text: string) {
  // handle non solana domain protocols
  if (!text.includes(".")) {
    const address = new PublicKey(text);
    console.log("address found:", address.toBase58());

    return address;
    // todo: add support for solana domain protocols
  } else {
    throw Error("Invalid Solana address");
  }
}
