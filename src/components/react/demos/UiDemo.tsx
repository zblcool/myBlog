import { useEffect, useRef, useState } from "react";
import { useInView } from "./hooks";

type Tile = { id: string; label: string; unit: string; base: number; spread: number };

const TILES: Tile[] = [
  { id: "latency", label: "Latency", unit: "ms", base: 120, spread: 60 },
  { id: "requests", label: "Requests", unit: "/s", base: 840, spread: 220 },
  { id: "errors", label: "Error rate", unit: "%", base: 1.2, spread: 1 },
  { id: "users", label: "Active users", unit: "", base: 3200, spread: 500 },
];

const POINTS = 24;

const sample = (tile: Tile) => Math.max(0, tile.base + (Math.random() - 0.5) * tile.spread);

/** Deterministic seed values so server and client markup match. */
const seeded = (tile: Tile, index: number) =>
  Math.max(0, tile.base + Math.sin(index * 1.7 + tile.base) * 0.5 * tile.spread);

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (POINTS - 1)) * 100},${34 - ((v - min) / span) * 30}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function UiDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { visibleRef } = useInView(rootRef);
  const [order, setOrder] = useState(TILES.map((tile) => tile.id));
  const [live, setLive] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [series, setSeries] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(
      TILES.map((tile) => [tile.id, Array.from({ length: POINTS }, (_, index) => seeded(tile, index))]),
    ),
  );

  useEffect(() => {
    if (!live) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (!visibleRef.current) {
        return;
      }
      setSeries((current) =>
        Object.fromEntries(
          TILES.map((tile) => [tile.id, [...current[tile.id].slice(1), sample(tile)]]),
        ),
      );
    }, 900);

    return () => window.clearInterval(timer);
  }, [live, visibleRef]);

  const onMove = (event: React.PointerEvent) => {
    if (!dragging) {
      return;
    }
    const over = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-tile]")?.dataset.tile;

    if (over && over !== dragging) {
      setOrder((current) => {
        const next = [...current];
        next.splice(next.indexOf(dragging), 1);
        next.splice(next.indexOf(over), 0, dragging);
        return next;
      });
    }
  };

  return (
    <div
      className="demo ui-demo"
      ref={rootRef}
      onPointerMove={onMove}
      onPointerUp={() => setDragging(null)}
      onPointerCancel={() => setDragging(null)}
    >
      <div className="ui-demo__bar">
        <span>Live dashboard</span>
        <button type="button" onClick={() => setLive((value) => !value)}>
          {live ? "Pause" : "Resume"}
        </button>
      </div>
      <div className="ui-demo__grid">
        {order.map((id) => {
          const tile = TILES.find((item) => item.id === id)!;
          const values = series[id];
          const latest = values[values.length - 1];

          return (
            <div key={id} data-tile={id} className="ui-tile" data-dragging={dragging === id}>
              <div className="ui-tile__head">
                <span>{tile.label}</span>
                <span
                  className="ui-tile__handle"
                  onPointerDown={(event) => {
                    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
                    setDragging(id);
                  }}
                  aria-label={`Drag ${tile.label}`}
                >
                  ⠿
                </span>
              </div>
              <strong>
                {latest >= 100 ? Math.round(latest).toLocaleString() : latest.toFixed(1)}
                <small>{tile.unit}</small>
              </strong>
              <Sparkline values={values} />
            </div>
          );
        })}
      </div>
      <span className="ui-demo__note">Simulated data · drag ⠿ to reorder</span>
    </div>
  );
}
