"use client";

import { AlertTriangle, CheckCircle2, FlaskConical, FileText, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { evaluateLab, getLabRange, getLabRecommendations, labStatusMeta } from "@/lib/labs";
import { LabsSection } from "./LabsSection";
import type { ScreenProps } from "./types";

export function LabsScreen({ data, persist, navigate }: ScreenProps) {
  const labs = data.labs ?? [];
  const recommendations = getLabRecommendations(data);
  const abnormalLabs = labs.filter((lab) => {
    const result = evaluateLab(lab.testId, lab.value);
    return result && result.status !== "ok";
  });
  const latestLab = labs[0];

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Медицинские данные</p>
        <h1 className="mt-1 text-2xl font-bold text-mira-text">Анализы</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mira-muted">
          Здесь Mira хранит результаты, сравнивает их с общими референсами и подсказывает, что стоит обсудить с врачом.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-mira-lavender-light text-mira-primary">
            <FlaskConical className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-mira-text">{labs.length}</p>
          <p className="text-xs text-mira-muted">результатов сохранено</p>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8E8EE] text-mira-cycle">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-mira-text">{abnormalLabs.length}</p>
          <p className="text-xs text-mira-muted">показателей вне референса</p>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F5E8] text-mira-success">
            <Stethoscope className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold text-mira-text">{recommendations.length}</p>
          <p className="text-xs text-mira-muted">тем для обсуждения</p>
        </Card>
      </div>

      {latestLab && (
        <Card className="mb-5 border-mira-primary/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Последний результат</p>
              <p className="mt-1 text-sm font-bold text-mira-text">
                {getLabRange(latestLab.testId)?.name ?? latestLab.testId}: {latestLab.value} {latestLab.unit}
              </p>
              <p className="mt-0.5 text-xs text-mira-muted">{new Date(latestLab.date).toLocaleDateString("ru-RU")}</p>
            </div>
            {(() => {
              const evaluation = evaluateLab(latestLab.testId, latestLab.value);
              const meta = evaluation ? labStatusMeta[evaluation.status] : null;
              return meta ? (
                <span
                  className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                  style={{ color: meta.color, background: meta.bg }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
              ) : null;
            })()}
          </div>
        </Card>
      )}

      <LabsSection data={data} persist={persist} />

      <Card className="mt-5 border-mira-lavender/20 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-mira-text">Для врача</p>
            <p className="mt-1 text-xs leading-relaxed text-mira-muted">
              Все сохранённые анализы автоматически попадают в отчёт врача вместе с симптомами и датами.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("report")}>
            <FileText className="h-4 w-4" /> Открыть отчёт
          </Button>
        </div>
      </Card>
    </div>
  );
}
