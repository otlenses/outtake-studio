"use client";

export default function StopClick({ children }: { children: React.ReactNode }) {
  return <span onClick={(e) => e.stopPropagation()}>{children}</span>;
}
