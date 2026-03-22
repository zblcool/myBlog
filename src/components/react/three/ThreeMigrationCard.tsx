import { useMemo, useState } from "react";

type Props = {
  steps: string[];
};

export default function ThreeMigrationCard({ steps }: Props) {
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(
    () =>
      "Future 3D work will live in isolated React components so the rest of the site can remain lightweight and portable.",
    [],
  );

  return (
    <section className="migration-card">
      <div className="eyebrow">Three.js Lane</div>
      <h2>Ready for interactive work later</h2>
      <p className="muted">{summary}</p>

      <button
        type="button"
        className="button migration-card__toggle"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "Hide migration rules" : "Show migration rules"}
      </button>

      {expanded && (
        <ol className="migration-card__steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
