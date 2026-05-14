import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUrl(s: string): boolean {
  const trimmed = s.trim();
  if (trimmed.includes(" ") || trimmed.includes("\n")) return false;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return /\.[a-z]{2,}$/i.test(url.hostname);
  } catch {
    return false;
  }
}
