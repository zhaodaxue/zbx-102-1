import { create } from "zustand";
import type { FilterState, OverviewStats, TrapRecord } from "../types";
import { MOCK_RECORDS } from "../data/mockData";
import {
  aggregateByWeekAndDistrict,
  buildMatrix,
  calcOverview,
  calcTrapWeekComparison,
  filterRecords,
  getAllDistricts,
  getDefaultDateRange,
} from "../utils/dataProcess";
import { normalizeDateRange } from "../utils/dateUtils";

interface DataStore {
  rawRecords: TrapRecord[];
  sourceName: string;
  filter: FilterState;
  selectedExportRange: [string, string] | null;

  filteredRecords: TrapRecord[];
  districts: string[];
  weeklyData: ReturnType<typeof aggregateByWeekAndDistrict>;
  comparisons: ReturnType<typeof calcTrapWeekComparison>;
  matrix: ReturnType<typeof buildMatrix>;
  overview: OverviewStats;

  lastDateRangeSwapped: boolean;
  clearDateRangeSwapFlag: () => void;

  setRawRecords: (recs: TrapRecord[], sourceName?: string) => void;
  resetToMock: () => void;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilter: () => void;
  toggleDistrict: (d: string) => void;
  setSelectedExportRange: (r: [string, string] | null) => void;
  selectAllDistricts: () => void;
  clearDistricts: () => void;
}

function buildEmptyOverview(): OverviewStats {
  return {
    totalDays: 0,
    districtCount: 0,
    trapCount: 0,
    totalCount: 0,
    surgeCount: 0,
    dateMin: "",
    dateMax: "",
  };
}

// 保留以便后续扩展使用
void buildEmptyOverview;

export const useDataStore = create<DataStore>((set, get) => {
  const initial = MOCK_RECORDS;
  const districtsInitial = getAllDistricts(initial);
  const defaultRange = getDefaultDateRange(initial);
  const initialFilter: FilterState = {
    dateRange: defaultRange,
    selectedDistricts: [...districtsInitial],
    rainOnly: false,
    pesticideWithin3Days: false,
  };
  const filtered = filterRecords(initial, initialFilter);
  const weekly = aggregateByWeekAndDistrict(filtered);
  const comps = calcTrapWeekComparison(filtered);
  const matrix = buildMatrix(filtered);
  const overview = calcOverview(filtered, comps);

  return {
    rawRecords: initial,
    sourceName: "示例数据 (mock)",
    filter: initialFilter,
    selectedExportRange: null,
    lastDateRangeSwapped: false,
    filteredRecords: filtered,
    districts: districtsInitial,
    weeklyData: weekly,
    comparisons: comps,
    matrix,
    overview,

    clearDateRangeSwapFlag() {
      set({ lastDateRangeSwapped: false });
    },

    setRawRecords(recs, sourceName) {
      const districts = getAllDistricts(recs);
      const defaultRange = getDefaultDateRange(recs);
      const filter: FilterState = {
        dateRange: defaultRange,
        selectedDistricts: [...districts],
        rainOnly: false,
        pesticideWithin3Days: false,
      };
      const filtered = filterRecords(recs, filter);
      set({
        rawRecords: recs,
        sourceName: sourceName ?? "用户数据",
        filter,
        districts,
        lastDateRangeSwapped: false,
        filteredRecords: filtered,
        weeklyData: aggregateByWeekAndDistrict(filtered),
        comparisons: calcTrapWeekComparison(filtered),
        matrix: buildMatrix(filtered),
        overview: calcOverview(filtered, calcTrapWeekComparison(filtered)),
        selectedExportRange: null,
      });
    },

    resetToMock() {
      get().setRawRecords(MOCK_RECORDS, "示例数据 (mock");
    },

    setFilter(patch) {
      const prevFilter = get().filter;
      const next: FilterState = { ...prevFilter, ...patch };

      let swapped = false;
      if (next.dateRange && next.dateRange[0] && next.dateRange[1]) {
        const norm = normalizeDateRange(next.dateRange);
        if (norm[0] !== next.dateRange[0] || norm[1] !== next.dateRange[1]) {
          swapped = true;
        }
        next.dateRange = norm;
      }

      const recs = get().rawRecords;
      const filtered = filterRecords(recs, next);
      const comps = calcTrapWeekComparison(filtered);
      set({
        filter: next,
        lastDateRangeSwapped: swapped,
        filteredRecords: filtered,
        weeklyData: aggregateByWeekAndDistrict(filtered),
        comparisons: comps,
        matrix: buildMatrix(filtered),
        overview: calcOverview(filtered, comps),
      });
    },

    resetFilter() {
      const recs = get().rawRecords;
      const districts = getAllDistricts(recs);
      const defaultRange = getDefaultDateRange(recs);
      get().setFilter({
        dateRange: defaultRange,
        selectedDistricts: [...districts],
        rainOnly: false,
        pesticideWithin3Days: false,
      });
    },

    toggleDistrict(d) {
      const cur = get().filter.selectedDistricts;
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      get().setFilter({ selectedDistricts: next });
    },

    selectAllDistricts() {
      const districts = get().districts;
      get().setFilter({ selectedDistricts: [...districts] });
    },

    clearDistricts() {
      get().setFilter({ selectedDistricts: [] });
    },

    setSelectedExportRange(r) {
      set({ selectedExportRange: r });
    },
  };
});
