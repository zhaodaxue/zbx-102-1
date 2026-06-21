import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  CloudRain,
  FlaskConical,
  MapPin,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import { useDataStore } from "../store/useDataStore";
import { minMaxOfDates } from "../utils/dateUtils";

export default function FilterBar() {
  const {
    filter,
    setFilter,
    resetFilter,
    districts,
    toggleDistrict,
    selectAllDistricts,
    clearDistricts,
    rawRecords,
    lastDateRangeSwapped,
    clearDateRangeSwapFlag,
  } = useDataStore();

  const allDates = rawRecords.map((r) => r.date);
  const [dateMin, dateMax] = minMaxOfDates(allDates);

  const [swapToast, setSwapToast] = useState(false);
  useEffect(() => {
    if (lastDateRangeSwapped) {
      setSwapToast(true);
      const t = setTimeout(() => {
        setSwapToast(false);
        clearDateRangeSwapFlag();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [lastDateRangeSwapped, clearDateRangeSwapFlag]);

  const selectedCount = filter.selectedDistricts.length;
  const allSelected = selectedCount === districts.length;

  const chips = [
    filter.rainOnly && { label: "仅降雨夜", cls: "bg-sky-100 text-sky-700" },
    filter.pesticideWithin3Days && {
      label: "施药后 3 天内",
      cls: "bg-violet-100 text-violet-700",
    },
    selectedCount < districts.length && {
      label: `已选 ${selectedCount}/${districts.length} 区县`,
      cls: "bg-plant-100 text-plant-700",
    },
  ].filter(Boolean) as { label: string; cls: string }[];

  return (
    <section className="reveal stagger-2 card-surface p-5 relative overflow-visible">
      {swapToast && (
        <div className="absolute right-5 -top-3 z-10 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-300 shadow-sm animate-[fade-up_220ms_ease-out]">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 9v4" strokeLinecap="round" />
            <path d="M12 17h.01" strokeLinecap="round" />
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
          </svg>
          起始日期晚于结束日期，已自动交换
          <button
            onClick={() => {
              setSwapToast(false);
              clearDateRangeSwapFlag();
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-black/5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-5">
        <div className="min-w-[260px] flex-1">
          <span className="label">
            <CalendarDays className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            日期区间
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input-base"
              min={dateMin || undefined}
              max={dateMax || undefined}
              value={filter.dateRange?.[0] ?? ""}
              onChange={(e) => {
                const start = e.target.value;
                const end = filter.dateRange?.[1] ?? start;
                setFilter({
                  dateRange: start && end ? [start, end] : null,
                });
              }}
            />
            <span className="text-ink-400">→</span>
            <input
              type="date"
              className="input-base"
              min={dateMin || undefined}
              max={dateMax || undefined}
              value={filter.dateRange?.[1] ?? ""}
              onChange={(e) => {
                const end = e.target.value;
                const start = filter.dateRange?.[0] ?? end;
                setFilter({
                  dateRange: start && end ? [start, end] : null,
                });
              }}
            />
          </div>
        </div>

        <div className="min-w-[280px] flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="label mb-0">
              <MapPin className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
              区县（点击切换，默认全选）
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={selectAllDistricts}
                disabled={allSelected}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-plant-700 transition hover:bg-plant-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckSquare className="h-3 w-3" />
                全选
              </button>
              <span className="text-ink-300">|</span>
              <button
                onClick={clearDistricts}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-ink-500 transition hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Square className="h-3 w-3" />
                清空
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl bg-ink-50 p-2 ring-1 ring-ink-200">
            {districts.length === 0 ? (
              <span className="text-xs text-ink-400 px-2">暂无可选区县</span>
            ) : (
              districts.map((d) => {
                const active = filter.selectedDistricts.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDistrict(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-plant-500 text-white shadow-sm"
                        : "bg-white text-ink-400 ring-1 ring-ink-200 hover:bg-ink-100 hover:text-ink-600"
                    }`}
                    title={active ? "点击取消选中" : "点击选中"}
                  >
                    {d}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 ring-1 ring-ink-200 transition hover:bg-sky-50 hover:ring-sky-200">
            <input
              type="checkbox"
              checked={filter.rainOnly}
              onChange={(e) => setFilter({ rainOnly: e.target.checked })}
              className="h-4 w-4 rounded border-ink-300 text-sky-600 focus:ring-sky-500"
            />
            <CloudRain className="h-4 w-4 text-sky-500" />
            <span className="text-sm font-semibold text-ink-700">
              仅降雨夜
            </span>
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 ring-1 ring-ink-200 transition hover:bg-violet-50 hover:ring-violet-200">
            <input
              type="checkbox"
              checked={filter.pesticideWithin3Days}
              onChange={(e) =>
                setFilter({ pesticideWithin3Days: e.target.checked })
              }
              className="h-4 w-4 rounded border-ink-300 text-violet-600 focus:ring-violet-500"
            />
            <FlaskConical className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-ink-700">
              施药后 3 天内
            </span>
          </label>

          <button onClick={resetFilter} className="btn-ghost">
            <RotateCcw className="h-4 w-4" />
            重置
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100">
          <span className="text-xs font-semibold text-ink-500">
            当前筛选：
          </span>
          {chips.map((c) => (
            <span key={c.label} className={`chip ${c.cls}`}>
              {c.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
