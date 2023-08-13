import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { DefaultSeo } from "next-seo";
import SEO from "@/../next-seo.config";
import { GlobalContextProvider } from "@/contexts/GlobalContext";
import { Toaster } from "react-hot-toast";

import { Inter } from "next/font/google";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ErrorIcon } from "react-hot-toast";

const font = Inter({
  subsets: ["latin"],
  variable: "--font-theme",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalContextProvider>
      <Toaster
        position="bottom-center"
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          // className: "w-full",
          // className: "bg-blue-500 text-white",
          icon: <InformationCircleIcon className="w-6 h-6" />,

          // Default options for specific types
          success: {
            className: "text-black",
            icon: <InformationCircleIcon className="w-6 h-6 text-green-600" />,
          },
          error: {
            className: "!bg-red-500 !text-white",
            icon: <ErrorIcon className="w-6 h-6" />,
          },
          loading: {
            className: "bg-blue-500 text-white",
          },
        }}
      />

      <style jsx global>
        {`
          :root {
            --font-theme: ${font.style.fontFamily};
          }
        `}
      </style>
      <DefaultSeo {...SEO} />

      <Component {...pageProps} />
    </GlobalContextProvider>
  );
}
