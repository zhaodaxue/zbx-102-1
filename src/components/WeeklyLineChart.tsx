import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import { useDataStore } from "../store/useDataStore";
import { getLineChartSeries } from "../utils/dataProcess";
import { fmtWeekLabel } from "../utils/dateUtils";
import { LineChart, Maximize2 } from "lucide-react";

const DISTRICT_COLORS = [
  "#2D6A4F",
  "#E76F51",
  "#457B9D",
  "#7B2D8E",
  "#D4A373",
  "#E63946",
  "#2A9D8F",
];

export default function WeeklyLineChart() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const { weeklyData, filter } = useDataStore();

  const activeDistricts = filter.selectedDistricts;

  const { weeks, seriesMap } = useMemo(
    () => getLineChartSeries(weeklyData, activeDistricts, filter.dateRange),
    [weeklyData, activeDistricts, filter.dateRange]
  );

  useEffect(() => {
    if (!ref.current) return;
    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current);
      const onResize = () => chartRef.current?.resize();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        chartRef.current?.dispose();
        chartRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const xAxisData = weeks.map(fmtWeekLabel);
    const series = activeDistricts.map((d, i) => {
      const color = DISTRICT_COLORS[i % DISTRICT_COLORS.length];
      return {
        name: d,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        showSymbol: true,
        lineStyle: { width: 2.5, color },
        itemStyle: { color, borderWidth: 2, borderColor: "#fff" },
        areaStyle: {
          opacity: 0.08,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: "rgba(255,255,255,0)" },
          ]),
        },
        emphasis: { focus: "series" },
        data: (seriesMap[d] ?? []).map((v) => v ?? null),
      };
    });

    chart.setOption(
      {
        grid: { left: 48, right: 24, top: 36, bottom: 52 },
        color: DISTRICT_COLORS,
        legend: {
          type: "scroll",
          top: 4,
          right: 8,
          icon: "roundRect",
          itemWidth: 14,
          itemHeight: 6,
          textStyle: { color: "#414a5d", fontSize: 12, fontWeight: 600 },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross", lineStyle: { color: "#b4bccb" } },
          backgroundColor: "rgba(31, 36, 48, 0.96)",
          borderColor: "transparent",
          textStyle: { color: "#fff", fontSize: 12 },
          valueFormatter: (v: unknown) =>
            v == null ? "-" : `${Number(v).toLocaleString()} 头`,
        },
        xAxis: {
          type: "category",
          data: xAxisData,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#d8dde6" } },
          axisLabel: {
            color: "#505b72",
            fontSize: 11,
            fontWeight: 500,
            hideOverlap: true,
          },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          name: "诱捕总头数",
          nameTextStyle: { color: "#66738d", fontSize: 11, padding: [0, 0, 8, -40] },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#eef0f4", type: "dashed" } },
          axisLabel: {
            color: "#66738d",
            fontSize: 11,
            formatter: (v: number) => v.toLocaleString(),
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
            zoomLock: false,
          },
          {
            type: "slider",
            bottom: 8,
            height: 18,
            borderColor: "transparent",
            backgroundColor: "#eef0f4",
            fillerColor: "rgba(45, 106, 79, 0.15)",
            handleStyle: { color: "#2D6A4F", borderColor: "#fff" },
            moveHandleStyle: { color: "#2D6A4F" },
            textStyle: { color: "#66738d", fontSize: 10 },
          },
        ],
        series,
      },
      true
    );
    chart.resize();
  }, [weeks, seriesMap, activeDistricts]);

  return (
    <section className="reveal stagger-3 card-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-plant-50 text-plant-600 ring-1 ring-plant-100">
              <LineChart className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink-900 tracking-tight">
                区县周诱捕总量趋势
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                按自然周聚合 · 支持缩放底部滑块查看区间
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-plant-50 text-plant-700">
            {activeDistricts.length} 个区县
          </span>
          <span className="chip bg-ink-50 text-ink-600">{weeks.length} 周</span>
          <button
            onClick={() => {
              const w = window.open("", "_blank");
              if (!w) return;
              const dataUrl = chartRef.current?.getDataURL({
                pixelRatio: 2,
                backgroundColor: "#fff",
              });
              w.document.write(
                `<title>区县周诱捕总量趋势</title><body style="margin:0;background:#f4f6fa;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${dataUrl}" style="max-width:96vw;max-height:96vh;border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.15)" /></body>`
              );
            }}
            className="btn-ghost !px-2 !py-1.5"
            title="全屏查看"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="h-[420px] w-full" />
    </section>
  );
}
