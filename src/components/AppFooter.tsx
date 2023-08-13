"use client";

import Image from "next/image";
import Link from "next/link";

type ComponentProps = {};

export default function AppFooter({}: ComponentProps) {
  return (
    <footer className="container py-8 text-center">
      <section className="">
        <p className="mb-3 text-sm font-bold lowercase">Powered by</p>

        <section className="flex items-center justify-center gap-3">
          <Link href="https://solana.com">
            <Image
              alt="Solana"
              src={"/logos/solana-logo-black.svg"}
              width={180}
              height={32}
            />
          </Link>
        </section>
      </section>

      <p className="mt-8 text-sm text-gray-500 lowercase">
        Made with love by{" "}
        <Link
          href="https://twitter.com/nickfrosty"
          target="_blank"
          className="underline hover:text-black"
        >
          {/* yes, this is a real name */}
          Nick Frostbutter
        </Link>
        <br />
        and{" "}
        <Link
          href="https://github.com/solana-developers/burner-codes"
          target="_blank"
          className="underline hover:text-black"
        >
          open sourced
        </Link>{" "}
        with more love
      </p>
    </footer>
  );
}
