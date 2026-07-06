export default function ClaudeAi({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#7C3AED" />
      <circle cx="12" cy="12" r="4" fill="white" />
    </svg>
  );
}
