export default function Runway({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#7C3AED" />
      <path d="M6 8h12M6 12h12M6 16h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
