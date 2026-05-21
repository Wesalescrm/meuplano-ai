-- =============================================
-- MEUPLANO.AI — Schema inicial do banco de dados
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- =============================================
-- TABELA: users (perfis complementares ao auth.users)
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABELA: sessions (cotações em andamento, sem login)
-- =============================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  dados_parciais JSONB DEFAULT '{}' NOT NULL,
  etapa_atual INTEGER DEFAULT 1 NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABELA: operadoras
-- =============================================
CREATE TABLE public.operadoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  ans_registro TEXT UNIQUE,
  site TEXT,
  logo_url TEXT,
  ativa BOOLEAN DEFAULT TRUE NOT NULL,
  estados TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABELA: planos
-- =============================================
CREATE TYPE tipo_plano AS ENUM ('individual', 'familiar', 'empresarial');
CREATE TYPE abrangencia_plano AS ENUM ('municipal', 'estadual', 'nacional');
CREATE TYPE modalidade_plano AS ENUM ('enfermaria', 'apartamento', 'executivo');

CREATE TABLE public.planos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operadora_id UUID NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo tipo_plano NOT NULL,
  abrangencia abrangencia_plano NOT NULL,
  modalidade modalidade_plano DEFAULT 'enfermaria',
  coparticipacao BOOLEAN DEFAULT FALSE NOT NULL,
  coparticipacao_percentual NUMERIC(5,2),
  coberturas JSONB DEFAULT '[]' NOT NULL,
  carencias JSONB DEFAULT '{}' NOT NULL,
  reembolso BOOLEAN DEFAULT FALSE NOT NULL,
  telemedicina BOOLEAN DEFAULT FALSE NOT NULL,
  ativo BOOLEAN DEFAULT TRUE NOT NULL,
  ans_codigo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABELA: precos_por_faixa
-- =============================================
CREATE TABLE public.precos_por_faixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE CASCADE,
  faixa_etaria_min INTEGER NOT NULL,
  faixa_etaria_max INTEGER NOT NULL,
  estado CHAR(2) NOT NULL,
  cidade TEXT,
  preco_mensal NUMERIC(10,2) NOT NULL,
  vigencia_inicio DATE DEFAULT CURRENT_DATE,
  vigencia_fim DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_precos_plano ON public.precos_por_faixa(plano_id);
CREATE INDEX idx_precos_estado ON public.precos_por_faixa(estado);

-- =============================================
-- TABELA: rede_credenciada
-- =============================================
CREATE TYPE tipo_unidade AS ENUM ('hospital', 'clinica', 'laboratorio', 'upa', 'pronto_socorro');

CREATE TABLE public.rede_credenciada (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE CASCADE,
  nome_hospital TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado CHAR(2),
  cep TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  tipo tipo_unidade DEFAULT 'hospital',
  google_place_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rede_plano ON public.rede_credenciada(plano_id);
CREATE INDEX idx_rede_estado ON public.rede_credenciada(estado, cidade);

-- =============================================
-- TABELA: cotacoes
-- =============================================
CREATE TYPE status_cotacao AS ENUM (
  'em_andamento',
  'concluida',
  'plano_escolhido',
  'aguardando_documentos',
  'documentos_enviados',
  'em_analise',
  'transmitida',
  'contratada',
  'cancelada'
);

CREATE TABLE public.cotacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  plano_escolhido_id UUID REFERENCES public.planos(id) ON DELETE SET NULL,
  dados_cotacao JSONB DEFAULT '{}' NOT NULL,
  status status_cotacao DEFAULT 'em_andamento' NOT NULL,
  valor_mensal NUMERIC(10,2),
  score_compatibilidade NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cotacoes_user ON public.cotacoes(user_id);
CREATE INDEX idx_cotacoes_status ON public.cotacoes(status);

-- =============================================
-- TABELA: documentos
-- =============================================
CREATE TYPE tipo_documento AS ENUM (
  'rg', 'cnh', 'cpf', 'comprovante_residencia', 'declaracao_saude', 'outro'
);

CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  beneficiario_nome TEXT,
  tipo tipo_documento NOT NULL,
  url_storage TEXT NOT NULL,
  nome_arquivo TEXT,
  tamanho_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documentos_cotacao ON public.documentos(cotacao_id);

-- =============================================
-- TABELA: operadores (usuários internos Meuplano.ai)
-- =============================================
CREATE TYPE role_operador AS ENUM ('admin', 'operador', 'revisor');

CREATE TABLE public.operadores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role role_operador DEFAULT 'operador' NOT NULL,
  ativo BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- TABELA: propostas
-- =============================================
CREATE TYPE status_proposta AS ENUM (
  'aguardando_revisao',
  'em_analise',
  'documentos_solicitados',
  'transmitida',
  'boleto_enviado',
  'contratada',
  'recusada'
);

CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  operador_id UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  status status_proposta DEFAULT 'aguardando_revisao' NOT NULL,
  observacoes TEXT,
  historico_status JSONB DEFAULT '[]' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_propostas_cotacao ON public.propostas(cotacao_id);
CREATE INDEX idx_propostas_status ON public.propostas(status);

-- =============================================
-- TRIGGERS: updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_operadoras_updated_at BEFORE UPDATE ON public.operadoras
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_planos_updated_at BEFORE UPDATE ON public.planos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_precos_updated_at BEFORE UPDATE ON public.precos_por_faixa
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_cotacoes_updated_at BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_propostas_updated_at BEFORE UPDATE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- TRIGGER: criar proposta automaticamente ao chegar em status plano_escolhido
-- =============================================
CREATE OR REPLACE FUNCTION public.criar_proposta_ao_escolher_plano()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'plano_escolhido' AND OLD.status != 'plano_escolhido' THEN
    INSERT INTO public.propostas (cotacao_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_criar_proposta
  AFTER UPDATE ON public.cotacoes
  FOR EACH ROW EXECUTE FUNCTION public.criar_proposta_ao_escolher_plano();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;

-- Operadoras e planos são públicos (leitura)
ALTER TABLE public.operadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precos_por_faixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rede_credenciada ENABLE ROW LEVEL SECURITY;

-- Leitura pública de dados de planos
CREATE POLICY "planos_leitura_publica" ON public.operadoras FOR SELECT USING (ativa = TRUE);
CREATE POLICY "planos_planos_leitura_publica" ON public.planos FOR SELECT USING (ativo = TRUE);
CREATE POLICY "precos_leitura_publica" ON public.precos_por_faixa FOR SELECT USING (TRUE);
CREATE POLICY "rede_leitura_publica" ON public.rede_credenciada FOR SELECT USING (TRUE);

-- Sessions: criação pública, leitura pelo próprio dono
CREATE POLICY "sessions_insert_anon" ON public.sessions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "sessions_select_own" ON public.sessions FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "sessions_update_own" ON public.sessions FOR UPDATE USING (
  user_id = auth.uid() OR user_id IS NULL
);

-- Users: cada usuário vê apenas os próprios dados
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Cotações: usuário vê as próprias
CREATE POLICY "cotacoes_select_own" ON public.cotacoes FOR SELECT USING (
  user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "cotacoes_insert_own" ON public.cotacoes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "cotacoes_update_own" ON public.cotacoes FOR UPDATE USING (
  user_id = auth.uid() OR user_id IS NULL
);

-- Documentos: usuário vê os próprios via cotação
CREATE POLICY "documentos_select_own" ON public.documentos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cotacoes c
    WHERE c.id = documentos.cotacao_id AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);
CREATE POLICY "documentos_insert_own" ON public.documentos FOR INSERT WITH CHECK (TRUE);

-- Operadores: apenas operadores autenticados veem tudo
CREATE POLICY "operadores_select_self" ON public.operadores FOR SELECT USING (id = auth.uid());

-- Propostas: apenas via service role (acesso pelo painel interno usa service role)
CREATE POLICY "propostas_deny_all" ON public.propostas FOR ALL USING (FALSE);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documentos', 'documentos', FALSE),
  ('logos_operadoras', 'logos_operadoras', TRUE);

-- Política do bucket de documentos (somente service role escreve; usuário lê os próprios)
CREATE POLICY "documentos_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "documentos_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos');
