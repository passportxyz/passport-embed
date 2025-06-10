export const RightArrow = ({ className, invertColors }: { className?: string; invertColors?: boolean }) => (
  <svg className={className} width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 11L7 6L1 1"
      stroke={invertColors ? "rgb(var(--color-background-c6dbf459))" : "rgb(var(--color-primary-c6dbf459))"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
