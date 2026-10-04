"use client";

import { useId, useState } from "react";
import {
  GROUP_LABEL,
  GROUP_ORDER,
  type RecordGroup,
  type YearRow,
} from "@/lib/companies";

/**
 * Records per year, stacked by group. Validated categorical palette (light
 * surface): purple, gold, red, blue in fixed order. Gold sits under 3:1 on
 * white, so the table view below is not optional.
 */
const COLOR: Record<RecordGroup, string> = {
  enforcement: "#8a5bb8",
  recall: "#d19900",
  legal: "#d64533",
  corporate: "#2e86c1",
};

const W = 720;
const H = 220;
const PAD = { top: 28, right: 8, bottom: 28, left: 32 };
const BAR = 22;
const GAP = 2;
const RADIUS = 4;

type Hover = {
  year: string;
  group: RecordGroup;
  n: number;
  x: number;
  y: number;
} | null;

export function RecordChart({ rows }: { rows: YearRow[] }) {
  const id = useId();
  const [hover, setHover] = useState<Hover>(null);
  const total = (r: YearRow) => GROUP_ORDER.reduce((n, g) => n + r[g], 0);
  const max = Math.max(1, ...rows.map(total));
  const step = max > 40 ? 20 : max > 16 ? 10 : max > 8 ? 5 : 2;
  const yMax = Math.ceil(max / step) * step;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / rows.length;
  const scale = (v: number) => (v / yMax) * plotH;
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);

  return (
    <figure className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-serif text-lg font-medium text-plum">
          Records per year
        </span>
        <ul
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/75"
          aria-label="Legend"
        >
          {GROUP_ORDER.map((g) => (
            <li key={g} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-sm"
                style={{ background: COLOR[g] }}
              />
              {GROUP_LABEL[g]}
            </li>
          ))}
        </ul>
      </figcaption>

      <div className="relative mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[560px]"
          role="img"
          aria-labelledby={`${id}-title`}
          onPointerLeave={() => setHover(null)}
        >
          <title id={`${id}-title`}>
            Stacked columns of dated records per year, by group. Values are in
            the table below.
          </title>
          {ticks.map((v) => {
            const y = PAD.top + plotH - scale(v);
            return (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="#e7e3ee"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill="#6b6577"
                >
                  {v}
                </text>
              </g>
            );
          })}
          {rows.map((r, i) => {
            const x = PAD.left + slot * i + (slot - BAR) / 2;
            let yCursor = PAD.top + plotH;
            const tot = total(r);
            const segs = GROUP_ORDER.filter((g) => r[g] > 0);
            return (
              <g key={r.year}>
                {segs.map((g, si) => {
                  const h = scale(r[g]);
                  const top = segs.length - 1 === si;
                  const y = yCursor - h;
                  yCursor = y - GAP;
                  const hh = h;
                  const path = top
                    ? `M${x},${y + hh} V${y + RADIUS} a${RADIUS},${RADIUS} 0 0 1 ${RADIUS},-${RADIUS} H${x + BAR - RADIUS} a${RADIUS},${RADIUS} 0 0 1 ${RADIUS},${RADIUS} V${y + hh} Z`
                    : `M${x},${y} h${BAR} v${hh} h-${BAR} Z`;
                  const active = hover?.year === r.year && hover.group === g;
                  return (
                    <path
                      key={g}
                      d={path}
                      fill={COLOR[g]}
                      opacity={hover && !active ? 0.55 : 1}
                      tabIndex={0}
                      aria-label={`${r.year}: ${r[g]} ${GROUP_LABEL[g].toLowerCase()}`}
                      onPointerEnter={() =>
                        setHover({
                          year: r.year,
                          group: g,
                          n: r[g],
                          x: x + BAR / 2,
                          y,
                        })
                      }
                      onFocus={() =>
                        setHover({
                          year: r.year,
                          group: g,
                          n: r[g],
                          x: x + BAR / 2,
                          y,
                        })
                      }
                      onBlur={() => setHover(null)}
                      style={{ outline: "none" }}
                    />
                  );
                })}
                {/* transparent hit area covering the whole column */}
                <rect
                  x={PAD.left + slot * i}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => {
                    const g = segs.at(-1);
                    if (g)
                      setHover({
                        year: r.year,
                        group: g,
                        n: r[g],
                        x: x + BAR / 2,
                        y: yCursor + GAP,
                      });
                  }}
                  pointerEvents={segs.length ? "all" : "none"}
                />
                {tot > 0 && (
                  <text
                    x={x + BAR / 2}
                    y={yCursor + GAP - 5}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#33303a"
                  >
                    {tot}
                  </text>
                )}
                <text
                  x={x + BAR / 2}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b6577"
                >
                  {rows.length > 12 && i % 2 === 1 ? "" : r.year}
                </text>
              </g>
            );
          })}
        </svg>

        {hover && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-md"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
              marginTop: -8,
            }}
          >
            <p className="font-semibold text-ink">{hover.year}</p>
            {GROUP_ORDER.map((g) => {
              const row = rows.find((r) => r.year === hover.year)!;
              return (
                <p
                  key={g}
                  className="mt-0.5 flex items-center gap-2 text-ink/80"
                >
                  <span
                    aria-hidden
                    className="inline-block h-0.5 w-3"
                    style={{ background: COLOR[g] }}
                  />
                  <span
                    className={
                      g === hover.group ? "font-semibold text-ink" : ""
                    }
                  >
                    {row[g]}
                  </span>
                  <span className="text-muted">{GROUP_LABEL[g]}</span>
                </p>
              );
            })}
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-plum-500 underline-offset-4 hover:underline">
          Table view
        </summary>
        <table className="mt-2 w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[10px] font-medium tracking-wide text-muted uppercase">
              <th scope="col" className="py-1.5 pr-3">
                Year
              </th>
              {GROUP_ORDER.map((g) => (
                <th key={g} scope="col" className="py-1.5 pr-3 text-right">
                  {GROUP_LABEL[g]}
                </th>
              ))}
              <th scope="col" className="py-1.5 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.year}>
                <th
                  scope="row"
                  className="py-1.5 pr-3 font-mono font-normal text-ink"
                >
                  {r.year}
                </th>
                {GROUP_ORDER.map((g) => (
                  <td
                    key={g}
                    className="py-1.5 pr-3 text-right tabular-nums text-ink/80"
                  >
                    {r[g]}
                  </td>
                ))}
                <td className="py-1.5 text-right font-semibold tabular-nums text-ink">
                  {total(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
