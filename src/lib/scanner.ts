/**
 * Assorted helper for use with Solana Pay and other QR code based scanning functionality
 */

import { PublicKey } from "@solana/web3.js";
import {
  Html5QrcodeScanType,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { getSolanaAddress } from "./solana/helpers";
import {
  parseURL,
  TransactionRequestURL,
  TransferRequestURL,
} from "@solana/pay";

/**
 * QR code scanner config
 */
export const qrScannerConfig: Html5QrcodeScannerConfig = {
  fps: 25,
  qrbox: { width: 275, height: 275 },
  supportedScanTypes: [
    Html5QrcodeScanType.SCAN_TYPE_CAMERA,
    Html5QrcodeScanType.SCAN_TYPE_FILE,
  ],
  // videoConstraints: {}
};

/**
 * Handle the error message provided by the QR code scanner
 */
export const onQRScanError: QrcodeErrorCallback = (errorMessage) => {
  // do nothing for errors
  // console.warn("err:", err);
};

/**
 * Handle a successfully decoded QR code scan
 */
export const onQRScanSuccess: QrcodeSuccessCallback = (
  decodedText,
  decodedResult,
) => {
  console.log("decodedText:", decodedText);
  console.log("decodedResult:", decodedResult);

  try {
    const url = parseURL(decodedText);
    console.log(url);

    if (!!(url as TransactionRequestURL)?.link) {
      // (url as TransactionRequestURL)
      alert("transaction request");
    } else {
      // (url as TransferRequestURL)
      alert("transfer request");
    }
  } catch (err) {}

  // try to read a qr code that is a solana address
  try {
    const address = getSolanaAddress(decodedText);
    alert(`address:${address.toBase58()}`);

    return;
  } catch (err) {}

  // todo: handle burner code urls natively

  // try {
  //   const url = new URL(decodedText);

  //   console.log("URL found:", url);

  //   // handle solana pay urls
  //   if (url.protocol.toLowerCase().replace(/:$/gi, "") == "solana") {
  //     alert("solana pay!!");
  //   }

  //   // todo: handle burner code urls natively

  //   // todo: what other urls should we handle

  //   return;
  // } catch (err) {
  //   // console.log();
  // }
};
