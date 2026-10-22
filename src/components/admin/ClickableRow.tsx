"use client";

import { useRouter } from "next/navigation";

export default function ClickableRow({
  href,
  className = "",
  off = false,
  children,
}: {
  href: string;
  className?: string;
  /** Row is switched off: greys every cell except the on/off switch. */
  off?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      data-off={off}
      className={`cursor-pointer border-b border-ash/10 last:border-0 hover:bg-paper data-[off=true]:[&>td:not(:has([role=switch]))]:opacity-60 ${className}`}
    >
      {children}
    </tr>
  );
}
