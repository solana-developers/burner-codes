"use client";

import { CameraIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

type ComponentProps = {};

export default function AppHeader({}: ComponentProps) {
  return (
    <header className="container py-2">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={"/logo.svg"}
            width={32}
            height={32}
            alt="burner.codes logo"
            blurDataURL="/logo.svg"
          />
          <span className="inline-block text-2xl font-semibold tracking-tight lowercase">
            burner.codes
          </span>
        </Link>

        {/* <button className="flex items-center gap-2 btn btn-outline">
          <CameraIcon className="w-5 h-5" />
          <span className="">Scan</span>
        </button> */}
      </nav>
    </header>
  );
}
