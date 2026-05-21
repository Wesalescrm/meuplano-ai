import type {
  DadosCotacao,
  Plano,
  Operadora,
  PrecoPorFaixa,
  PlanoRecomendado,
  HospitalPreferido,
} from "@/types";

// =============================================
// Calcular preço total mensal para uma lista de beneficiários
// =============================================
function calcularPrecoTotal(
  precos: PrecoPorFaixa[],
  beneficiarios: { idade: number }[],
  estado: string
): number {
  const precosPorEstado = precos.filter(
    (p) => p.estado === estado || p.estado === "BR"
  );

  return beneficiarios.reduce((total, beneficiario) => {
    const faixa = precosPorEstado.find(
      (p) =>
        beneficiario.idade >= p.faixa_etaria_min &&
        beneficiario.idade <= p.faixa_etaria_max
    );
    return total + (faixa?.preco_mensal ?? 0);
  }, 0);
}

// =============================================
// Verificar quais hospitais preferidos estão na rede
// =============================================
function verificarRedeCoberta(
  redeCredenciada: { google_place_id?: string | null; nome_hospital: string }[],
  hospitaisPreferidos: HospitalPreferido[]
): { cobertos: HospitalPreferido[]; naoCobertos: HospitalPreferido[] } {
  const cobertos: HospitalPreferido[] = [];
  const naoCobertos: HospitalPreferido[] = [];

  for (const hospital of hospitaisPreferidos) {
    const coberto = redeCredenciada.some(
      (r) =>
        (r.google_place_id && r.google_place_id === hospital.place_id) ||
        r.nome_hospital
          .toLowerCase()
          .includes(hospital.nome.toLowerCase().split(" ")[0])
    );
    coberto ? cobertos.push(hospital) : naoCobertos.push(hospital);
  }

  return { cobertos, naoCobertos };
}

// =============================================
// Calcular score de compatibilidade (0-100)
// =============================================
interface ScoreInput {
  plano: Plano;
  precoTotal: number;
  orcamentoPorPessoa: number;
  numeroBeneficiarios: number;
  hospitaisCobertos: number;
  totalHospitaisPreferidos: number;
  dados: DadosCotacao;
}

function calcularScore({
  plano,
  precoTotal,
  orcamentoPorPessoa,
  numeroBeneficiarios,
  hospitaisCobertos,
  totalHospitaisPreferidos,
  dados,
}: ScoreInput): { score: number; positivos: string[]; negativos: string[] } {
  let score = 0;
  const positivos: string[] = [];
  const negativos: string[] = [];

  const orcamentoTotal = orcamentoPorPessoa * numeroBeneficiarios;

  // Critério 1: Orçamento (peso 30)
  if (precoTotal <= orcamentoTotal) {
    const folga = (orcamentoTotal - precoTotal) / orcamentoTotal;
    score += 30;
    if (folga > 0.2) positivos.push("Bem dentro do seu orçamento");
    else positivos.push("Dentro do seu orçamento");
  } else {
    const estouro = (precoTotal - orcamentoTotal) / orcamentoTotal;
    if (estouro < 0.15) {
      score += 15;
      negativos.push("Levemente acima do orçamento");
    } else if (estouro < 0.3) {
      score += 5;
      negativos.push("Acima do orçamento");
    } else {
      negativos.push("Significativamente acima do orçamento");
    }
  }

  // Critério 2: Hospitais cobertos (peso 25)
  if (totalHospitaisPreferidos > 0) {
    const pctCoberto = hospitaisCobertos / totalHospitaisPreferidos;
    score += Math.round(pctCoberto * 25);
    if (pctCoberto === 1) positivos.push("Cobre todos os hospitais de sua preferência");
    else if (pctCoberto >= 0.5) positivos.push(`Cobre ${hospitaisCobertos} de ${totalHospitaisPreferidos} hospitais preferidos`);
    else if (hospitaisCobertos === 0) negativos.push("Não cobre os hospitais de sua preferência");
    else negativos.push(`Cobre apenas ${hospitaisCobertos} de ${totalHospitaisPreferidos} hospitais preferidos`);
  } else {
    score += 15;
  }

  // Critério 3: Coparticipação (peso 15)
  const prefereCoparticipacao = dados.prefere_coparticipacao ?? false;
  if (plano.coparticipacao === prefereCoparticipacao) {
    score += 15;
    positivos.push(
      plano.coparticipacao
        ? "Com coparticipação conforme sua preferência"
        : "Sem coparticipação conforme sua preferência"
    );
  } else {
    score += 5;
    negativos.push(
      plano.coparticipacao
        ? "Possui coparticipação (não era sua preferência)"
        : "Sem coparticipação (mas você preferia pagar menos por mês)"
    );
  }

  // Critério 4: Telemedicina (peso 10)
  if (dados.prefere_telemedicina && plano.telemedicina) {
    score += 10;
    positivos.push("Inclui telemedicina");
  } else if (!dados.prefere_telemedicina && !plano.telemedicina) {
    score += 8;
  } else if (plano.telemedicina) {
    score += 6;
    positivos.push("Inclui telemedicina como bônus");
  }

  // Critério 5: Perfil de uso e cobertura (peso 10)
  const coberturas = plano.coberturas as string[];
  if (dados.frequencia_uso === "frequentemente") {
    if (coberturas.some((c) => c.toLowerCase().includes("ilimitad"))) {
      score += 10;
      positivos.push("Consultas ilimitadas para uso frequente");
    } else {
      score += 3;
      negativos.push("Pode ter limitações para uso frequente");
    }
  } else {
    score += 8;
  }

  // Critério 6: Condição pré-existente / medicamentos (peso 10)
  if (dados.tem_condicao_preexistente || dados.usa_medicamentos_continuos) {
    if (coberturas.some((c) => c.toLowerCase().includes("exame"))) {
      score += 10;
      positivos.push("Boa cobertura de exames e acompanhamento");
    } else {
      score += 4;
      negativos.push("Verifique cobertura para condições pré-existentes");
    }
  } else {
    score += 8;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    positivos,
    negativos,
  };
}

// =============================================
// Função principal: recomendar planos
// =============================================
export interface PlanoComDados extends Plano {
  operadora: Operadora;
  precos: PrecoPorFaixa[];
  rede: { google_place_id: string | null; nome_hospital: string }[];
}

export function recomendarPlanos(
  dados: DadosCotacao,
  planosDisponiveis: PlanoComDados[]
): PlanoRecomendado[] {
  if (!dados.beneficiarios || dados.beneficiarios.length === 0) return [];

  const estado = dados.endereco?.uf ?? "SP";
  const beneficiarios = dados.beneficiarios;
  const orcamentoPorPessoa = dados.orcamento_por_pessoa ?? 500;
  const hospitaisPreferidos = dados.hospitais_preferidos ?? [];

  const resultados: (PlanoRecomendado & { _scoreRaw: number })[] = [];

  for (const plano of planosDisponiveis) {
    // Filtrar por tipo de plano
    if (dados.tipo_plano && plano.tipo !== dados.tipo_plano) {
      if (
        !(
          dados.tipo_plano === "familiar" &&
          ["individual", "familiar"].includes(plano.tipo)
        )
      ) {
        continue;
      }
    }

    const precoTotal = calcularPrecoTotal(plano.precos, beneficiarios, estado);
    if (precoTotal === 0) continue; // Sem preço para o estado

    const { cobertos, naoCobertos } = verificarRedeCoberta(
      plano.rede,
      hospitaisPreferidos
    );

    const { score, positivos, negativos } = calcularScore({
      plano,
      precoTotal,
      orcamentoPorPessoa,
      numeroBeneficiarios: beneficiarios.length,
      hospitaisCobertos: cobertos.length,
      totalHospitaisPreferidos: hospitaisPreferidos.length,
      dados,
    });

    resultados.push({
      plano,
      operadora: plano.operadora,
      preco_total_mensal: precoTotal,
      preco_por_pessoa: precoTotal / beneficiarios.length,
      score,
      motivos_positivos: positivos,
      motivos_negativos: negativos,
      hospitais_cobertos: cobertos,
      hospitais_nao_cobertos: naoCobertos,
      categoria: "melhor_custo_beneficio",
      _scoreRaw: score,
    });
  }

  // Ordenar por score
  resultados.sort((a, b) => b._scoreRaw - a._scoreRaw);

  // Pegar top 4 e atribuir categorias
  const top4 = resultados.slice(0, 4);

  if (top4.length === 0) return [];

  // Ordenar por preço para encontrar o mais completo
  const porPreco = [...top4].sort(
    (a, b) => b.preco_total_mensal - a.preco_total_mensal
  );

  // Categorias
  top4[0].categoria = "melhor_custo_beneficio";
  if (porPreco[0] !== top4[0]) {
    porPreco[0].categoria = "melhor_plano";
  } else {
    if (top4[1]) top4[1].categoria = "melhor_plano";
  }

  const restantes = top4.filter(
    (p) =>
      p.categoria !== "melhor_custo_beneficio" &&
      p.categoria !== "melhor_plano"
  );
  if (restantes[0]) restantes[0].categoria = "meio_termo_1";
  if (restantes[1]) restantes[1].categoria = "meio_termo_2";

  // Garantir que todos têm categoria
  for (const p of top4) {
    if (
      p.categoria !== "melhor_custo_beneficio" &&
      p.categoria !== "melhor_plano" &&
      p.categoria !== "meio_termo_1" &&
      p.categoria !== "meio_termo_2"
    ) {
      p.categoria = "meio_termo_2";
    }
  }

  // Remover campo interno
  return top4.map(({ _scoreRaw: _r, ...rest }) => rest);
}
