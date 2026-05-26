export default function IconAward({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Elegant star badge seal */}
      <path
        d="M24 4L28.5 16.5L41 18L31.5 26.5L33.5 39L24 32L14.5 39L16.5 26.5L7 18L19.5 16.5L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}





