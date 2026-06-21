import { useMemo, useRef, useState, useEffect } from "react";
import { CalendarDays, CloudRain, FlaskConical, Flame, Grid3x3, Thermometer } from "lucide-react";
import { useDataStore } from "../store/useDataStore";
import { getMaxCellCount } from "../utils/dataProcess";
import { dateInRange, fmtDateFull, fmtDateShort } from "../utils/dateUtils";
import type { MatrixCellData } from "../types";

export default function TrapDateMatrix() {
  const { matrix, setSelectedExportRange, selectedExportRange, overview } = useDataStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  const [selecting, setSelecting] = useState<{
    active: boolean;
    startCol: number;
    endCol: number;
  }>({ active: false, startCol: -1, endCol: -1 });
  const [hover, setHover] = useState<{
    cell: MatrixCellData;
    x: number;
    y: number;
  } | null>(null);

  const max = useMemo(() => getMaxCellCount(matrix), [matrix]);

  const selection = useMemo(() => {
    if (selecting.active) {
      const a = Math.min(selecting.startCol, selecting.endCol);
      const b = Math.max(selecting.startCol, selecting.endCol);
      return [a, b] as const;
    }
    if (selectedExportRange) {
      const [from, to] = selectedExportRange;
      const a = matrix.columns.findIndex((c) => dateInRange(c, from, c));
      const b = matrix.columns.findIndex((c) => dateInRange(to, to, c));
      const trueA = a >= 0 ? a : matrix.columns.findIndex((c) => c >= from);
      const trueB =
        b >= 0
          ? b
          : matrix.columns.reduce(
              (acc, c, i) => (c <= to ? i : acc),
              -1
            );
      if (trueA >= 0 && trueB >= 0) {
        return [Math.min(trueA, trueB), Math.max(trueA, trueB)] as const;
      }
    }
    return null;
  }, [selecting, selectedExportRange, matrix.columns]);

  useEffect(() => {
    const sync = () => {
      if (headRef.current && scrollRef.current) {
        headRef.current.scrollLeft = scrollRef.current.scrollLeft;
      }
    };
    const el = scrollRef.current;
    el?.addEventListener("scroll", sync);
    return () => el?.removeEventListener("scroll", sync);
  }, []);

  function onColMouseDown(colIdx: number) {
    setSelecting({ active: true, startCol: colIdx, endCol: colIdx });
    setSelectedExportRange(null);
  }
  function onColMouseEnter(colIdx: number) {
    if (selecting.active) {
      setSelecting((s) => ({ ...s, endCol: colIdx }));
    }
  }
  function onColMouseUp() {
    if (selecting.active) {
      const a = Math.min(selecting.startCol, selecting.endCol);
      const b = Math.max(selecting.startCol, selecting.endCol);
      const cols = matrix.columns;
      if (cols[a] && cols[b]) {
        setSelectedExportRange([cols[a], cols[b]]);
      }
      setSelecting({ active: false, startCol: -1, endCol: -1 });
    }
  }
  useEffect(() => {
    function up() {
      onColMouseUp();
    }
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecting]);

  function cellBg(cell: MatrixCellData | null) {
    if (!cell) return "bg-ink-50/40";
    if (cell.isSurge) {
      return "bg-gradient-to-br from-alert-400 to-alert-600 text-white surge-glow ring-2 ring-alert-200";
    }
    if (cell.count === 0) return "bg-ink-100/60 text-ink-400";
    const t = Math.min(1, cell.count / Math.max(1, max));
    // 从淡plant到深plant的色阶
    const stops = [
      [239, 246, 243],
      [215, 234, 225],
      [175, 213, 196],
      [126, 185, 161],
      [82, 154, 126],
      [45, 106, 79],
    ];
    const idx = Math.min(stops.length - 1, Math.floor(t * (stops.length - 1)));
    const [r, g, b] = stops[idx];
    const textDark = idx >= stops.length - 2;
    return {
      bg: `rgb(${r}, ${g}, ${b})`,
      cls: textDark ? "text-white" : "text-ink-800",
    };
  }

  function selectionBg(colIdx: number) {
    if (!selection) return "";
    const [a, b] = selection;
    if (colIdx >= a && colIdx <= b) return "bg-plant-500/10 ring-y-1 ring-plant-400";
    return "";
  }

  const weekSeparators: number[] = [];
  for (let i = 1; i < matrix.columns.length; i++) {
    const cur = new Date(matrix.columns[i]).getDay();
    if (cur === 1) weekSeparators.push(i);
  }

  const surgeCount = matrix.cells.reduce(
    (s, row) => s + row.filter((c) => c?.isSurge).length,
    0
  );

  return (
    <section
      className="reveal stagger-5 card-surface flex flex-col p-5 h-full"
      onMouseLeave={() => setHover(null)}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Grid3x3 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">
              灯号 × 日期 · 诱捕量矩阵
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                在列标题区域按住鼠标 <kbd className="rounded bg-ink-100 px-1 font-mono text-[10px]">拖拽</kbd> 可选择导出日期区间
              </span>
              <span className="mx-2 text-ink-300">·</span>
              红色单元格 = 该灯较上周同日骤升 ≥ 50%
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-ink-50 text-ink-600">
            <CalendarDays className="h-3 w-3" />
            {matrix.columns.length} 天
          </span>
          <span className="chip bg-ink-50 text-ink-600">
            {matrix.rows.length} 灯
          </span>
          <span className="chip bg-alert-50 text-alert-700 ring-1 ring-alert-200">
            <Flame className="h-3 w-3" />
            {surgeCount} 次骤升
          </span>
          {selectedExportRange && (
            <span className="chip bg-plant-100 text-plant-700 ring-1 ring-plant-200">
              已选 {selectedExportRange[0]} ~ {selectedExportRange[1]}
            </span>
          )}
        </div>
      </div>

      {matrix.columns.length === 0 || matrix.rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-ink-400">
          暂无符合筛选条件的数据
        </div>
      ) : (
        <div className="relative -mx-5 border-y border-ink-100">
          {/* 悬浮提示 */}
          {hover && (
            <div
              className="pointer-events-none fixed z-50 w-64 rounded-xl bg-ink-900/95 text-xs text-white shadow-pop ring-1 ring-white/10 p-3"
              style={{
                left: hover.x + 12,
                top: hover.y + 12,
              }}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-mono font-bold">{hover.cell.trapId}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-plant-200">
                  {matrix.districtOfTrap[hover.cell.trapId]}
                </span>
              </div>
              <p className="mb-2 text-ink-300">{fmtDateFull(hover.cell.date)}</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-ink-300">
                    <Flame className="h-3 w-3 text-pest-400" />
                    诱捕量
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {hover.cell.count.toLocaleString()} 头
                  </span>
                </div>
                {hover.cell.record && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-ink-300">
                        <Thermometer className="h-3 w-3 text-amber-400" />
                        平均气温
                      </span>
                      <span className="font-mono tabular-nums">
                        {Number.isFinite(hover.cell.record.avgTemp)
                          ? `${hover.cell.record.avgTemp.toFixed(1)} ℃`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-ink-300">
                        <CloudRain className="h-3 w-3 text-sky-400" />
                        降雨
                      </span>
                      <span className="font-semibold">
                        {hover.cell.record.isRaining === 1 ? "是" : "否"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-ink-300">
                        <FlaskConical className="h-3 w-3 text-violet-400" />
                        施药
                      </span>
                      <span className="font-semibold">
                        {hover.cell.record.isPesticide === 1 ? "是" : "否"}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {hover.cell.isSurge && (
                <div className="mt-2 rounded-md bg-alert-500/80 px-2 py-1 text-center text-[11px] font-bold">
                  ⚠ 该日较上周同日骤升 50%+
                </div>
              )}
            </div>
          )}

          {/* 头部行（日期） */}
          <div
            ref={headRef}
            className="overflow-hidden border-b border-ink-200 bg-ink-50/80 backdrop-blur"
          >
            <div
              className="flex select-none"
              style={{ minWidth: `calc(200px + ${matrix.columns.length * 44}px)` }}
            >
              <div
                className="sticky left-0 z-10 flex shrink-0 items-end justify-center bg-ink-50/95 px-3 py-2"
                style={{ width: 200 }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  诱虫灯编号
                </span>
              </div>
              <div className="flex">
                {matrix.columns.map((d, i) => {
                  const inWeek = weekSeparators.includes(i);
                  const day = new Date(d).getDay();
                  const weekend = day === 0 || day === 6;
                  return (
                    <div
                      key={d}
                      onMouseDown={() => onColMouseDown(i)}
                      onMouseEnter={() => onColMouseEnter(i)}
                      className={`matrix-cell group relative shrink-0 cursor-col-resize border-y border-transparent py-2 text-center transition-colors ${
                        selectionBg(i)
                      } ${inWeek ? "border-l border-dashed border-ink-300" : ""} ${
                        weekend ? "bg-rose-50/50" : ""
                      } hover:bg-plant-100/40`}
                      style={{ width: 44 }}
                      title="拖拽以选择日期区间"
                    >
                      <div className="font-mono text-[10px] font-semibold text-ink-400 tabular-nums">
                        {fmtDateShort(d).slice(0, 2)}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-bold text-ink-700 tabular-nums">
                        {fmtDateShort(d).slice(3)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 主体 */}
          <div
            ref={scrollRef}
            className="max-h-[520px] overflow-auto bg-white"
          >
            <div style={{ minWidth: `calc(200px + ${matrix.columns.length * 44}px)` }}>
              {matrix.rows.map((rowName, ri) => {
                const dist = matrix.districtOfTrap[rowName] ?? "";
                return (
                  <div
                    key={rowName}
                    className={`flex border-b border-ink-100 ${
                      ri % 2 ? "bg-ink-50/20" : ""
                    } hover:bg-plant-50/30`}
                  >
                    <div
                      className="sticky left-0 z-[1] flex shrink-0 items-center gap-2 border-r border-ink-100 bg-white px-3 py-1.5 shadow-[2px_0_4px_-2px_rgba(15,23,42,.08)]"
                      style={{ width: 200 }}
                    >
                      <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                        {dist}
                      </span>
                      <span className="truncate font-mono text-sm font-bold text-ink-800 tabular-nums">
                        {rowName}
                      </span>
                    </div>
                    <div className="flex">
                      {matrix.columns.map((d, ci) => {
                        const cell = matrix.cells[ri][ci];
                        const inWeek = weekSeparators.includes(ci);
                        const weekend = (() => {
                          const wd = new Date(d).getDay();
                          return wd === 0 || wd === 6;
                        })();
                        const bg = cellBg(cell);
                        const bgStr = typeof bg === "string" ? bg : "";
                        const bgObj = typeof bg === "object" ? bg : null;
                        return (
                          <div
                            key={d}
                            onMouseEnter={(e) => {
                              onColMouseEnter(ci);
                              if (cell) {
                                const rect = (
                                  e.currentTarget as HTMLElement
                                ).getBoundingClientRect();
                                setHover({
                                  cell,
                                  x: rect.right,
                                  y: rect.top,
                                });
                              }
                            }}
                            onMouseLeave={() => setHover(null)}
                            className={`matrix-cell relative shrink-0 border-y border-transparent ${selectionBg(
                              ci
                            )} ${inWeek ? "border-l border-dashed border-ink-200" : ""} ${
                              weekend && !cell?.isSurge ? "bg-rose-50/40" : ""
                            }`}
                            style={{
                              width: 44,
                              height: 34,
                              backgroundColor: bgObj?.bg,
                            }}
                          >
                            <div
                              className={`absolute inset-1 flex items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                                bgObj?.cls ?? (cell ? "" : "")
                              } ${bgStr ? "" : ""}`}
                            >
                              {cell ? (
                                cell.count
                              ) : (
                                <span className="text-ink-300">·</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 图例 */}
          <div className="border-t border-ink-100 bg-ink-50/50 px-5 py-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-500">
              <span className="font-semibold text-ink-600">色阶图例：</span>
              <div className="flex items-center gap-1">
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(239, 246, 243)" }}
                />
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(215, 234, 225)" }}
                />
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(175, 213, 196)" }}
                />
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(126, 185, 161)" }}
                />
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(82, 154, 126)" }}
                />
                <span
                  className="h-4 w-6 rounded"
                  style={{ backgroundColor: "rgb(45, 106, 79)" }}
                />
                <span className="ml-1">
                  低 → 高（上限 {max.toLocaleString()}）
                </span>
              </div>
              <span className="mx-1 h-4 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-4 w-6 rounded-md bg-gradient-to-br from-alert-400 to-alert-600 ring-1 ring-alert-200" />
                骤升（相较上周同日）
              </span>
              <span className="mx-1 h-4 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-4 w-6 rounded bg-rose-50 border border-rose-100" />
                周末
              </span>
              <span className="mx-1 h-4 w-px bg-ink-200" />
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-4 w-px border-l border-dashed border-ink-400" />
                周分隔（周一）
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
