export default function SuccessCheck() {
  return (
    <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
        <CheckIcon />
      </span>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
