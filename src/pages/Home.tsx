import Header from "../components/Header";
import FilterBar from "../components/FilterBar";
import WeeklyLineChart from "../components/WeeklyLineChart";
import ComparisonTable from "../components/ComparisonTable";
import TrapDateMatrix from "../components/TrapDateMatrix";
import ExportPanel from "../components/ExportPanel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 via-white to-plant-50/40">
      <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        <Header />

        <div className="mt-6 space-y-6">
          <FilterBar />

          <WeeklyLineChart />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-2 min-h-[620px]">
              <ComparisonTable />
            </div>
            <div className="xl:col-span-3 min-h-[620px]">
              <TrapDateMatrix />
            </div>
          </div>

          <ExportPanel />

          <footer className="pb-6 pt-4 text-center text-xs text-ink-400">
            <p>
              市植保站 · 稻飞虱诱虫灯诱捕量周环比分析平台
              <span className="mx-2 text-ink-200">|</span>
              所有数据均在浏览器本地处理，不上传任何服务器
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
