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
      <h2 style={{ marginBottom: "0.5rem" }}>Ready for interactive work later</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {summary}
      </p>

      <button
        type="button"
        className="button"
        onClick={() => setExpanded((current) => !current)}
        style={{ marginTop: "0.6rem" }}
      >
        {expanded ? "Hide migration rules" : "Show migration rules"}
      </button>

      {expanded && (
        <ol style={{ marginTop: "1rem", paddingLeft: "1.1rem" }}>
          {steps.map((step) => (
            <li key={step} style={{ marginBottom: "0.55rem" }}>
              {step}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
