"use client";

import styles from "@/styles/Card.module.css";

type ComponentProps = SimpleComponentProps;

export default function SimpleCard({
  children,
  className = "",
}: SimpleComponentProps) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
