import { BRAND_NAME } from "@irossini/core";

export function TopBar() {
  return (
    <header className="flex items-center gap-2 px-6 py-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-transparent.png" alt="" className="h-7 w-7" />
      <span className="font-display text-sm font-semibold text-brand-tinta">{BRAND_NAME}</span>
    </header>
  );
}
