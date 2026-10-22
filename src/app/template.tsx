// Re-mounts on every navigation, so each page change plays a soft fade-in.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade flex flex-1 flex-col">{children}</div>;
}
