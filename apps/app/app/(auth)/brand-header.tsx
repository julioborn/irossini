export function BrandHeader({ title }: { title: string }) {
  return (
    <div className="mb-10 flex flex-col items-center">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full bg-brand-green-500/25 blur-2xl"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-transparent.png" alt="" className="relative h-16 w-16" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-brand-tinta">{title}</h1>
    </div>
  );
}
