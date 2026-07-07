export default function Cursor({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l7 18 3.5-7.5L21 10z" fill="currentColor" />
      <path d="M13.5 13.5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
