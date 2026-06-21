import {
  CalendarDays,
  CloudRain,
  FlaskConical,
  MapPin,
  RotateCcw,
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
    rawRecords,
  } = useDataStore();

  const allDates = rawRecords.map((r) => r.date);
  const [dateMin, dateMax] = minMaxOfDates(allDates);

  const chips = [
    filter.rainOnly && { label: "仅降雨夜", cls: "bg-sky-100 text-sky-700" },
    filter.pesticideWithin3Days && {
      label: "施药后 3 天内",
      cls: "bg-violet-100 text-violet-700",
    },
    filter.selectedDistricts.length > 0 && {
      label: `${filter.selectedDistricts.length} 个区县`,
      cls: "bg-plant-100 text-plant-700",
    },
  ].filter(Boolean) as { label: string; cls: string }[];

  return (
    <section className="reveal stagger-2 card-surface p-5">
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
          <span className="label">
            <MapPin className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            区县（多选）
          </span>
          <div className="flex flex-wrap gap-2 rounded-xl bg-ink-50 p-2 ring-1 ring-ink-200">
            {districts.length === 0 ? (
              <span className="text-xs text-ink-400 px-2">暂无可选区县</span>
            ) : (
              districts.map((d) => {
                const active =
                  filter.selectedDistricts.length === 0 ||
                  filter.selectedDistricts.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDistrict(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-plant-500 text-white shadow-sm"
                        : "bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-100"
                    }`}
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
