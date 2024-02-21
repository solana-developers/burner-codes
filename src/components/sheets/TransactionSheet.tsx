import { toast } from "react-hot-toast";
import { memo, useCallback, useMemo } from "react";
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
import { TransactionDetails } from "@/types";

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
      transactionDetails,
    } = useGlobalContext();

    const ComponentToShow: React.ReactNode = useMemo(() => {
      if (transaction && transactionDetails) {
        console.log("transaction found:", transaction);
        return (
          <SignTransactionDetails
            transaction={transaction}
            transactionDetails={transactionDetails}
          />
        );
      }

      //
      return <></>;
    }, [transaction, loading]);

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
            ComponentToShow
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

export const SignTransactionDetails = memo(
  ({
    transaction,
    transactionDetails,
  }: {
    transaction: Transaction | VersionedTransaction;
    transactionDetails: TransactionDetails;
  }) => {
    const {
      // comment for better diffs
      cluster,
      connection,
      burner,
      resetPopup,
    } = useGlobalContext();

    /**
     *
     */
    const signAndSendTransaction = useCallback(async () => {
      if (!burner) {
        throw Error("No wallet found");
      }

      // force the transaction into a versioned transaction
      if (transaction instanceof Transaction) {
        transaction = new VersionedTransaction(transaction.compileMessage());
      }

      // console.log(
      //   "isValid before:",
      //   await connection.isBlockhashValid(
      //     transaction.message.recentBlockhash,
      //   ),
      // );

      // todo: add the ability to add compute budget instructions

      // detect if the user is the only signer to replace the blockhash
      if (
        transaction.message.header.numRequiredSignatures == 1 &&
        transaction.message.staticAccountKeys[0].equals(burner.publicKey)
      ) {
        // replace the blockhash when the user's wallet is the only signer
        const blockhash = await connection.getLatestBlockhashAndContext();
        transaction.message.recentBlockhash = blockhash.value.blockhash;
        // todo: add error handling around getting the recent blockhash
      }

      // const simulation = await connection.simulateTransaction(transaction. {
      //   // accounts:
      // });
      // console.log("simulation");
      // console.log(simulation);

      // console.log(
      //   "isValid after:",
      //   await connection.isBlockhashValid(
      //     transaction.message.recentBlockhash,
      //   ),
      // );

      transaction.sign([burner]);
      console.log("signed transaction");
      console.log(transaction);

      try {
        const sig = await connection.sendTransaction(transaction, {
          maxRetries: 5,
        });

        console.log("signature:\n", sig);
        toast.success(`yay: ${sig}`);
        resetPopup();
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);

        toast.error("Failed to send transaction");
        console.error(err);
      }
    }, [connection, burner, transaction]);

    return (
      <>
        {/* <SolanaPayHeader
          title={"title"}
          url={new URL("https://site.com").hostname}
        /> */}

        {/* <TransactionHeaderTransfer label={"Transfer SOL"} /> */}
        {/* <SheetDescription>Display a message here?</SheetDescription> */}

        <section className="space-y-2">
          <TransactionLineItemGroup>
            <TransactionLineItem
              label={"From"}
              value={
                burner?.publicKey.equals(transactionDetails.feePayer)
                  ? `You (${shortWalletAddress(
                      transactionDetails.feePayer.toBase58(),
                      6,
                    )})`
                  : shortWalletAddress(
                      transactionDetails.feePayer.toBase58(),
                      6,
                    )
              }
            />
            {!!transactionDetails.memo && (
              <TransactionLineItem
                isMultiLine={true}
                label={"Memo"}
                value={transactionDetails.memo}
              />
            )}
          </TransactionLineItemGroup>
          <TransactionLineItemGroup>
            <TransactionLineItem label={"Solana network"} value={cluster} />
            <TransactionLineItem
              label={"Network Fee"}
              value={`~${formatLamportsToSol(transactionDetails.fee)}`}
            />
          </TransactionLineItemGroup>
        </section>
        <section className="flex items-center justify-between gap-2">
          <button
            onClick={() => resetPopup()}
            type="button"
            className="w-full btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => signAndSendTransaction()}
            className="w-full btn btn-dark"
          >
            Confirm
          </button>
        </section>
      </>
    );
  },
);

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
