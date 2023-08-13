import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import { NextSeo, NextSeoProps } from "next-seo";

type LayoutProps = {
  children: React.ReactNode;
  seo?: NextSeoProps;
};

export default function DefaultLayout({ children, seo }: LayoutProps) {
  return (
    <>
      <NextSeo {...seo} />

      <AppHeader />

      {children}

      <AppFooter />
    </>
  );
}
