import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { explorerURL, formatLamportsToSol } from "@/utils/helpers";

import { useGlobalContext } from "@/contexts/GlobalContext";
import { toast } from "react-hot-toast";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { LAMPORTS_PER_SIGNER } from "@/utils/const";
import { useRouter } from "next/router";
import Link from "next/link";
import SuccessDialog from "@/components/dialogs/SuccessDialog";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "transfer SOL tokens to a Solana address",
  description:
    "Quickly transfer SOL tokens to different burner wallets and Solana addresses.",
};

// define the success dialog details to be displayed
const dialogDetails = {
  title: "Transfer Successful",
  description: "Your transfer was successfully completed!",
};

export default function Page() {
  const router = useRouter();
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
  const [explorerLink, setExplorerLink] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0.01);
  const [address, setAddress] = useState<string>("");

  // set the initial form data based on the query params
  useEffect(() => {
    const { to, amount } = router.query;
    if (!!to) setAddress(to.toString());
    if (!!amount) setAmount(parseFloat(amount.toString()));
  }, [router.query]);

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

      // validate the address
      let publicKey: PublicKey | null = null;

      // validate the user provided address is valid
      try {
        if (!address) return displayError("Solana address required");
        publicKey = new PublicKey(address);

        // todo: add support for solana names
      } catch (err) {
        console.warn("Unable to parse user provided Solana address");
      }

      // ensure the final public key is valid
      if (!publicKey) return displayError("Invalid Solana address");

      try {
        // create the transfer instruction
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: burner.publicKey,
            toPubkey: publicKey,
            lamports: amount * LAMPORTS_PER_SOL,
          }),
        );

        /**
         * todo: handle the "max" transfer
         * - check for transfer to match the burner's balance
         * - if so, account for closing the account
         * - then also generate a new burner
         */

        // send the tokens to the address
        const sig = await sendAndConfirmTransaction(connection, tx, [burner]);
        if (!sig) throw Error("Transaction failed");

        // compute the explorer link for the transaction
        const sigLink = explorerURL({ sig, cluster });
        console.log("View on Explorer:", sigLink);
        setExplorerLink(sigLink);

        setDialogOpen(true);

        // optimistically update the global burner's balance
        setBalance(balance - amount * LAMPORTS_PER_SOL - LAMPORTS_PER_SIGNER);

        // reset the state
        setAddress("");
        setProcessing(false);

        // finally, return a simple success message
        toast.success(`Sent ${amount} SOL!`);
      } catch (err) {
        console.error(err);
        displayError("Unable to perform the SOL transfer");
      }

      setProcessing(false);
    },
    [address, processing, setProcessing, amount, burner, balance, setBalance],
  );

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <h1 className="text-4xl text-center">Send to Address</h1>

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

            <section className="grid gap-1">
              <label htmlFor="address" className="font-semibold">
                Solana address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder={"Enter any Solana address or name..."}
                className="w-full"
                autoFocus={false}
                autoComplete="off"
                value={address}
                disabled={processing}
                onChange={(e) => setAddress(e.target.value)}
              />
            </section>

            {/* <p className="">
              <label htmlFor="" className="font-semibold">
                Supported Solana names:
              </label>
              <br />
              <span className="pl-4 italic">.sol, .abc, .bonk, .poor</span>
            </p> */}

            <section className="grid justify-between w-full grid-cols-1 gap-2 mt-4 text-center">
              <button
                type="submit"
                className="w-full btn btn-dark"
                // onClick={() => ()}
                disabled={processing}
              >
                Send to Address
              </button>

              <p>or</p>

              <Link href="/link" className="btn btn-outline">
                Send with Link
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
        description={dialogDetails.description}
      ></SuccessDialog>
    </DefaultLayout>
  );
}
