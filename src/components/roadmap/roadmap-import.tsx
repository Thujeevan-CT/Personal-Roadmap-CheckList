"use client";

import { useState, useRef } from "react";
import { Upload, Clipboard, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  validateImportJSON,
  getImportStats,
  AI_PROMPT_TEMPLATE,
  type ParsedRoadmap,
} from "@/lib/utils/import-schema";
import { useImportRoadmap } from "@/hooks/use-roadmaps";

interface RoadmapImportProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;
type InputMode = "paste" | "upload";

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { num: 1, label: "Paste JSON" },
    { num: 2, label: "Preview" },
    { num: 3, label: "Import" },
  ];
  return (
    <div className="flex items-center gap-2 mb-5">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          {i > 0 && <div className="w-6 h-px bg-[var(--color-border)]" />}
          <div
            className={`flex items-center gap-1.5 text-sm font-medium ${
              s.num === current
                ? "text-[var(--color-primary)]"
                : s.num < current
                ? "text-[var(--color-success)]"
                : "text-[var(--color-text-tertiary)]"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                s.num === current
                  ? "bg-[var(--color-primary)] text-white"
                  : s.num < current
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-tertiary)]"
              }`}
            >
              {s.num < current ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TreePreview({ data }: { data: ParsedRoadmap }) {
  const stats = getImportStats(data);
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{data.icon || "📋"}</span>
        <div>
          <h3 className="heading-lg text-[var(--color-text-primary)]">{data.title}</h3>
          {data.description && (
            <p className="body-sm text-[var(--color-text-secondary)]">{data.description}</p>
          )}
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto space-y-1 mb-4">
        {data.modules.map((mod, mi) => {
          const isLast = mi === data.modules.length - 1;
          return (
            <div key={mi}>
              <div className="flex items-center gap-2 py-1">
                <span className="text-[var(--color-border)] text-sm font-mono">{isLast ? "└─" : "├─"}</span>
                <span className="heading-md text-[var(--color-text-primary)]">{mod.title}</span>
              </div>
              {mod.submodules?.map((sub, si) => {
                const isSubLast = si === (mod.submodules?.length ?? 0) - 1;
                const checkCount = sub.checklist?.length ?? 0;
                const noteCount = sub.notes?.length ?? 0;
                const meta = [
                  checkCount > 0 && `${checkCount} item${checkCount !== 1 ? "s" : ""}`,
                  noteCount > 0 && `${noteCount} note${noteCount !== 1 ? "s" : ""}`,
                ].filter(Boolean).join(", ");
                return (
                  <div key={si} className="flex items-center gap-2 py-0.5 ml-6">
                    <span className="text-[var(--color-border)] text-sm font-mono">
                      {isSubLast ? "└─" : "├─"}
                    </span>
                    <span className="body-text text-[var(--color-text-primary)]">{sub.title}</span>
                    {meta && (
                      <span className="body-sm text-[var(--color-text-tertiary)]">({meta})</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="body-sm text-[var(--color-text-secondary)] px-3 py-2 bg-[var(--color-surface)] rounded-[6px]">
        {stats.modules} module{stats.modules !== 1 ? "s" : ""}, {stats.submodules} submodule
        {stats.submodules !== 1 ? "s" : ""}, {stats.checklist} checklist item
        {stats.checklist !== 1 ? "s" : ""}, {stats.notes} note{stats.notes !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

export function RoadmapImport({ open, onClose }: RoadmapImportProps) {
  const [step, setStep] = useState<Step>(1);
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedRoadmap | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const importRoadmap = useImportRoadmap();

  function reset() {
    setStep(1);
    setJsonText("");
    setError("");
    setParsedData(null);
    setImporting(false);
    setDone(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNext() {
    const result = validateImportJSON(jsonText);
    if (!result.valid) {
      setError(result.errors.join("\n"));
      return;
    }
    setError("");
    setParsedData(result.data!);
    setStep(2);
  }

  async function handleImport() {
    if (!parsedData) return;
    setImporting(true);
    setStep(3);
    try {
      await importRoadmap.mutateAsync(parsedData);
      setDone(true);
      toast("Roadmap imported successfully", "success");
      setTimeout(() => handleClose(), 1500);
    } catch (e) {
      setImporting(false);
      setStep(2);
      toast(String((e as Error).message), "error");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("File too large (max 1MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string);
      setError("");
    };
    reader.readAsText(file);
    e.target.value = "";
    setInputMode("paste");
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
    toast("AI prompt copied to clipboard", "success");
  }

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      <DialogHeader onClose={handleClose}>Import Roadmap from JSON</DialogHeader>
      <StepIndicator current={step} />

      {step === 1 && (
        <div>
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setInputMode("paste")}
              className={`px-3 py-1.5 text-sm rounded-[6px] transition-colors cursor-pointer ${
                inputMode === "paste"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Paste JSON
            </button>
            <button
              onClick={() => setInputMode("upload")}
              className={`px-3 py-1.5 text-sm rounded-[6px] transition-colors cursor-pointer ${
                inputMode === "upload"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Upload File
            </button>
          </div>

          {inputMode === "paste" ? (
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError("");
              }}
              placeholder={'{\n  "title": "My Roadmap",\n  "modules": [...]\n}'}
              className="w-full h-[280px] px-3 py-2 text-sm font-mono bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] resize-none outline-none focus:border-[var(--color-border-focus)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-[280px] border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-text-tertiary)] transition-colors"
            >
              <Upload className="h-8 w-8 text-[var(--color-text-tertiary)]" />
              <p className="body-sm text-[var(--color-text-secondary)]">
                {jsonText ? "File loaded. Click Next to continue." : "Click to upload a .json file"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {error && (
            <div className="mt-2 p-2 rounded-[6px] bg-[var(--color-danger-light)] text-sm text-[var(--color-danger)] whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="sm" icon={<Clipboard className="h-4 w-4" />} onClick={handleCopyPrompt}>
              Copy AI Prompt
            </Button>
            <Button onClick={handleNext} disabled={!jsonText.trim()} icon={<ChevronRight className="h-4 w-4" />}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && parsedData && (
        <div>
          <TreePreview data={parsedData} />
          <div className="flex items-center justify-between mt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-12">
          {done ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-[var(--color-success)] mb-3" />
              <p className="heading-md text-[var(--color-text-primary)]">Roadmap imported successfully!</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 border-3 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mb-3" />
              <p className="body-text text-[var(--color-text-secondary)]">Importing roadmap...</p>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
