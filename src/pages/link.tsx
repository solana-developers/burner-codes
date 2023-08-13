import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { FormEvent, useCallback, useState } from "react";

import { useGlobalContext } from "@/contexts/GlobalContext";
import Link from "next/link";
import { toast } from "react-hot-toast";
import base58 from "bs58";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { LAMPORTS_PER_SIGNER } from "@/utils/const";
import {
  explorerURL,
  formatLamportsToSol,
  saveClaimCode,
} from "@/utils/helpers";

import TransferLinkCreated from "@/components/transfers/TransferLinkCreated";
import SuccessDialog from "@/components/dialogs/SuccessDialog";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "transfer SOL tokens",
  description:
    "Quickly transfer SOL tokens to different burner wallets and Solana addresses.",
};

// define the success dialog details to be displayed
const dialogDetails = {
  title: "Claim Link Created",
  description: "Your claim link successfully created.",
};

export default function Page() {
  const {
    // comment for better diffs
    burner,
    balance,
    cluster,
    connection,
    setBalance,
  } = useGlobalContext();

  // track the form state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0.01);

  const [processing, setProcessing] = useState<boolean>(false);
  const [claimLink, setClaimLink] = useState<string>(
    "",
    // "http://localhost:3000/claim/vXnCWwu7CaGSkPBK64ftQZRtYoZqJYBTU2J8ER6H49UGBooh3XfB14Q7aHTGq8BXXMBCotMXobMNWTEQVMQaLyZ",
  );
  const [explorerLink, setExplorerLink] = useState<string>("");

  // helper function to handle displaying errors
  function displayError(message: string) {
    toast.error(message);
    setProcessing(false);
    return false;
  }

  /**
   * Handle the form submission to process the transfer request
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setProcessing(true);

      // ensure there is a current valid burner wallet
      if (!burner?.publicKey)
        return displayError("Unable to locate your burner wallet");

      // generate a new keypair for the claim link
      const claimKeypair = Keypair.generate();
      let publicKey = claimKeypair.publicKey;

      try {
        // create the transfer instruction
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: burner.publicKey,
            toPubkey: publicKey,
            lamports: amount * LAMPORTS_PER_SOL + LAMPORTS_PER_SIGNER,
          }),
        );

        /**
         * todo: handle the "max" transfer
         * - check for transfer to match the burner's balance
         * - if so, account for closing the account
         * - then also generate a new burner
         */

        // send the tokens to the address
        const sig = await sendAndConfirmTransaction(connection, tx, [burner], {
          commitment: "max",
        });
        if (!sig) throw Error("Transaction failed");

        // compute the explorer link for the transaction
        const sigLink = explorerURL({ sig, cluster });
        console.log("View on Explorer:", sigLink);
        setExplorerLink(sigLink);

        // get the claim wallet's balance
        const claimBalance = await connection.getBalance(publicKey);
        console.log("claim balance:", claimBalance);

        // use a timer to allow the transaction to be propagated
        setTimeout(async () => {
          // compute the full canonical claim link
          const claimLink = `${location.protocol}//${
            location.host
          }/claim/${base58.encode(claimKeypair.secretKey)}`;

          // save the claim code to the user's local storage
          saveClaimCode(base58.encode(claimKeypair.secretKey), cluster);

          console.log("claim link created:", claimLink);
          setClaimLink(claimLink);

          /**
           * todo: record all the user generated claim links in the users local storage
           * this will allow the link creator to track if their link has been claimed,
           * and easily reclaim the tokens if the person does not claim them
           */

          setDialogOpen(true);

          /**
           * todo: confirmations are a bit slow
           * so if the claim link creator opens the link before the transactions is propagated,
           * then it may appear that the claim link is empty
           * fix this!
           *
           * this might look like a loading spinner on the success dialog?
           * or some sort of extra checks before showing the claim link
           */

          // optimistically update the global burner's balance
          setBalance(balance - amount * LAMPORTS_PER_SOL - LAMPORTS_PER_SIGNER);

          // finally, return a simple success message
          toast.success(`Created a claim link for ${amount} SOL!`);

          setProcessing(false);
        }, 1_000);
      } catch (err) {
        console.error(err);
        displayError("Unable to perform the SOL transfer");
      }
    },
    [amount, burner, balance, setBalance],
  );

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-4xl text-center">Transfer via Link</h1>

            <p className="text-center text-gray-500">on Solana {cluster}</p>
          </section>

          <form
            action=""
            method="POST"
            onSubmit={handleSubmit}
            className="relative grid h-full gap-3 p-6"
          >
            <section className="grid gap-1">
              <label
                htmlFor="amount"
                className="flex items-center justify-between"
              >
                <span className="font-semibold">Amount (in SOL):</span>
                <span>max: ~{formatLamportsToSol(balance)}</span>
              </label>
              <div>
                {/* <button
                  type="button"
                  className="absolute font-semibold right-6"
                  onClick={() => setAmount(balance / LAMPORTS_PER_SOL)}
                >
                  max
                </button> */}

                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder={"Amount to transfer..."}
                  className="w-full"
                  autoFocus={true}
                  autoComplete="off"
                  max={balance / LAMPORTS_PER_SOL}
                  value={amount}
                  disabled={processing}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                />
              </div>
            </section>

            <section className="grid justify-between w-full grid-cols-1 gap-2 mt-4 text-center">
              <button
                type="submit"
                className="w-full btn btn-dark"
                // onClick={() => ()}
                disabled={processing}
              >
                Create claim link
              </button>

              <p>or</p>

              <Link href="/transfer" className="btn btn-outline">
                Send to Address
              </Link>
            </section>
          </form>
        </section>
      </main>

      <SuccessDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        explorerLink={explorerLink}
        title={dialogDetails.title}
        description={
          <>
            Share this claim link or QR code to send{" "}
            <span className="underline">{amount}</span> SOL.
          </>
        }
      >
        <TransferLinkCreated claimLink={claimLink} />
      </SuccessDialog>
    </DefaultLayout>
  );
}
