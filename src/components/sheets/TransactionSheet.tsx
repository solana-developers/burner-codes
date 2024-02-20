import { toast } from "react-hot-toast";
import { memo } from "react";
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
import { LoadingSpinner } from "../LoadingSpinner";

type TransactionSheetProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  transaction?: Transaction | VersionedTransaction | null;
};

export const TransactionSheet = memo(
  ({ isOpen, setIsOpen, transaction }: TransactionSheetProps) => {
    const {
      // comment for better diffs
      // cluster,
      // connection,
      burner,
      loading,
    } = useGlobalContext();

    console.log("transaction::", transaction);

    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={"bottom"}
          className=" max-h-[98vh] overflow-y-auto overflow-x-hidden border border-gray-500 space-y-5 max-w-lg mx-[4px] bg-white shadow rounded-t-xl md:mx-auto"
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

          {!loading && !!burner ? (
            <TransactionSheetInner />
          ) : (
            <section className="mx-auto space-y-1 text-center min-h-[200px] pt-16">
              {/* <h3 className="text-xl font-medium">loading</h3> */}
              <LoadingSpinner visible={true} width={70} className="mx-auto" />
              {/* <p className="text-base text-gray-500">loading...</p> */}
            </section>
          )}
        </SheetContent>
      </Sheet>
    );
  },
);

export const TransactionSheetInner = memo(({}: {}) => {
  const {
    // comment for better diffs
    cluster,
    connection,
    burner,
  } = useGlobalContext();

  return (
    <>
      {/* <SolanaPayHeader
        title={"title"}
        url={new URL("https://site.com").hostname}
      /> */}

      {/* <TransactionHeaderTransfer label={"Transfer SOL"} /> */}

      {/* <SheetDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </SheetDescription> */}

      <section className="space-y-2">
        <TransactionLineItemGroup>
          <TransactionLineItem
            label={"From"}
            value={
              "you"
              // <>You ({shortWalletAddress(burner!.publicKey.toBase58(), 6)})</>
            }
          />
          <TransactionLineItem
            isMultiLine={true}
            label={"Memo"}
            value={"This is an example memo message"}
          />
        </TransactionLineItemGroup>
        <TransactionLineItemGroup>
          <TransactionLineItem label={"Solana network"} value={cluster} />
          <TransactionLineItem
            label={"Network Fee"}
            value={`~${formatLamportsToSol(10_000)}`}
          />
        </TransactionLineItemGroup>
      </section>

      <section className="flex items-center justify-between gap-2">
        <button type="button" className="w-full btn btn-outline">
          Cancel
        </button>
        <button type="button" className="w-full btn btn-dark">
          Confirm
        </button>
      </section>
    </>
  );
});

export const SolanaPayHeader = ({
  title,
  url,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  url: string;
}) => (
  <section className="space-y-1 text-center">
    <div className="mx-auto bg-gray-200 rounded-md w-22 h-22"></div>
    <h3 className="text-xl font-medium">{title}</h3>
    <p className="text-sm text-gray-500">{url}</p>
  </section>
);

export const TransactionHeaderTransfer = ({
  label,
}: {
  label: React.ReactNode;
}) => (
  <section className="py-2 space-y-1 text-center">
    {/* <div className="flex items-center justify-center gap-2">
      <div className="bg-gray-200 rounded-md w-22 h-22"></div>
      <div className="bg-gray-200 rounded-md w-22 h-22"></div>
      <div className="bg-gray-200 rounded-md w-22 h-22"></div>
    </div> */}

    <h3 className="text-xl font-medium">{label}</h3>
    {/* <p className="text-sm text-gray-500">{url}</p> */}
  </section>
);

export const TransactionLineItem = ({
  label,
  value,
  isMultiLine = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  isMultiLine?: boolean;
}) => (
  <div
    className={`p-3 bg-slate-200 ${
      isMultiLine ? "" : "flex items-center justify-between"
    }`}
  >
    <label className={`font-medium text-black whitespace-nowrap`}>
      {label}
    </label>
    <p
      className={`text-gray-800 font-base ${isMultiLine ? "" : "line-clamp-1"}`}
    >
      {value}
    </p>
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
