export interface TrapRecord {
  date: string;
  district: string;
  trapId: string;
  count: number;
  avgTemp: number;
  isRaining: 0 | 1;
  isPesticide: 0 | 1;
}

export interface WeeklyDistrictData {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  district: string;
  totalCount: number;
}

export interface TrapWeekComparison {
  trapId: string;
  district: string;
  lastWeekCount: number;
  thisWeekCount: number;
  changeRate: number;
  isSurge: boolean;
}

export interface MatrixCellData {
  trapId: string;
  date: string;
  count: number;
  isSurge: boolean;
  record?: TrapRecord;
}

export interface MatrixData {
  columns: string[];
  rows: string[];
  cells: (MatrixCellData | null)[][];
  districtOfTrap: Record<string, string>;
}

export interface FilterState {
  dateRange: [string, string] | null;
  selectedDistricts: string[];
  rainOnly: boolean;
  pesticideWithin3Days: boolean;
}

export interface OverviewStats {
  totalDays: number;
  districtCount: number;
  trapCount: number;
  totalCount: number;
  surgeCount: number;
  dateMin: string;
  dateMax: string;
}
