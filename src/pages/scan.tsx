import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { useCallback, useEffect, useState } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { onQRScanError, qrScannerConfig } from "@/lib/scanner";
import { Html5QrcodeScanner, QrcodeSuccessCallback } from "html5-qrcode";
import { getSolanaAddress } from "@/lib/solana/helpers";
import { TransactionRequestURL, parseURL } from "@solana/pay";
import { proxySolanaPayRequest } from "@/lib/solana/transactionRequest";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Html5QrcodePlugin from "@/components/Html5QrcodePlugin";

const SOLANA_PAY_URL = {
  left: "https://tug-of-war-solana-pay.vercel.app/api/transaction?amount=0.001&instruction=pull_right&network=devnet",
  right:
    "https://tug-of-war-solana-pay.vercel.app/api/transaction?amount=0.001&instruction=pull_left&network=devnet",
};

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
    prepareTransaction,
    burner,
    isTransactionSheetOpen,
    loading,
  } = useGlobalContext();

  let html5QrcodeScanner: Html5QrcodeScanner;

  /**
   * Handle a successfully decoded QR code scan
   */
  const onQRScanSuccess = useCallback<QrcodeSuccessCallback>(
    (decodedText, decodedResult) => {
      if (isTransactionSheetOpen) {
        console.log("sheet is open");
        return;
      } else {
        console.log("sheet not open");
      }

      console.log("decodedText:", decodedText);
      // console.log("decodedResult:", decodedResult);

      console.log("pubkey:", burner?.publicKey.toBase58());
      if (!burner?.publicKey) {
        console.log("no pubkey found");
        return;
      }

      // if (isLoading) {
      //   console.log("isLoading");
      //   return;
      // }
      // setIsLoading(true);

      // html5QrcodeScanner.pause(true);
      // html5QrcodeScanner.clear();

      try {
        const url = parseURL(decodedText);
        // console.log("solana pay uri:", url);

        if (!!(url as TransactionRequestURL)?.link) {
          // (url as TransactionRequestURL)
          prepareTransaction(async () => {
            if (isTransactionSheetOpen) {
              console.log("[prepareTransaction] sheet is open");
            }

            const solanaPayData = await proxySolanaPayRequest(
              (url as TransactionRequestURL).link,
              burner.publicKey.toBase58(),
            );

            // html5QrcodeScanner.resume();

            return {
              transaction: solanaPayData.post.transaction,
              error: solanaPayData.post.error,
              payload: {
                __ID: "SolanaPay_Transaction",
                ...solanaPayData,
              },
            };
          });

          // html5QrcodeScanner.pause(true);
        } else {
          toast.error("SolanaPay transfer requests are not supported yet");
          // (url as TransferRequestURL)
          // alert("transfer request");
        }
      } catch (err) {}

      // todo: try to read a qr code that is a solana address
      // try {
      //   const address = getSolanaAddress(decodedText);
      //   alert(`address:${address.toBase58()}`);

      //   return;
      // } catch (err) {}

      // todo: handle burner code urls natively
    },
    [burner, isTransactionSheetOpen],
  );

  useEffect(() => {
    try {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "scanner",
        qrScannerConfig,
        false, // verbose
      );
      console.log("render the qr scanner");

      html5QrcodeScanner.render(onQRScanSuccess, onQRScanError);

      // cleanup function when component will unmount
      return () => {
        html5QrcodeScanner.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      };
    } catch (err) {}
  }, [burner]);

  // if (loading) {
  //   return (
  //     <DefaultLayout seo={seo}>
  //       <main className="container max-w-lg py-10 space-y-8 text-center md:py-20">
  //         <h1 className="text-4xl">Loading burner wallet</h1>
  //         <LoadingSpinner visible={true} width={70} className="mx-auto" />
  //       </main>
  //     </DefaultLayout>
  //   );
  // }

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-4xl text-center">Scan QR code</h1>

            {/* <p className="text-center text-gray-500">on Solana {cluster}</p> */}
          </section>

          <div
            className={`p-3 overflow-hidden card md:min-w-[400px] md:min-h-[475px]`}
            // onClick={() =>
            //   prepareTransaction(async () => {
            //     const transaction = await createTransfer(
            //       connection,
            //       burner!.publicKey,
            //       {
            //         recipient: new PublicKey(
            //           "GQuioVe2yA6KZfstgmirAvugfUZBcdxSi7sHK7JGk3gk",
            //         ),
            //         amount: BigNumber(12.0) as any,
            //         splToken: undefined, // or PublicKey of a token's mint
            //         reference: undefined, // or PublicKey[]
            //         // label: undefined,
            //         // message: undefined,
            //         memo: "this is the memo text for this solana pay transaction",
            //       },
            //     );

            //     return {
            //       transaction,
            //     };
            //   })
            // }
          >
            {/* <Html5QrcodePlugin qrCodeSuccessCallback={onQRScanSuccess} /> */}
            <div id="scanner">
              <p className="text-xl text-center">Unable to locate camera</p>
            </div>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}
