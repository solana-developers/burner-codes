"use client";

import styles from "@/styles/Card.module.css";
import { QRCodeSVG } from "qrcode.react";
import { MouseEventHandler } from "react";

type ComponentProps = {
  className?: string;
  value?: string;
  size?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export default function QRCodeCard({
  // comment for better diffs
  className,
  value = "",
  size = 256,
  onClick = undefined,
}: ComponentProps) {
  return (
    <div
      className={`${styles.card} ${
        !!onClick && "cursor-pointer"
      } mx-auto text-center ${className || ""}`}
      onClick={onClick}
    >
      <QRCodeSVG
        className="block mx-auto text-center"
        value={value}
        size={size}
        bgColor="#FFF"
        fgColor="#000"
      />
    </div>
  );
}
