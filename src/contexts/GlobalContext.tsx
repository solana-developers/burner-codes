import {
  createContext,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Cluster,
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import { LOCAL_STORAGE_BURNER_KEY } from "@/lib/const";
import { TransactionSheet } from "@/components/sheets/TransactionSheet";

export interface MasterConfigurationState {
  connection: Connection;
  loading: boolean;
  setLoading(loading: SetStateAction<boolean>): void;
  burner: Keypair | undefined;
  setBurner(keypair: SetStateAction<Keypair | undefined>): void;
  balance: number;
  setBalance(balance: SetStateAction<number>): void;
  cluster: Cluster;
  setCluster(cluster: SetStateAction<Cluster>): void;
  minRentCost: number;
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
  ) => Promise<void>;
  prepareTransaction: (resolve: PrepareTransactionResolver) => void;
  resetPopup: () => void;
  // isTransactionSheetOpen: boolean;
  // setIsTransactionSheetOpen(loading: SetStateAction<boolean>): void;
}

export const GlobalContext = createContext<MasterConfigurationState>(
  {} as MasterConfigurationState,
);

export function useGlobalContext(): MasterConfigurationState {
  return useContext(GlobalContext);
}

export const GlobalContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [burner, setBurner] = useState<Keypair | undefined>();
  const [cluster, setCluster] = useState<Cluster>("devnet");
  const [balance, setBalance] = useState<number>(0);

  const [transaction, setTransaction] = useState<
    Transaction | VersionedTransaction | null
  >(null);
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] =
    useState<boolean>(false);

  // current base rent for 0 bytes is: 890_880 lamports
  const [minRentCost, setMinRentCost] = useState<number>(890_880);

  const connection = new Connection(clusterApiUrl(cluster));

  //   const [networkConfiguration, setNetworkConfiguration] = useLocalStorage(
  //     "network",
  //     "devnet",
  //   );

  /**
   * Get or set a keypair from the local storage
   */
  useEffect(() => {
    let burner: Keypair = Keypair.generate();

    // get the current keypair from local storage
    const currentValue = localStorage.getItem(LOCAL_STORAGE_BURNER_KEY);
    // console.log("local storage:", current);

    // process the current keypair and
    if (!!currentValue) {
      try {
        // parse the keypair from local storage
        burner = Keypair.fromSecretKey(base58.decode(currentValue));

        // console.log("burner address:", burner.publicKey.toBase58());
      } catch (err) {
        console.warn("Invalid keypair found in local storage");
      }
    }

    // set/update the local storage keypair (when needed)
    if (currentValue !== base58.encode(burner.secretKey)) {
      localStorage.setItem(
        LOCAL_STORAGE_BURNER_KEY,
        base58.encode(burner.secretKey),
      );

      /**
       * todo: should this overwrite like this?
       * there could be an edge case that results in overwriting useful data set in the storage
       */
    }

    // load any initial state via async/await
    (async () => {
      // get the price of rent exempt
      const rentCost = await connection.getMinimumBalanceForRentExemption(0);
      setMinRentCost(rentCost);
    })();

    // set the keypair to the state
    setBurner(burner);
  }, []);

  /**
   * Sync the various state variables
   */
  async function syncState() {
    if (!burner) return;
    console.log("Syncing the state with the blockchain...");

    // get the current balance
    const balance = await connection.getBalance(burner.publicKey);
    setBalance(balance);

    console.log("Sync complete.");
  }

  /**
   * Send a transaction to the user and request their approval/signature
   */
  const sendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction) => {
      console.log("[sendTransaction]", transaction);

      // todo: pre parse the transaction?

      setTransaction(transaction);
      setIsTransactionSheetOpen(true);
      setLoading(false);
    },
    [setIsTransactionSheetOpen, setTransaction, setLoading],
  );

  /**
   * Prepare a transaction and request the user sign it
   */
  const prepareTransaction = useCallback(
    async (resolver: PrepareTransactionResolver) => {
      console.log("[prepareTransaction]");

      setLoading(true);
      setIsTransactionSheetOpen(true);

      try {
        const { transaction, error } = await resolver();

        // todo: we should support some sort of error/warning messages to provide to a user

        if (!!error) {
          alert(`Error: ${error}`);
        }

        if (transaction) {
          sendTransaction(transaction);
        } else {
          alert("no transaction...");
        }
      } catch (err) {
        // todo: we should support some sort of error/warning messages to provide to a user
        console.error("Unable to resolve transaction");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [setIsTransactionSheetOpen, setLoading, sendTransaction],
  );

  /**
   *
   */
  const resetPopup = useCallback(() => {
    setTransaction(null);
    setLoading(false);
    setIsTransactionSheetOpen(false);
  }, [
    transaction,
    isTransactionSheetOpen,
    setIsTransactionSheetOpen,
    setLoading,
  ]);

  /**
   * Get the initial state data for the keypair/cluster
   */
  useEffect(() => {
    // do nothing when there is not a keypair found
    if (!burner) return;

    setLoading(true);

    (async () => {
      // call the initial state sync
      await syncState();

      // monitor for account changes on the burner keypair to refresh the state when desired
      connection.onAccountChange(burner.publicKey, syncState, "max");

      setLoading(false);
    })();
  }, [burner?.publicKey.toBase58(), cluster]);

  return (
    <GlobalContext.Provider
      value={{
        connection,
        loading,
        setLoading,
        burner,
        setBurner,
        balance,
        setBalance,
        cluster,
        setCluster,
        minRentCost,
        sendTransaction,
        prepareTransaction,
        resetPopup,
      }}
    >
      {children}

      <TransactionSheet
        transaction={transaction}
        isOpen={isTransactionSheetOpen}
        setIsOpen={setIsTransactionSheetOpen}
      />
    </GlobalContext.Provider>
  );
};

/**
 * function that resolves a promise containing a payload for the transaction sheet
 */
type PrepareTransactionResolver =
  () => Promise<PrepareTransactionResolverPayload>;

type PrepareTransactionResolverPayload = {
  /** the transaction for the user to sign */
  transaction?: Transaction | VersionedTransaction;

  /** error message and data to be displayed in the UI */
  error?: string;

  /** payload with additional details for the UI */
  payload?: object;
};
