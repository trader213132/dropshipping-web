import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${id}` : id;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const keySet = new Set(keys as string[]);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keySet.has(k)),
  ) as Omit<T, K>;
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const group = String(item[key]);
      acc[group] = acc[group] ?? [];
      acc[group]!.push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}
