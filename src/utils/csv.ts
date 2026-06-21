import Papa from "papaparse";
import type { TrapRecord } from "../types";

const HEADER_MAP: Record<string, keyof TrapRecord> = {
  date: "date",
  日期: "date",
  district: "district",
  区县: "district",
  trapId: "trapId",
  "诱虫灯编号": "trapId",
  灯号: "trapId",
  count: "count",
  "诱捕头数": "count",
  数量: "count",
  avgTemp: "avgTemp",
  "当晚平均气温摄氏": "avgTemp",
  气温: "avgTemp",
  isRaining: "isRaining",
  "是否降雨": "isRaining",
  降雨: "isRaining",
  isPesticide: "isPesticide",
  "周边是否施药": "isPesticide",
  施药: "isPesticide",
};

const REQUIRED_KEYS: (keyof TrapRecord)[] = [
  "date",
  "district",
  "trapId",
  "count",
];

export interface ParseResult {
  records: TrapRecord[];
  errors: string[];
  warnings: string[];
}

export function parseCSVText(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: TrapRecord[] = [];

  let parsedData: Record<string, unknown>[] = [];
  let parsedErrors: Papa.ParseError[] = [];
  let rawHeaders: string[] = [];

  Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy" as unknown as boolean,
    complete: (results) => {
      parsedData = results.data ?? [];
      parsedErrors = results.errors ?? [];
      rawHeaders = (results.meta?.fields as string[] | undefined) ?? [];
    },
  });

  if (rawHeaders.length > 0) {
    rawHeaders = rawHeaders.map((h) => String(h ?? "").trim());
  }

  if (parsedErrors?.length) {
    for (const e of parsedErrors.slice(0, 5)) {
      warnings.push(`第${e.row ?? "?"}行: ${e.message}`);
    }
  }

  const mapped: Partial<Record<keyof TrapRecord, string>> = {};
  for (const h of rawHeaders) {
    const key = HEADER_MAP[h];
    if (key && !mapped[key]) mapped[key] = h;
  }

  for (const k of REQUIRED_KEYS) {
    if (!mapped[k]) errors.push(`缺少必要列: ${k}`);
  }
  if (errors.length) return { records: [], errors, warnings };

  for (const [i, row] of parsedData.entries()) {
    try {
      const r: TrapRecord = {
        date: String(row[mapped.date!] ?? "").trim(),
        district: String(row[mapped.district!] ?? "").trim(),
        trapId: String(row[mapped.trapId!] ?? "").trim(),
        count: Number(row[mapped.count!] ?? 0) || 0,
        avgTemp:
          mapped.avgTemp != null
            ? Number(row[mapped.avgTemp] ?? NaN)
            : NaN,
        isRaining:
          mapped.isRaining != null
            ? (to01(row[mapped.isRaining]) as 0 | 1)
            : 0,
        isPesticide:
          mapped.isPesticide != null
            ? (to01(row[mapped.isPesticide]) as 0 | 1)
            : 0,
      };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
        warnings.push(`第${i + 2}行: 日期格式应为 YYYY-MM-DD（已跳过）`);
        continue;
      }
      if (!r.district || !r.trapId) {
        warnings.push(`第${i + 2}行: 区县或灯号为空（已跳过）`);
        continue;
      }
      records.push(r);
    } catch (e) {
      warnings.push(`第${i + 2}行: 解析异常`);
    }
  }

  return { records, errors, warnings };
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return parseCSVText(text);
}

function to01(v: unknown): number {
  if (typeof v === "number") return v === 0 ? 0 : 1;
  const s = String(v).trim().toLowerCase();
  if (s === "0" || s === "否" || s === "no" || s === "false" || s === "") return 0;
  return 1;
}

const EXPORT_HEADERS: { key: keyof TrapRecord; label: string }[] = [
  { key: "date", label: "date" },
  { key: "district", label: "区县" },
  { key: "trapId", label: "诱虫灯编号" },
  { key: "count", label: "诱捕头数" },
  { key: "avgTemp", label: "当晚平均气温摄氏" },
  { key: "isRaining", label: "是否降雨" },
  { key: "isPesticide", label: "周边是否施药" },
];

export function recordsToCSV(records: TrapRecord[]): string {
  const lines: string[] = [];
  lines.push(EXPORT_HEADERS.map((h) => h.label).join(","));
  for (const r of records) {
    lines.push(
      EXPORT_HEADERS.map((h) => {
        const v = r[h.key];
        const s =
          typeof v === "number"
            ? Number.isFinite(v)
              ? String(v)
              : ""
            : String(v ?? "");
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }).join(",")
    );
  }
  return lines.join("\n");
}

export function downloadCSV(records: TrapRecord[], filename: string) {
  const csv = recordsToCSV(records);
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
