// "use client";

import Dialog, { type DialogProps } from "@/components/Dialog";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import partyIcon from "@/../public/party-popper.svg";
import Link from "next/link";
import Image from "next/image";

type ComponentProps = DialogProps & {
  explorerLink: string;
};

export default function SuccessDialog({
  // comment for better diffs
  isOpen,
  setIsOpen,
  explorerLink,
  title,
  description,
  children,
}: ComponentProps) {
  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen} className="max-w-[500px]">
      <section className="grid gap-10 p-8">
        <section className="space-y-2">
          <h1 className="text-4xl text-center">{title}</h1>

          {!!description && (
            <p className="text-center text-gray-500">{description}</p>
          )}
        </section>

        {!!children ? (
          children
        ) : (
          <Image
            className="block mx-auto text-center"
            src={partyIcon}
            width={128}
            height={128}
            alt="🎉"
          />
        )}
      </section>

      <div className="grid gap-3 p-2 mx-auto text-center md:grid-cols-2">
        <button onClick={() => setIsOpen(false)} className="btn btn-outline">
          Close
        </button>
        <Link
          target="_blank"
          href={explorerLink}
          className="inline-flex items-center justify-center gap-3 btn btn-dark"
        >
          View on Explorer
          <ArrowRightIcon className="w-5 h-5 text-white" />
        </Link>
      </div>
    </Dialog>
  );
}
