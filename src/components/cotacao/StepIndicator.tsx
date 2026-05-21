"use client";

import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

const STEPS = [
  "Dados básicos",
  "Hospitais",
  "Perfil de uso",
  "Resultado",
  "Pagamento",
  "Documentos",
];

interface StepIndicatorProps {
  etapaAtual: number;
}

export function StepIndicator({ etapaAtual }: StepIndicatorProps) {
  const progresso = ((etapaAtual - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-brand-blue">
            Etapa {etapaAtual} de {STEPS.length}
          </p>
          <p className="text-xs text-gray-500 font-medium">
            {STEPS[etapaAtual - 1]}
          </p>
        </div>
        <Progress value={progresso} className="h-1.5" />
        <div className="hidden md:flex justify-between mt-2">
          {STEPS.map((step, i) => {
            const numero = i + 1;
            const concluido = numero < etapaAtual;
            const atual = numero === etapaAtual;
            return (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    concluido
                      ? "bg-brand-green text-white"
                      : atual
                      ? "bg-brand-blue text-white scale-110"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {concluido ? <Check className="w-3 h-3" /> : numero}
                </div>
                <span
                  className={`text-[10px] hidden lg:block ${
                    atual ? "text-brand-blue font-semibold" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
