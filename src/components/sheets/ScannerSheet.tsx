import { toast } from "react-hot-toast";
import { memo, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Html5QrcodeScanner } from "html5-qrcode";
import { onQRScanError, onQRScanSuccess, qrScannerConfig } from "@/lib/scanner";

type ComponentProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ScannerSheet = memo(({ isOpen, setIsOpen }: ComponentProps) => {
  const openScanner = useCallback(() => {
    try {
      const scanner = new Html5QrcodeScanner(
        "scanner",
        qrScannerConfig,
        false, // verbose
      );

      scanner.render(onQRScanSuccess, onQRScanError);
    } catch (err) {
      console.info(err);
    }
  }, [isOpen]);

  // const { ref } = useInView({
  //   // threshold: 0,
  //   onChange(inView, entry) {
  //     console.log("inView:", inView);
  //     // if (inView && isOpen) openScanner();
  //   },
  // });

  // useEffect(() => {
  //   console.log("ref:", ref);

  //   return () => {};
  // }, [ref]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={"bottom"}
        className="border space-y-2 border-gray-500 max-w-lg mx-[4px] bg-white shadow rounded-t-xl md:mx-auto"
      >
        <SheetHeader className="pb-3">
          <SheetTitle>Scan QR Code</SheetTitle>
          {/* <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription> */}
        </SheetHeader>

        <div
          onClick={openScanner}
          className="overflow-hidden min-w-[400px] min-h-[475px]"
        >
          <div id="scanner">
            <button
              type="button"
              onClick={openScanner}
              className="btn btn-dark"
            >
              Open Camera to Scan
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});
