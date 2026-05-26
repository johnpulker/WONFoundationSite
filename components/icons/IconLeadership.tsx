export default function IconLeadership({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized women silhouette monogram */}
      <path
        d="M24 8C20.7 8 18 10.7 18 14C18 17.3 20.7 20 24 20C27.3 20 30 17.3 30 14C30 10.7 27.3 8 24 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 40V32C16 28.7 18.7 26 22 26H26C29.3 26 32 28.7 32 32V40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 20V26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}





