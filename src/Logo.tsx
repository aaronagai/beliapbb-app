import logoRaw from "../assets/logo.svg?raw";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  /** When true, hides from assistive tech (paired visible text or decorative use). */
  decorative?: boolean;
  alt?: string;
};

export function Logo({ className = "", width, height, decorative, alt }: LogoProps) {
  const classes = ["logo-mark", className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      style={
        width != null || height != null
          ? { width: width ?? "auto", height: height ?? "auto" }
          : undefined
      }
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
      aria-hidden={decorative ? true : undefined}
      dangerouslySetInnerHTML={{ __html: logoRaw }}
    />
  );
}
