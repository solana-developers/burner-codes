import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  // configure the title settings
  title: "burner.codes",
  titleTemplate: `burner.codes - %s`,
  defaultTitle: "burner.codes",
  description:
    "Simple burner wallets for the Solana blockchain. No app. No download. Just your open your browser and use it.",

  // social media card data
  openGraph: {
    site_name: "burner.codes",
    locale: "en_US",
    type: "website",
    url: "https://burner.codes/",
    images: [
      {
        url: "https://burner.codes/simple-og.png",
        width: 1600,
        height: 900,
        alt: "burner.codes",
      },
    ],
  },
  twitter: {
    site: `@solana_devs`,
    handle: `@nickfrosty`,
    cardType: "summary_large_image",
  },
};

export default config;
