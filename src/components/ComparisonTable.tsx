import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ArrowUpRight, Flame, Table2, TrendingDown, TrendingUp } from "lucide-react";
import { useDataStore } from "../store/useDataStore";
import { fmtRate } from "../utils/dataProcess";

type SortKey = "trapId" | "district" | "lastWeekCount" | "thisWeekCount" | "changeRate";
type SortDir = "asc" | "desc";

export default function ComparisonTable() {
  const { comparisons, districts } = useDataStore();
  const [sortKey, setSortKey] = useState<SortKey>("changeRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [surgeOnly, setSurgeOnly] = useState(false);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let arr = [...comparisons];
    if (surgeOnly) arr = arr.filter((r) => r.isSurge);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          r.trapId.toLowerCase().includes(qq) ||
          r.district.toLowerCase().includes(qq)
      );
    }
    arr.sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [comparisons, sortKey, sortDir, surgeOnly, q]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function rateColor(rate: number): string {
    if (rate >= 1) return "bg-alert-500 text-white";
    if (rate >= 0.5) return "bg-alert-100 text-alert-700 ring-1 ring-alert-200";
    if (rate >= 0) return "bg-ink-100 text-ink-700";
    if (rate >= -0.5) return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    return "bg-plant-100 text-plant-700 ring-1 ring-plant-200";
  }

  const surgeTotal = comparisons.filter((c) => c.isSurge).length;
  const activeDistricts = new Set(rows.map((r) => r.district)).size;

  return (
    <section className="reveal stagger-4 card-surface flex flex-col p-5 h-full">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pest-50 text-pest-600 ring-1 ring-pest-100">
            <Table2 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">
              环比变动表 · 本周 vs 上周
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              同灯编号周汇总对比 · 增幅超 50% 标记「骤升」
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索灯号/区县…"
              className="input-base !py-1.5 !pl-8 w-48"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-ink-200 transition hover:bg-alert-50 hover:ring-alert-200">
            <input
              type="checkbox"
              checked={surgeOnly}
              onChange={(e) => setSurgeOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-ink-300 text-alert-600"
            />
            <Flame className="h-3.5 w-3.5 text-alert-500" />
            仅看骤升
          </label>
          <span className="chip bg-alert-50 text-alert-700 ring-1 ring-alert-200">
            <Flame className="h-3 w-3" />
            {surgeTotal} 盏骤升
          </span>
          <span className="chip bg-ink-50 text-ink-600">
            {rows.length} 灯 · {activeDistricts} 区县
          </span>
        </div>
      </div>

      <div className="-mx-5 flex-1 overflow-auto px-5">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <Th label="灯号" k="trapId" onSort={toggleSort} cur={sortKey} dir={sortDir} />
              <Th label="所属区县" k="district" onSort={toggleSort} cur={sortKey} dir={sortDir} />
              <Th label="上周总量" k="lastWeekCount" onSort={toggleSort} cur={sortKey} dir={sortDir} num />
              <Th label="本周总量" k="thisWeekCount" onSort={toggleSort} cur={sortKey} dir={sortDir} num />
              <Th label="环比增幅" k="changeRate" onSort={toggleSort} cur={sortKey} dir={sortDir} num />
              <th className="sticky top-0 th-base text-right">状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-ink-400">
                  暂无数据，请调整筛选条件
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={r.trapId}
                  className={`group transition-colors ${
                    i % 2 ? "bg-white" : "bg-ink-50/40"
                  } hover:bg-plant-50/40`}
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs font-bold text-ink-700 tabular-nums ring-1 ring-ink-200 group-hover:bg-white">
                      {r.trapId}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-plant-50 px-2 py-0.5 text-xs font-semibold text-plant-700 ring-1 ring-plant-100">
                      {r.district}
                    </span>
                  </td>
                  <td className="td-num px-3 py-2.5 text-sm text-ink-500">
                    {r.lastWeekCount.toLocaleString()}
                  </td>
                  <td className="td-num px-3 py-2.5 text-sm font-semibold text-ink-800">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        r.thisWeekCount > r.lastWeekCount ? "text-alert-700" : ""
                      }`}
                    >
                      {r.thisWeekCount.toLocaleString()}
                      {r.thisWeekCount > r.lastWeekCount ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : r.thisWeekCount < r.lastWeekCount ? (
                        <TrendingDown className="h-3.5 w-3.5 text-plant-600" />
                      ) : null}
                    </span>
                  </td>
                  <td className="td-num px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-bold tabular-nums ${rateColor(
                        r.changeRate
                      )}`}
                    >
                      {r.changeRate >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownAZ className="h-3 w-3" />
                      )}
                      {fmtRate(r.changeRate)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {r.isSurge ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-alert-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm surge-glow">
                        <Flame className="h-3 w-3" />
                        骤升
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-ink-500">
                        平稳
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-alert-500" />
          骤升 = 本周总量较上周增幅 ≥ 50%
        </span>
        <span>当前共 {districts.length} 个区县、{comparisons.length} 盏灯</span>
      </p>
    </section>
  );
}

function Th({
  label,
  k,
  onSort,
  cur,
  dir,
  num,
}: {
  label: string;
  k: SortKey;
  onSort: (k: SortKey) => void;
  cur: SortKey;
  dir: SortDir;
  num?: boolean;
}) {
  const active = cur === k;
  return (
    <th
      onClick={() => onSort(k)}
      className={`sticky top-0 cursor-pointer select-none th-base ${
        num ? "text-right" : "text-left"
      } hover:bg-ink-100`}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          num ? "justify-end w-full" : ""
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowDownAZ className="h-3 w-3 text-plant-600" />
          ) : (
            <ArrowUpAZ className="h-3 w-3 text-plant-600" />
          )
        ) : (
          <span className="w-3 opacity-0">▵</span>
        )}
      </span>
    </th>
  );
}
