import type {
  FilterState,
  MatrixCellData,
  MatrixData,
  OverviewStats,
  TrapRecord,
  TrapWeekComparison,
  WeeklyDistrictData,
} from "../types";
import {
  addDaysStr,
  dateInRange,
  daysBetween,
  eachDayBetween,
  eachWeekBetween,
  getCurrentWeekKeyAndPrev,
  minMaxOfDates,
  sortDates,
  subDaysStr,
  weekKeyOfStr,
  weekRangeOfKey,
} from "./dateUtils";

export function getAllDistricts(records: TrapRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.district))).sort();
}

export function getAllTrapIds(records: TrapRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.trapId))).sort();
}

export function getDistrictOfTrap(
  records: TrapRecord[]
): Record<string, string> {
  const m: Record<string, string> = {};
  for (const r of records) {
    if (!m[r.trapId]) m[r.trapId] = r.district;
  }
  return m;
}

export function buildPesticideWithin3DaysSet(
  records: TrapRecord[]
): Set<string> {
  const byTrap = new Map<string, string[]>();
  for (const r of records) {
    if (r.isPesticide === 1) {
      if (!byTrap.has(r.trapId)) byTrap.set(r.trapId, []);
      byTrap.get(r.trapId)!.push(r.date);
    }
  }
  const keys = new Set<string>();
  for (const [trapId, dates] of byTrap) {
    const sorted = sortDates(dates);
    for (const d of sorted) {
      for (let i = 0; i <= 3; i++) {
        keys.add(`${trapId}|${addDaysStr(d, i)}`);
      }
    }
  }
  return keys;
}

export function filterRecords(
  records: TrapRecord[],
  filters: FilterState
): TrapRecord[] {
  const [from, to] = filters.dateRange ?? [null, null];
  const districts =
    filters.selectedDistricts.length > 0
      ? new Set(filters.selectedDistricts)
      : null;
  const pestSet =
    filters.pesticideWithin3Days ? buildPesticideWithin3DaysSet(records) : null;

  const out: TrapRecord[] = [];
  for (const r of records) {
    if (from || to) {
      if (!dateInRange(r.date, from, to)) continue;
    }
    if (districts && !districts.has(r.district)) continue;
    if (filters.rainOnly && r.isRaining !== 1) continue;
    if (pestSet && !pestSet.has(`${r.trapId}|${r.date}`)) continue;
    out.push(r);
  }
  return out;
}

export function aggregateByWeekAndDistrict(
  records: TrapRecord[]
): WeeklyDistrictData[] {
  const map = new Map<string, WeeklyDistrictData>();
  for (const r of records) {
    const weekKey = weekKeyOfStr(r.date);
    const key = `${weekKey}|${r.district}`;
    if (!map.has(key)) {
      const { start, end } = weekRangeOfKey(weekKey);
      map.set(key, {
        weekKey,
        weekStart: start,
        weekEnd: end,
        district: r.district,
        totalCount: 0,
      });
    }
    map.get(key)!.totalCount += r.count;
  }
  return Array.from(map.values()).sort(
    (a, b) => a.weekKey.localeCompare(b.weekKey) || a.district.localeCompare(b.district)
  );
}

export function calcTrapWeekComparison(
  records: TrapRecord[]
): TrapWeekComparison[] {
  const allDates = records.map((r) => r.date);
  const { thisWeek, lastWeek } = getCurrentWeekKeyAndPrev(allDates);
  if (!thisWeek) return [];

  const sums = new Map<string, Map<string, number>>();
  for (const r of records) {
    const wk = weekKeyOfStr(r.date);
    if (!sums.has(r.trapId)) sums.set(r.trapId, new Map());
    const m = sums.get(r.trapId)!;
    m.set(wk, (m.get(wk) ?? 0) + r.count);
  }

  const districtOf = getDistrictOfTrap(records);
  const out: TrapWeekComparison[] = [];
  for (const [trapId, m] of sums) {
    const thisCount = m.get(thisWeek) ?? 0;
    const lastCount = lastWeek ? m.get(lastWeek) ?? 0 : 0;
    let changeRate = 0;
    if (lastCount > 0) changeRate = (thisCount - lastCount) / lastCount;
    else if (thisCount > 0) changeRate = 1;
    out.push({
      trapId,
      district: districtOf[trapId] ?? "",
      lastWeekCount: lastCount,
      thisWeekCount: thisCount,
      changeRate,
      isSurge: changeRate > 0.5,
    });
  }
  return out.sort((a, b) => b.changeRate - a.changeRate);
}

export function buildMatrix(records: TrapRecord[]): MatrixData {
  const allDates = sortDates(Array.from(new Set(records.map((r) => r.date))));
  if (allDates.length === 0) {
    return { columns: [], rows: [], cells: [], districtOfTrap: {} };
  }
  const [minD, maxD] = minMaxOfDates(allDates);
  const columns = eachDayBetween(minD, maxD);
  const rows = getAllTrapIds(records);
  const districtOfTrap = getDistrictOfTrap(records);

  const cellMap = new Map<string, TrapRecord>();
  for (const r of records) cellMap.set(`${r.trapId}|${r.date}`, r);

  const prevByTrapDate = new Map<string, number>();
  for (const r of records) prevByTrapDate.set(`${r.trapId}|${r.date}`, r.count);

  const cells: (MatrixCellData | null)[][] = rows.map((trapId) =>
    columns.map((date) => {
      const rec = cellMap.get(`${trapId}|${date}`);
      if (!rec) return null;
      const prevDate = subDaysStr(date, 7);
      const prev = prevByTrapDate.get(`${trapId}|${prevDate}`) ?? 0;
      let isSurge = false;
      if (prev > 0) isSurge = (rec.count - prev) / prev > 0.5;
      else if (rec.count > 0) isSurge = false;
      return {
        trapId,
        date,
        count: rec.count,
        isSurge,
        record: rec,
      };
    })
  );

  return { columns, rows, cells, districtOfTrap };
}

export function calcOverview(
  records: TrapRecord[],
  comparisons: TrapWeekComparison[]
): OverviewStats {
  const dates = new Set(records.map((r) => r.date));
  const [dateMin, dateMax] = minMaxOfDates(Array.from(dates));
  const surgeCount = comparisons.filter((c) => c.isSurge).length;
  return {
    totalDays: dates.size,
    districtCount: getAllDistricts(records).length,
    trapCount: getAllTrapIds(records).length,
    totalCount: records.reduce((s, r) => s + r.count, 0),
    surgeCount,
    dateMin,
    dateMax,
  };
}

export function selectRecordsByDateRange(
  records: TrapRecord[],
  from: string,
  to: string
): TrapRecord[] {
  const out: TrapRecord[] = [];
  for (const r of records) {
    if (dateInRange(r.date, from, to)) out.push(r);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.trapId.localeCompare(b.trapId));
}

export function getDefaultDateRange(
  allRecords: TrapRecord[]
): [string, string] | null {
  const dates = allRecords.map((r) => r.date);
  if (dates.length === 0) return null;
  const [, max] = minMaxOfDates(dates);
  const min = subDaysStr(max, 55);
  return [min, max];
}

export function getLineChartSeries(
  weekly: WeeklyDistrictData[],
  districts: string[],
  dateRange: [string, string] | null
): { weeks: string[]; seriesMap: Record<string, (number | null)[]> } {
  const [from, to] = dateRange ?? [null, null];
  let weeks: string[];
  if (from && to) {
    weeks = eachWeekBetween(from, to);
  } else {
    weeks = Array.from(new Set(weekly.map((w) => w.weekKey))).sort();
  }
  const weekIdx = new Map(weeks.map((w, i) => [w, i]));
  const seriesMap: Record<string, (number | null)[]> = {};
  for (const d of districts) seriesMap[d] = new Array(weeks.length).fill(null);
  for (const w of weekly) {
    if (!districts.includes(w.district)) continue;
    const i = weekIdx.get(w.weekKey);
    if (i == null) continue;
    const cur = seriesMap[w.district][i];
    seriesMap[w.district][i] = (cur ?? 0) + w.totalCount;
  }
  return { weeks, seriesMap };
}

export function getMaxCellCount(data: MatrixData): number {
  let max = 0;
  for (const row of data.cells) {
    for (const c of row) {
      if (c && c.count > max) max = c.count;
    }
  }
  return max;
}

export function fmtRate(rate: number): string {
  if (!Number.isFinite(rate)) return "-";
  const pct = rate * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export { daysBetween };
