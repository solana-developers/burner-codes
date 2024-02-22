/**
 * Random helper functions
 */

import { Cluster, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LOCAL_STORAGE_CLAIM_CODE } from "./const";

/**
 * helper function to format lamports as SOL
 */
export function formatLamportsToSol(
  lamports: number,
  showUnits: boolean = true,
) {
  return `${new Intl.NumberFormat(undefined, {
    minimumSignificantDigits: 3,
  }).format(
    lamports / LAMPORTS_PER_SOL > 0 ? lamports / LAMPORTS_PER_SOL : 0,
  )}${showUnits ? " SOL" : ""}`;
}

/**
 *
 */
export function copyToClipboard(text: string) {
  // create a temporary box, and stop the viewport scrolling
  var box = document.createElement("textarea");
  box.value = text;
  // box.setAttribute("id", "")
  document.body.appendChild(box);
  box.style.top = "0";
  box.style.left = "0";
  box.style.position = "fixed";

  // select the text in the box and copy it
  box.focus();
  box.select();
  box.setSelectionRange(0, 99999);
  document.execCommand("copy");

  box.remove();

  return true;
}

/**
 * Compute the Solana explorer address for the various data
 */
export function explorerURL({
  address,
  sig,
  cluster = "devnet",
}: {
  address?: string;
  sig?: string;
  cluster?: Cluster;
}) {
  let baseUrl: string;

  // set the base url, based on the input data
  if (address) baseUrl = `https://explorer.solana.com/address/${address}`;
  else if (sig) baseUrl = `https://explorer.solana.com/tx/${sig}`;
  else return "[unknown]";

  // auto append the desired search params
  const url = new URL(baseUrl);
  url.searchParams.append("cluster", cluster);
  return url.toString() + "\n";
}

/**
 * Save a single claim code into the local storage
 */
export function saveClaimCode(code: string, cluster: Cluster) {
  // read in the current claim codes
  let claimCodes = getSavedClaimCodesFromStorage();

  // add the new claim code into the listing
  claimCodes.push({
    code,
    cluster,
  });

  saveClaimCodesToStorage(claimCodes);
}

/**
 * Remove a single claim code from the local storage
 */
export function removeClaimCode(code: string, cluster: Cluster) {
  // read in the current claim codes
  let claimCodes = getSavedClaimCodesFromStorage();

  // remove the selected code from the listing
  claimCodes = claimCodes.filter((record) => record.code !== code);

  // todo: make this also take the cluster value into account

  saveClaimCodesToStorage(claimCodes);
}

// simple type for a listing of claim codes and their clusters
export type ClaimCodeRecords = Array<{
  cluster: Cluster;
  code: string;
}>;

/**
 * read in the current claim codes
 */
function getSavedClaimCodesFromStorage() {
  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_CLAIM_CODE) || "[]",
  ) as ClaimCodeRecords;
}

/**
 * save the new code into the local storage key
 *
 * todo: should this perform an integrity check to make sure the data was correctly stored?
 */
function saveClaimCodesToStorage(records: ClaimCodeRecords) {
  localStorage.setItem(LOCAL_STORAGE_CLAIM_CODE, JSON.stringify(records));
}
