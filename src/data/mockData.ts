import type { TrapRecord } from "../types";
import { addDaysStr, toISODate } from "../utils/dateUtils";

const DISTRICTS = ["江宁区", "浦口区", "六合区", "溧水区", "高淳区"] as const;
const TRAP_PREFIX: Record<(typeof DISTRICTS)[number], string> = {
  江宁区: "JN",
  浦口区: "PK",
  六合区: "LH",
  溧水区: "LS",
  高淳区: "GC",
};
const TRAP_PER_DISTRICT = 4;

function seedRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function generateMockRecords(): TrapRecord[] {
  const records: TrapRecord[] = [];
  const rand = seedRandom(20260621);

  const traps: { district: string; id: string; base: number; growth: number }[] = [];
  for (const d of DISTRICTS) {
    for (let i = 1; i <= TRAP_PER_DISTRICT; i++) {
      const id = `${TRAP_PREFIX[d]}-${String(i).padStart(3, "0")}`;
      const base = 40 + rand() * 180;
      const growth = rand() * 0.32 + 0.05;
      traps.push({ district: d, id, base, growth });
    }
  }

  const totalDays = 63;
  const endDate = new Date(2026, 5, 20);
  const startISO = toISODate(new Date(endDate.getTime() - (totalDays - 1) * 86400000));

  for (let di = 0; di < totalDays; di++) {
    const date = addDaysStr(startISO, di);
    const dayProgress = di / totalDays;

    for (const t of traps) {
      const seasonal = Math.sin(dayProgress * Math.PI * 2 + rand() * 0.8) * 0.4 + 0.6;
      const trend = 1 + dayProgress * t.growth * 2.2;

      let base = t.base * seasonal * trend;
      const noise = (rand() - 0.5) * base * 0.35;
      base = Math.max(0, base + noise);

      const surgeTrigger =
        (t.id === "JN-002" && (di === 52 || di === 53 || di === 54)) ||
        (t.id === "LS-003" && (di === 57 || di === 58)) ||
        (t.id === "GC-001" && (di === 48 || di === 49));
      if (surgeTrigger) base = base * (2.4 + rand() * 1.2);

      const isRaining: 0 | 1 = rand() < 0.22 ? 1 : 0;
      let avgTemp = 20 + dayProgress * 6 + (rand() - 0.5) * 3.5;
      if (isRaining) avgTemp -= rand() * 2;

      const isPesticide: 0 | 1 =
        (di === 10 && (t.id.endsWith("-001") || t.id.endsWith("-002"))) ||
        (di === 28 && t.id.startsWith("PK")) ||
        (di === 42 && (t.id.startsWith("LS") || t.id.startsWith("GC")))
          ? 1
          : 0;

      records.push({
        date,
        district: t.district,
        trapId: t.id,
        count: Math.round(base),
        avgTemp: Number(avgTemp.toFixed(1)),
        isRaining,
        isPesticide,
      });
    }
  }
  return records;
}

export const MOCK_RECORDS: TrapRecord[] = generateMockRecords();
