"use client";

import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Dados básicos",
  "Hospitais preferidos",
  "Perfil de uso",
  "Planos recomendados",
  "Resumo e pagamento",
  "Documentos",
];

interface StepIndicatorProps {
  etapaAtual: number;
}

export function StepIndicator({ etapaAtual }: StepIndicatorProps) {
  const progresso = Math.round(((etapaAtual - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold">
              {etapaAtual}
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {STEPS[etapaAtual - 1]}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{progresso}% concluído</span>
        </div>
        <Progress value={progresso} className="h-1" />
      </div>
    </div>
  );
}
