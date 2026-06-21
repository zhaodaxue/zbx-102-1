import { useMemo } from "react";
import { CalendarRange, CheckCircle2, Download, FileOutput, X } from "lucide-react";
import { useDataStore } from "../store/useDataStore";
import { selectRecordsByDateRange } from "../utils/dataProcess";
import { downloadCSV } from "../utils/csv";
import { fmtDate } from "../utils/dateUtils";

export default function ExportPanel() {
  const {
    selectedExportRange,
    setSelectedExportRange,
    filteredRecords,
  } = useDataStore();

  const preview = useMemo(() => {
    if (!selectedExportRange) return { count: 0, days: 0 };
    const [from, to] = selectedExportRange;
    const recs = selectRecordsByDateRange(filteredRecords, from, to);
    const days = new Set(recs.map((r) => r.date)).size;
    return { count: recs.length, days };
  }, [selectedExportRange, filteredRecords]);

  function handleExport() {
    if (!selectedExportRange) return;
    const [from, to] = selectedExportRange;
    const recs = selectRecordsByDateRange(filteredRecords, from, to);
    if (recs.length === 0) return;
    const name = `稻飞虱明细_${from}_${to}_${new Date()
      .toISOString()
      .slice(0, 10)}`;
    downloadCSV(recs, name);
  }

  return (
    <section className="reveal stagger-6 card-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plant-500 to-plant-700 text-white shadow-pop">
            <FileOutput className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">
              日期区间 · 明细导出
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              在上方「灯号×日期矩阵」的列标题区域按住鼠标
              <kbd className="mx-1 rounded bg-ink-100 px-1 font-mono text-[11px]">
                拖拽
              </kbd>
              选择日期区间，即可导出该区间内的原始监测明细 CSV
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {!selectedExportRange ? (
            <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 ring-1 ring-ink-200">
              <CalendarRange className="h-5 w-5 text-ink-400" />
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                  尚未选择区间
                </p>
                <p className="text-sm text-ink-400">
                  请在矩阵顶部日期行拖拽选择
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-plant-50 px-4 py-3 ring-1 ring-plant-200">
              <CheckCircle2 className="h-5 w-5 text-plant-600" />
              <div>
                <p className="text-xs font-semibold text-plant-700 uppercase tracking-wide">
                  已选区间
                </p>
                <p className="font-mono text-sm font-bold text-ink-800 tabular-nums">
                  {fmtDate(selectedExportRange[0])} ~{" "}
                  {fmtDate(selectedExportRange[1])}
                </p>
              </div>
              <span className="h-8 w-px bg-plant-200" />
              <div>
                <p className="text-xs font-semibold text-plant-700 uppercase tracking-wide">
                  导出预览
                </p>
                <p className="text-sm font-bold text-ink-800">
                  <span className="font-mono tabular-nums">
                    {preview.count.toLocaleString()}
                  </span>
                  <span className="mx-1 font-normal text-ink-500">行 · </span>
                  <span className="font-mono tabular-nums">{preview.days}</span>
                  <span className="ml-1 font-normal text-ink-500">天</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedExportRange(null)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-white hover:text-ink-600"
                title="清除选择"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            disabled={!selectedExportRange || preview.count === 0}
            onClick={handleExport}
            className="btn-primary !px-5 !py-2.5 text-base shadow-pop"
          >
            <Download className="h-5 w-5" />
            导出 CSV
          </button>
        </div>
      </div>
    </section>
  );
}
