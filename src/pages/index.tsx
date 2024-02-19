import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Link from "next/link";
import QRCodeCard from "@/components/QRCodeCard";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useGlobalContext } from "@/contexts/GlobalContext";
import {
  copyToClipboard,
  explorerURL,
  formatLamportsToSol,
} from "@/lib/helpers";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "simple burner wallets on Solana",
  description:
    "Simple burner wallets for the Solana blockchain. No app. No download. Just your open your browser and use it.",
};

export default function Page() {
  const { burner, balance, setBalance, cluster, connection, loading } =
    useGlobalContext();

  // track the needed state for the new various dialogs
  const [transferLink, setTransferLink] = useState<string>();
  const [airdropping, setAirdropping] = useState<boolean>(false);

  useEffect(() => {
    setTransferLink(
      `${location.protocol}//${
        location.host
      }/send?to=${burner?.publicKey.toBase58()}`,
    );
  }, [burner?.publicKey]);

  /**
   * Wrapper function for requesting airdrops on devnet
   */
  async function requestAirdrop(lamports: number = LAMPORTS_PER_SOL / 2) {
    setAirdropping(true);
    try {
      if (!burner?.publicKey)
        return toast.error("Unable to locate burner address");

      const sig = await connection.requestAirdrop(burner?.publicKey, lamports);

      // optimistically update the balance
      setBalance((prev: number) => prev + lamports);

      console.log("View on Explorer:", explorerURL({ sig, cluster }));

      toast.success("Airdrop complete");
    } catch (err) {
      console.error(err);

      // @ts-ignore
      if (err?.message.startsWith("429")) {
        toast.error("Airdrop rate limit exceeded.\nPlease try again later.");
      } else toast.error("Unable to perform airdrop");
    }
    setAirdropping(false);
  }

  /**
   * Simple helper function for the copy to clipboard with a message
   */
  function copyAddress(text: string | undefined, message: string) {
    if (!text) return toast.error("Unable to locate your burner address");

    copyToClipboard(text);
    toast.success(message);
  }

  if (loading) {
    return (
      <DefaultLayout seo={seo}>
        <main className="container max-w-lg py-10 space-y-8 text-center md:py-20">
          <h1 className="text-4xl">Loading burner wallet</h1>
          <LoadingSpinner visible={true} width={70} className="mx-auto" />
        </main>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2 text-center">
            <h1 className="text-4xl">{formatLamportsToSol(balance)}</h1>

            <p className="text-center text-gray-500">on Solana {cluster}</p>
          </section>

          <section className="text-center"></section>

          <QRCodeCard
            value={`/send?to=${burner?.publicKey.toBase58() || ""}`}
            className="max-w-[400px] w-min mx-auto"
            onClick={() =>
              copyAddress(transferLink, "Copied transfer link to clipboard")
            }
          />

          <section
            className="relative flex items-center max-w-lg gap-1 mx-auto align-middle !cursor-copy"
            onClick={() =>
              copyAddress(
                burner?.publicKey.toBase58(),
                "Copied burner address to clipboard",
              )
            }
          >
            <button className="absolute right-0">
              <DocumentDuplicateIcon className="w-5 text-gray-500 hover:text-black" />
            </button>
            <input
              type="text"
              readOnly
              disabled
              name="address"
              value={burner?.publicKey.toBase58() || "loading..."}
              className="w-full !pr-12 !bg-gray-100"
            />
          </section>

          <section className="space-y-2">
            <section className="grid grid-cols-2 gap-3 text-center">
              <Link href="/link" className="btn btn-dark">
                Send with Link
              </Link>
              <Link href="/send" className="btn btn-dark">
                Send to Address
              </Link>
            </section>
          </section>

          <section className="pt-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-center align-middle">
              <div className="w-full h-1 border-t border-gray-400"></div>
              <div className="whitespace-nowrap">More Options</div>
              <div className="w-full h-1 border-t border-gray-400"></div>
            </div>

            <section className="grid grid-cols-1 gap-3 text-center">
              <button
                type={"button"}
                onClick={() => requestAirdrop()}
                className="inline-flex justify-center btn btn-dark"
                disabled={airdropping}
              >
                Request Airdrop
                <LoadingSpinner
                  visible={airdropping}
                  className="absolute right-3"
                />
              </button>
            </section>
          </section>
        </section>
      </main>
    </DefaultLayout>
  );
}
