import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  // configure the title settings
  title: "burner.codes",
  titleTemplate: `burner.codes - %s`,
  defaultTitle: "burner.codes",
  description: "",

  // social media card data
  openGraph: {
    site_name: "burner.codes",
    locale: "en_US",
    type: "website",
    url: "https://burner.codes/",
    images: [
      {
        url: "https://burner.codes/logo.png",
        // width: 256,
        // height: 256,
        alt: "burner.codes",
      },
    ],
  },
  twitter: {
    site: `@solana_devs`,
    handle: `@nickfrosty`,
    cardType: "summary",
    // cardType: "summary_large_image",
  },
};

export default config;
