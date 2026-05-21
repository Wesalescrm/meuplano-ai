// =============================================
// MEUPLANO.AI — Tipos globais
// =============================================

export type TipoPlano = "individual" | "familiar" | "empresarial";
export type AbrangenciaPlano = "municipal" | "estadual" | "nacional";
export type ModalidadePlano = "enfermaria" | "apartamento" | "executivo";
export type StatusCotacao =
  | "em_andamento"
  | "concluida"
  | "plano_escolhido"
  | "aguardando_documentos"
  | "documentos_enviados"
  | "em_analise"
  | "transmitida"
  | "contratada"
  | "cancelada";

export type StatusProposta =
  | "aguardando_revisao"
  | "em_analise"
  | "documentos_solicitados"
  | "transmitida"
  | "boleto_enviado"
  | "contratada"
  | "recusada";

export type TipoDocumento =
  | "rg"
  | "cnh"
  | "cpf"
  | "comprovante_residencia"
  | "declaracao_saude"
  | "outro";

// =============================================
// Banco de dados
// =============================================

export interface Operadora {
  id: string;
  nome: string;
  ans_registro: string | null;
  site: string | null;
  logo_url: string | null;
  ativa: boolean;
  estados: string[];
  created_at: string;
  updated_at: string;
}

export interface Plano {
  id: string;
  operadora_id: string;
  nome: string;
  tipo: TipoPlano;
  abrangencia: AbrangenciaPlano;
  modalidade: ModalidadePlano;
  coparticipacao: boolean;
  coparticipacao_percentual: number | null;
  coberturas: string[];
  carencias: CarenciasPlano;
  reembolso: boolean;
  telemedicina: boolean;
  ativo: boolean;
  ans_codigo: string | null;
  created_at: string;
  updated_at: string;
  // Join
  operadora?: Operadora;
  precos?: PrecoPorFaixa[];
}

export interface CarenciasPlano {
  consultas: number;
  exames_simples: number;
  exames_complexos: number;
  internacao: number;
  parto: number;
  urgencia: number;
}

export interface PrecoPorFaixa {
  id: string;
  plano_id: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number;
  estado: string;
  cidade: string | null;
  preco_mensal: number;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
}

export interface RedeCredenciada {
  id: string;
  plano_id: string;
  nome_hospital: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  lat: number | null;
  lng: number | null;
  tipo: string;
  google_place_id: string | null;
}

export interface Cotacao {
  id: string;
  session_id: string | null;
  user_id: string | null;
  plano_escolhido_id: string | null;
  dados_cotacao: DadosCotacao;
  status: StatusCotacao;
  valor_mensal: number | null;
  score_compatibilidade: number | null;
  created_at: string;
  updated_at: string;
}

export interface Proposta {
  id: string;
  cotacao_id: string;
  operador_id: string | null;
  status: StatusProposta;
  observacoes: string | null;
  historico_status: HistoricoStatus[];
  created_at: string;
  updated_at: string;
  // Joins
  cotacao?: Cotacao;
}

export interface HistoricoStatus {
  status: StatusProposta;
  timestamp: string;
  operador_nome?: string;
  observacao?: string;
}

export interface Documento {
  id: string;
  cotacao_id: string;
  beneficiario_nome: string | null;
  tipo: TipoDocumento;
  url_storage: string;
  nome_arquivo: string | null;
  tamanho_bytes: number | null;
  created_at: string;
}

// =============================================
// Fluxo de cotação (estado no cliente)
// =============================================

export interface Beneficiario {
  nome?: string;
  idade: number;
}

export interface HospitalPreferido {
  place_id: string;
  nome: string;
  endereco: string;
  distancia_km?: number;
  foto_url?: string;
  tipo?: string;
}

export interface DadosCotacao {
  // Etapa 1
  beneficiarios?: Beneficiario[];
  cep?: string;
  endereco?: EnderecoViaCEP;
  tipo_plano?: TipoPlano;

  // Etapa 2
  hospitais_preferidos?: HospitalPreferido[];

  // Etapa 3
  frequencia_uso?: "raramente" | "as_vezes" | "frequentemente";
  tem_condicao_preexistente?: boolean;
  usa_medicamentos_continuos?: boolean;
  faz_exames_rotina?: boolean;
  prefere_telemedicina?: boolean;
  prefere_coparticipacao?: boolean;
  orcamento_por_pessoa?: number;

  // Etapa 4 — resultado
  email?: string;
  telefone?: string;
}

export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  ddd: string;
  erro?: boolean;
}

// =============================================
// Motor de recomendação
// =============================================

export interface PlanoRecomendado {
  plano: Plano;
  operadora: Operadora;
  preco_total_mensal: number;
  preco_por_pessoa: number;
  score: number;
  motivos_positivos: string[];
  motivos_negativos: string[];
  hospitais_cobertos: HospitalPreferido[];
  hospitais_nao_cobertos: HospitalPreferido[];
  categoria: "melhor_custo_beneficio" | "melhor_plano" | "meio_termo_1" | "meio_termo_2";
}

// =============================================
// API responses
// =============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  distance_km?: number;
  photo_url?: string;
  types: string[];
  rating?: number;
}
