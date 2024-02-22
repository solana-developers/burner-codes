import { onQRScanError, qrScannerConfig } from "@/lib/scanner";
import { useEffect } from "react";

import {
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
  Html5QrcodeScanner,
} from "html5-qrcode";

const qrcodeRegionId = "scanner";

type Html5QrcodePluginProps = {
  verbose?: boolean;
  qrCodeErrorCallback?: QrcodeErrorCallback;
  qrCodeSuccessCallback: QrcodeSuccessCallback;
};

const Html5QrcodePlugin = ({
  verbose = false,
  qrCodeErrorCallback = onQRScanError,
  qrCodeSuccessCallback,
}: Html5QrcodePluginProps) => {
  useEffect(() => {
    // when component mounts
    // const verbose = verbose === true;
    // Success callback is required.
    if (!qrCodeSuccessCallback) {
      throw "qrCodeSuccessCallback is required callback.";
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      qrScannerConfig,
      verbose,
    );
    html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};

export default Html5QrcodePlugin;
