import { Check } from "lucide-react";
import { useI18n } from "./i18n";

/** Where the applicant is after submitting: sent → sign → done. Static; no motion. */
export function ApplicationSteps({ signed }: { signed: boolean }) {
  const { t } = useI18n();
  const steps = [
    { label: t("stepSent"), state: "done" },
    { label: t("stepSign"), state: signed ? "done" : "current" },
    { label: t("stepDone"), state: signed ? "done" : "todo" },
  ] as const;
  return (
    <ol className="application-steps" aria-label={t("stepsAria")}>
      {steps.map((s, i) => (
        <li key={s.label} className="application-step" data-state={s.state} aria-current={s.state === "current" ? "step" : undefined}>
          <span className="application-step-dot" aria-hidden>
            {s.state === "done" ? <Check size={12} strokeWidth={3} /> : i + 1}
          </span>
          <span className="application-step-label">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
