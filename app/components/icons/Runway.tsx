export default function Runway({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h12M4 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
