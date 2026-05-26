export default function IconNetworking({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clean line-intersect symbol for networking */}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="36" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="16" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="20" x2="32" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="20" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}





