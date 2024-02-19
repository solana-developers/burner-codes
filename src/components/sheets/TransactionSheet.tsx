import { toast } from "react-hot-toast";
import { Children, memo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { formatLamportsToSol } from "@/lib/helpers";
import { shortWalletAddress } from "@/lib/utils";
import Image from "next/image";

import solanaIconBlack from "@/../public/logos/solana-icon-black.svg";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

type ComponentProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  transaction?: Transaction | VersionedTransaction | "temp";
};

export const TransactionSheet = memo(
  ({ isOpen, setIsOpen }: ComponentProps) => {
    const {
      // comment for better diffs
      cluster,
      connection,
      burner,
    } = useGlobalContext();

    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={"bottom"}
          className="border border-gray-500 space-y-5 max-w-lg mx-[4px] bg-white shadow rounded-t-xl md:mx-auto"
        >
          <SheetHeader>
            <SheetTitle className="inline-flex items-center gap-2 cursor-default">
              <Image
                alt="Solana"
                src={solanaIconBlack}
                width={28}
                className="w-6 h-6"
              />
              Solana Transaction
            </SheetTitle>
          </SheetHeader>

          <section className="space-y-1 text-center">
            <div className="mx-auto bg-gray-200 rounded-md w-22 h-22"></div>
            <h3 className="text-xl font-medium">Page title</h3>
            <p className="text-sm text-gray-500">site.com</p>
          </section>

          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>

          <section className="space-y-2">
            <TransactionLineItemGroup>
              <TransactionLineItem
                label={"From"}
                value={
                  "you"
                  // <>You ({shortWalletAddress(burner!.publicKey.toBase58(), 6)})</>
                }
              />
            </TransactionLineItemGroup>
            <TransactionLineItemGroup>
              <TransactionLineItem label={"Solana network"} value={cluster} />
              <TransactionLineItem
                label={"Network Fee"}
                value={formatLamportsToSol(10_000)}
              />
            </TransactionLineItemGroup>
          </section>

          <section className="flex items-center justify-between gap-2">
            <button type="button" className="w-full btn btn-outline">
              Cancel
            </button>
            <button type="button" className="w-full btn btn-dark">
              Send
            </button>
          </section>
        </SheetContent>
      </Sheet>
    );
  },
);

export const TransactionLineItem = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between p-3 bg-slate-200">
    <label className="font-medium text-black whitespace-nowrap">{label}</label>
    <p className="text-gray-800 font-base line-clamp-1">{value}</p>
  </div>
);

export const TransactionLineItemGroup = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden divide-y divide-white rounded-md">
    {children}
  </div>
);
