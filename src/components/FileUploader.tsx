import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  RefreshCw,
  X,
} from "lucide-react";
import { parseCSVFile } from "../utils/csv";
import { useDataStore } from "../store/useDataStore";

export default function FileUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{
    type: "ok" | "warn" | "err";
    msg: string;
  } | null>(null);
  const setRawRecords = useDataStore((s) => s.setRawRecords);
  const resetToMock = useDataStore((s) => s.resetToMock);

  async function handleFile(f: File) {
    setBusy(true);
    setToast(null);
    try {
      const res = await parseCSVFile(f);
      if (res.errors.length) {
        setToast({ type: "err", msg: res.errors.join("；") });
        return;
      }
      if (res.records.length === 0) {
        setToast({ type: "err", msg: "未解析到有效记录" });
        return;
      }
      setRawRecords(res.records, f.name);
      setToast({
        type: res.warnings.length ? "warn" : "ok",
        msg: `已导入 ${res.records.length} 条记录${
          res.warnings.length ? `，${res.warnings.length} 条提示` : ""
        }`,
      });
      if (res.warnings.length) {
        console.warn("CSV 解析提示：", res.warnings);
      }
    } catch {
      setToast({ type: "err", msg: "文件解析失败" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          disabled={busy}
          className="btn-primary"
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          上传 CSV
        </button>
        <a
          href="/sample.csv"
          download
          className="btn-ghost"
          title="下载示例格式"
        >
          <Download className="h-4 w-4" />
          格式示例
        </a>
        <button
          onClick={() => {
            resetToMock();
            setToast({ type: "ok", msg: "已恢复内置示例数据" });
          }}
          className="btn-ghost"
          title="恢复示例数据"
        >
          <RefreshCw className="h-4 w-4" />
          示例数据
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {toast && (
        <div
          className={`reveal absolute right-0 top-12 z-30 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-pop ring-1 ${
            toast.type === "ok"
              ? "bg-plant-50 text-plant-700 ring-plant-200"
              : toast.type === "warn"
                ? "bg-amber-50 text-amber-800 ring-amber-200"
                : "bg-alert-50 text-alert-700 ring-alert-200"
          }`}
        >
          {toast.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : toast.type === "warn" ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span className="max-w-sm">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-1 rounded p-0.5 opacity-60 hover:bg-black/5 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
