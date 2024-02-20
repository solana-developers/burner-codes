/**
 *
 */

import { PublicKey } from "@solana/web3.js";

export const dynamic = "force-dynamic";

// export async function GET(req: Request) {
//   try {
//     console.log("get");
//     return Response.json({ success: true });

//     return Response.json("Invalid", {
//       status: 403,
//     });
//   } catch (err) {
//     return Response.json("Invalid request", {
//       status: 400,
//     });
//   }
// }

export async function POST(req: Request) {
  try {
    console.log("post");

    let { url: urlString, address } = await req.json();

    if (!urlString) {
      throw Error("Invalid input: url");
    }

    if (!address) {
      throw Error("Invalid input: address");
    }

    let url: URL;

    try {
      url = new URL(urlString);
    } catch (err) {
      throw Error("Invalid url");
    }

    console.log("[SolanaPay]", url.toString());

    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);

      if (pubkey.toBase58() !== address) {
        throw Error("Addresses did not match");
      }
    } catch (err) {
      throw Error("Invalid address");
    }

    const responsePayload = {
      get: {},
      post: {},
    };

    await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "burner.codes",
        "Accept-Encoding": "application/json",
        // "Content-Type": "application/json",
      },
    }).then(async (res) => {
      console.log("GET: received");

      const data = await res.text();
      console.log("data:", data);

      if (!res.ok) {
        throw Error("Bad proxy response: GET");
      }

      responsePayload.get = JSON.parse(data);
      console.info("getRes:", responsePayload.get);
    });

    await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "burner.codes",
        // "Accept-Encoding": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account: pubkey.toBase58(),
      }),
    }).then(async (res) => {
      console.log("POST: received");

      const data = await res.text();
      console.log("data:", data);

      if (!res.ok) {
        throw Error("Bad proxy response: POST");
      }

      responsePayload.post = JSON.parse(data);
      console.info("postRes:", responsePayload.post);
    });

    return Response.json(responsePayload);
  } catch (err) {
    console.warn("[solana pay proxy]");
    console.warn(err);
    let message = "Invalid request";

    if (err instanceof Error) message = err.message;

    return new Response(message, {
      status: 400,
    });
  }
}
