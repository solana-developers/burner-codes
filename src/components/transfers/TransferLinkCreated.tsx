"use client";

import { copyToClipboard } from "@/lib/helpers";
import QRCodeCard from "../QRCodeCard";
import { toast } from "react-hot-toast";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

type ComponentProps = SimpleComponentProps & {
  claimLink: string;
};

// static label for reuse
const MESSAGE_CLAIM_LINK_COPY = "Copied claim link to clipboard!";

export default function TransferLinkCreated({ claimLink }: ComponentProps) {
  return (
    <section className="grid items-center w-full gap-3 mx-auto align-middle">
      <QRCodeCard
        value={claimLink}
        className="text-center md:max-w-[400px] w-min mx-auto !border-transparent"
        onClick={() =>
          copyToClipboard(claimLink) && toast.success(MESSAGE_CLAIM_LINK_COPY)
        }
      />

      <section
        className="relative flex items-center w-full gap-1 mx-auto align-middle"
        onClick={() =>
          copyToClipboard(claimLink) && toast.success(MESSAGE_CLAIM_LINK_COPY)
        }
      >
        <textarea
          readOnly
          disabled
          name="claimLink"
          value={claimLink}
          autoFocus={false}
          className="w-full md:h-24 min-h-[64px] max-h-28 !bg-gray-100"
        />
      </section>

      <section className="grid w-full gap-2">
        <button
          type="button"
          className="flex items-center justify-center order-1 w-full gap-2 md:order-2 btn btn-dark"
          onClick={() =>
            copyToClipboard(claimLink) && toast.success(MESSAGE_CLAIM_LINK_COPY)
          }
        >
          <DocumentDuplicateIcon className="w-5" />
          Copy Claim Link
        </button>
      </section>
    </section>
  );
}
