import type { NextSeoProps } from "next-seo";
import DefaultLayout from "@/layouts/default";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import type { InferGetServerSidePropsType } from "next";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import QRCodeCard from "@/components/QRCodeCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import {
  copyToClipboard,
  explorerURL,
  formatLamportsToSol,
  removeClaimCode,
} from "@/utils/helpers";
import base58 from "bs58";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { LAMPORTS_PER_SIGNER } from "@/utils/const";
import SuccessDialog from "@/components/dialogs/SuccessDialog";

// define page specific seo settings
const seo: NextSeoProps = {
  title: "claim SOL tokens via a burner link",
  description: "Claim SOL tokens from a burner code wallet.",
};

// define the success dialog details to be displayed
const dialogDetails = {
  title: "Claim Successful",
  description: "You have successfully claimed SOL!",
};

export async function getServerSideProps({
  params: { claimCode },
}: {
  params: { claimCode: string[] };
}) {
  // console.log("claimCode:", claimCode);

  // ensure a claim code was found
  if (!(Array.isArray(claimCode) && claimCode.length > 0)) {
    return {
      redirect: {
        // comment for better diffs
        statusCode: 301,
        destination: "/",
      },
    };
    return {
      notFound: true,
    };
  }

  // create a cluster connection
  const connection = new Connection(clusterApiUrl("devnet"));

  // todo: add support for multiple clusters

  // init a keypair to parse
  let keypair: Keypair;

  try {
    // create a keypair from the claim code
    keypair = Keypair.fromSecretKey(base58.decode(claimCode[0]));

    //
    // console.log("claim pubkey:", keypair.publicKey.toBase58());
  } catch (err) {
    return {
      notFound: true,
    };
  }

  // get the lamport balance of the claim account
  const balance = await connection.getBalance(keypair.publicKey);

  return {
    props: {
      claim: {
        claimKey: base58.encode(keypair.secretKey),
        balance,
        address: keypair.publicKey.toBase58(),
        link: "todo: claim link via props",
      },
    },
  };
}

export default function Page({
  claim,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { burner, cluster, connection } = useGlobalContext();

  // decode the claim key as a keypair
  const claimKeypair = Keypair.fromSecretKey(base58.decode(claim.claimKey));

  // track the needed state for any form data
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Simple helper function for the copy to clipboard with a message
  function copyClaimLink() {
    if (!location?.href) return toast.error("Unable to locate claim link");
    copyToClipboard(location.href);
    toast.success("Copied claim link to clipboard!");
  }

  // helper function to handle displaying errors
  function displayError(message: string) {
    toast.error(message);
    setProcessing(false);
    return false;
  }

  /**
   * Handler function to claim all funds in the claim account
   * (to the provided address)
   */
  const handleClaim = useCallback(
    async (address: string) => {
      setProcessing(true);

      console.info(
        "Attempting to claim to:",
        address,
        address == burner?.publicKey.toBase58() ? "(your burner wallet)" : "",
      );

      // validate the provided `address`
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(address);
      } catch (err) {
        console.error(err);
        return displayError("Invalid address");
      }

      if (publicKey.toBase58() !== address)
        return displayError("Invalid address");

      if (!burner?.publicKey) return displayError("Invalid burner keypair");

      try {
        // create the transfer instruction
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: claimKeypair.publicKey,
            toPubkey: publicKey,
            // transfer the full balance, less a "1 signer tx fee" cost
            lamports: claim.balance - LAMPORTS_PER_SIGNER,
          }),
        );

        // send the tokens to the address
        const sig = await sendAndConfirmTransaction(connection, tx, [
          claimKeypair,
        ]);
        if (!sig) throw Error("Transaction failed");

        // remove this claim code from storage
        console.log("key:", claim.claimKey);
        removeClaimCode(claim.claimKey, cluster);

        // compute the explorer link for the transaction
        const sigLink = explorerURL({ sig, cluster });
        console.log("View on Explorer:", sigLink);
        setExplorerLink(sigLink);

        // finally, display a simple success message
        toast.success(
          `Claimed ${formatLamportsToSol(
            claim.balance - LAMPORTS_PER_SIGNER,
          )}!`,
        );

        setDialogOpen(true);

        // empty the claim balance to update the ui
        claim.balance = 0;
      } catch (err) {
        console.error(err);
        displayError("Unable to perform the SOL transfer");
      }

      setProcessing(false);
    },
    [claim, burner],
  );

  // handle empty claim codes
  if (claim.balance <= 0 && !dialogOpen) {
    return (
      <DefaultLayout seo={seo}>
        <main className="container max-w-lg py-10 space-y-8 md:py-20">
          <section className="grid gap-6 text-center">
            <h1 className="text-4xl text-center">Empty Claim Link</h1>

            <p className="text-xl text-gray-500">
              This claim link has no balance and is no longer valid.
            </p>

            <div className="text-center">
              <Link
                href={"/"}
                className="inline-flex items-center gap-3 px-10 btn btn-dark"
              >
                View Your Burner Wallet
                <ArrowRightIcon className="w-5 h-5 text-white" />
              </Link>
            </div>
          </section>
        </main>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout seo={seo}>
      <main className="container max-w-lg py-10 space-y-8 md:py-20">
        <section className="space-y-6">
          <section className="space-y-2">
            <p className="text-2xl text-center text-gray-500">Claim</p>

            <h1 className="text-4xl text-center">
              {formatLamportsToSol(claim.balance - LAMPORTS_PER_SIGNER)}
            </h1>

            <p className="text-center text-gray-500">on Solana {cluster}</p>
          </section>

          <section className="grid gap-3">
            <button
              type="button"
              className="btn btn-dark"
              onClick={(e) => {
                e.preventDefault();
                handleClaim(burner?.publicKey.toBase58() || "");
              }}
              disabled={processing}
            >
              Claim to Burner Wallet
            </button>

            {/* <p className="text-sm text-center text-gray-500">
              {claim.address}
            </p> */}
          </section>

          <QRCodeCard
            value={claim.link}
            className="max-w-[400px] w-min mx-auto"
            onClick={() => copyClaimLink()}
          />

          <section className="mx-auto my-5 text-2xl text-center ">
            <h5 className="my-8">or</h5>
          </section>

          <section className="grid gap-4">
            <section className="grid gap-1 text-center">
              <label htmlFor="address" className="text-lg font-semibold">
                Claim directly to a Solana address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder={"Enter a Solana address or name..."}
                className="w-full text-center"
                autoFocus={false}
                autoComplete="off"
                value={address}
                disabled={processing}
                onChange={(e) => setAddress(e.target.value)}
              />
            </section>

            <button
              type="button"
              disabled={processing}
              className="btn btn-dark"
              onClick={() => handleClaim(address)}
            >
              Claim to Address
            </button>
          </section>
        </section>
      </main>

      <SuccessDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        explorerLink={explorerLink}
        title={dialogDetails.title}
        description={dialogDetails.description}
        // description={
        //   <>
        //     You have successfully claimed{" "}
        //     <span className="font-bold">
        //       {formatLamportsToSol(claim.balance - LAMPORTS_PER_SIGNER)}
        //     </span>
        //     .
        //   </>
        // }
      ></SuccessDialog>
    </DefaultLayout>
  );
}
