import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a short string wallet address for UI display
 */
export function shortWalletAddress(text: string = "", length: number = 5) {
  let str = `${text.substring(0, length)}...`;

  if (text.length > length * 2)
    str = `${str}${text.substring(text.length - length)}`;

  return str;
}
