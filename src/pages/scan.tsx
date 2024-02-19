"use client";

import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { useCallback, useEffect, useState } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { onQRScanError, qrScannerConfig } from "@/lib/scanner";
import { Html5QrcodeScanner, QrcodeSuccessCallback } from "html5-qrcode";
import { getSolanaAddress } from "@/lib/solanaPay";
import { TransactionRequestURL, parseURL } from "@solana/pay";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "scan QR code",
  description:
    "Quickly transfer SOL tokens to different burner " +
    "wallets and Solana addresses using QR codes",
};

export default function Page() {
  const {
    // comment for better diffs
    cluster,
    connection,
    sendTransaction,
  } = useGlobalContext();

  const [isOpen, setIsOpen] = useState<boolean>(true);

  /**
   * Handle a successfully decoded QR code scan
   */
  const onQRScanSuccess = useCallback<QrcodeSuccessCallback>(
    (decodedText, decodedResult) => {
      console.log("decodedText:", decodedText);
      console.log("decodedResult:", decodedResult);

      try {
        const url = parseURL(decodedText);
        console.log(url);

        if (!!(url as TransactionRequestURL)?.link) {
          // (url as TransactionRequestURL)
          alert("transaction request");
        } else {
          // (url as TransferRequestURL)
          alert("transfer request");
        }
      } catch (err) {}

      // try to read a qr code that is a solana address
      try {
        const address = getSolanaAddress(decodedText);
        alert(`address:${address.toBase58()}`);

        return;
      } catch (err) {}

      // todo: handle burner code urls natively

      // try {
      //   const url = new URL(decodedText);

      //   console.log("URL found:", url);

      //   // handle solana pay urls
      //   if (url.protocol.toLowerCase().replace(/:$/gi, "") == "solana") {
      //     alert("solana pay!!");
      //   }

      //   // todo: handle burner code urls natively

      //   // todo: what other urls should we handle

      //   return;
      // } catch (err) {
      //   // console.log();
      // }
    },
    [],
  );

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "scanner",
      qrScannerConfig,
      false, // verbose
    );

    html5QrcodeScanner.render(onQRScanSuccess, onQRScanError);

    return () => {
      html5QrcodeScanner;
    };
  }, []);

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-4xl text-center">Scan QR code</h1>

            {/* <p className="text-center text-gray-500">on Solana {cluster}</p> */}
          </section>

          <div
            onClick={() => sendTransaction("temp")}
            className="p-3 overflow-hidden card min-w-[400px] min-h-[475px]"
          >
            <div id="scanner">Waiting for camera...</div>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}
