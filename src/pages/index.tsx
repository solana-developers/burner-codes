import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import Link from "next/link";
import QRCodeCard from "@/components/QRCodeCard";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { copyToClipboard, formatLamportsToSol } from "@/utils/helpers";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "simple burner wallets on Solana",
};

export default function Page() {
  const { burner, balance, cluster } = useGlobalContext();

  // track the needed state for the new various dialogs
  const [transferLink, setTransferLink] = useState<string>();

  useEffect(() => {
    setTransferLink(
      `${location.protocol}//${
        location.host
      }/send?to=${burner?.publicKey.toBase58()}`,
    );
  }, [burner?.publicKey]);

  /**
   * Simple helper function for the copy to clipboard with a message
   */
  function copyAddress(text: string | undefined, message: string) {
    if (!text) return toast.error("Unable to locate your burner address");

    copyToClipboard(text);
    toast.success(message);
  }

  // if (loading) {
  //   return (
  //     <DefaultLayout seo={seo}>
  //       <main className="container max-w-lg py-10 space-y-8 md:py-20">
  //         loading burner wallet
  //       </main>
  //     </DefaultLayout>
  //   );
  // }

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-4xl text-center">
              {formatLamportsToSol(balance)}
            </h1>

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
        </section>
      </main>
    </DefaultLayout>
  );
}
