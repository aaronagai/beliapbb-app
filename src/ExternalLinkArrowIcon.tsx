type ExternalLinkArrowIconProps = {
  className?: string;
};

/** Small northeast ↗ arrow for inline external-link affordance. */
export function ExternalLinkArrowIcon({ className }: ExternalLinkArrowIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17 17 7M17 7h-7M17 7v7"
      />
    </svg>
  );
}
