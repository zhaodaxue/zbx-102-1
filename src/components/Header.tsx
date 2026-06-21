import {
  Bug,
  CalendarDays,
  Landmark,
  Layers3,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useDataStore } from "../store/useDataStore";
import FileUploader from "./FileUploader";

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
  tone: "plant" | "pest" | "alert" | "ink";
  hint?: string;
}) {
  const tones: Record<typeof tone, string> = {
    plant: "from-plant-50 to-plant-100 text-plant-700 ring-plant-200",
    pest: "from-pest-50 to-pest-100 text-pest-700 ring-pest-200",
    alert: "from-alert-50 to-alert-100 text-alert-700 ring-alert-200",
    ink: "from-ink-50 to-ink-100 text-ink-700 ring-ink-200",
  };
  const iconBg: Record<typeof tone, string> = {
    plant: "bg-plant-500",
    pest: "bg-pest-500",
    alert: "bg-alert-500",
    ink: "bg-ink-600",
  };
  return (
    <div
      className={`reveal stagger-1 relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} p-4 ring-1`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {label}
          </p>
          <p className="mt-1.5 font-mono text-3xl font-bold leading-none text-ink-900 tabular-nums">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-semibold opacity-60">
                {suffix}
              </span>
            )}
          </p>
          {hint && (
            <p className="mt-2 text-xs font-medium opacity-75">{hint}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${iconBg[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { overview, sourceName } = useDataStore();

  return (
    <header className="reveal">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-plant-500 to-plant-700 text-white shadow-pop">
            <Bug className="h-7 w-7" />
            <span className="absolute -bottom-1 -right-1 rounded-md bg-pest-500 px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
              测报
            </span>
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-ink-900">
              稻飞虱诱虫灯 · 诱捕量周环比分析
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              数据源：
              <span className="font-medium text-plant-700">{sourceName}</span>
              {overview.dateMin && (
                <>
                  <span className="mx-2 text-ink-300">|</span>
                  监测周期
                  <span className="ml-1 font-mono font-medium text-ink-700 tabular-nums">
                    {overview.dateMin} ~ {overview.dateMax}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileUploader />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={CalendarDays}
          label="监测天数"
          value={overview.totalDays}
          suffix="天"
          tone="ink"
          hint="有效观测日"
        />
        <StatCard
          icon={Landmark}
          label="覆盖区县"
          value={overview.districtCount}
          suffix="个"
          tone="plant"
          hint="多点位布控"
        />
        <StatCard
          icon={Layers3}
          label="诱虫灯数"
          value={overview.trapCount}
          suffix="盏"
          tone="plant"
          hint="在运行设备"
        />
        <StatCard
          icon={Sparkles}
          label="累计诱捕"
          value={overview.totalCount.toLocaleString()}
          suffix="头"
          tone="pest"
          hint="全周期总量"
        />
        <StatCard
          icon={TrendingUp}
          label="骤升灯号"
          value={overview.surgeCount}
          suffix="盏"
          tone="alert"
          hint="环比增幅>50%"
        />
      </div>
    </header>
  );
}
