"use client";

import { useRouter } from "next/navigation";

export default function ClickableListItem({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <li onClick={() => router.push(href)} className={`cursor-pointer ${className}`}>
      {children}
    </li>
  );
}
