/**
 *
 */

import { ProxySolanaPayRequest } from "@/types";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

/**
 * Make and process the GET request for SolanaPay Transaction requests
 */
export async function proxySolanaPayRequest(
  url: string | URL,
  address: string,
): Promise<ProxySolanaPayRequest> {
  if (typeof url == "string") {
    url = new URL(url);
  }

  try {
    // todo: perform better handling and retires of these requests?
    const res = await fetch(`/api/solanapay`, {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({
        url: url.toString(),
        address,
      }),
    });

    const text = await res.text();
    // console.log("text:", text);

    if (!res.ok) {
      console.log("Bad Response:");
      // console.log(res);
      throw Error(text);
    }

    // console.log("Good Response");

    try {
      const data: ProxySolanaPayRequest = JSON.parse(text);

      /**
       * !hack: since we know the POST request cannot send an actual Transaction object
       * we assume it will be a base64 encoded string (per the SolanaPay spec)
       * so we are forcing that type and deserializing it as such
       */
      const base64Transaction: string | undefined = data.post
        .transaction as any as string;
      delete data.post.transaction;

      if (!base64Transaction) {
        throw Error("No transaction provided from the url");
      }

      // todo: should we base64 decode and recode to verify the data matches?

      // attempt to decode the POST response's transaction
      try {
        // attempt legacy transactions
        const buffer = Buffer.from(base64Transaction, "base64");
        const legacyTx = Transaction.from(buffer);
        data.post.transaction = legacyTx;
      } catch (err) {
        // not a legacy transaction
      }

      if (!data.post.transaction) {
        try {
          // attempt versioned transactions
          const buffer = Buffer.from(base64Transaction, "base64");
          const versionTx = VersionedTransaction.deserialize(buffer);
          data.post.transaction = versionTx;
        } catch (err) {
          // not a versioned transaction
        }
      }

      return data;
    } catch (err) {
      throw Error("Unable to parse proxy response");
    }
  } catch (err) {
    console.error("[proxySolanaPayRequest]", err);
  }

  // always return a correctly typed response
  return {
    get: {
      label: "[err]",
      icon: undefined,
    },
    post: {
      transaction: undefined,
      error: "No transaction found",
    },
  };
}
