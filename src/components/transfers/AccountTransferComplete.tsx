"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import partyIcon from "@/../public/party-popper.svg";
import Image from "next/image";

type ComponentProps = SimpleComponentProps & {
  cluster: any;
  explorerLink: string;
  setExplorerLink: any;
};

export default function AccountTransferComplete({
  cluster,
  explorerLink,
  setExplorerLink,
}: ComponentProps) {
  return (
    <main className="container max-w-lg py-10 space-y-8 md:py-20">
      <section className="grid gap-14">
        <section className="space-y-2">
          <h1 className="text-4xl text-center">Transfer Complete!</h1>

          <p className="text-center text-gray-500">on Solana {cluster}</p>
        </section>

        <Image
          className="block mx-auto text-center"
          src={partyIcon}
          width={128}
          height={128}
          alt="🎉"
        />

        <div className="grid gap-3 mx-auto">
          <Link
            target="_blank"
            href={explorerLink}
            className="inline-flex items-center gap-3 px-10 btn btn-dark"
          >
            View on Solana Explorer
            <ArrowRightIcon className="w-5 h-5 text-white" />
          </Link>

          <button
            onClick={() => setExplorerLink("")}
            className="inline-flex items-center gap-3 mx-auto whitespace-nowrap w-min btn btn-outline"
          >
            Perform another transfer
          </button>
        </div>
      </section>
    </main>
  );
}
