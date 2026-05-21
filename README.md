# Meuplano.ai

Plataforma web de cotação inteligente de planos de saúde para todo o Brasil.

## Stack
- Next.js 14 + TypeScript
- Tailwind CSS + componentes UI customizados
- Supabase (banco, auth, storage)
- Node-cron para jobs de atualização de preços
- Google Places API para hospitais próximos

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de ambiente
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

Variáveis necessárias:
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Chave anon do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (somente server-side)
- `GOOGLE_PLACES_API_KEY` — Para buscar hospitais próximos (opcional em dev)
- `RESEND_API_KEY` — Para envio de e-mails
- `WHATSAPP_API_URL` + `WHATSAPP_API_KEY` — Para notificações WhatsApp

### 3. Banco de dados (Supabase)
Execute as migrations no painel SQL do Supabase:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_planos.sql`

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── cotacao/page.tsx         # Fluxo de cotação (6 etapas)
│   ├── painel/                  # Painel interno de operadores
│   └── api/                     # API Routes
│       ├── viacep/              # Autocomplete de CEP
│       ├── places/              # Hospitais próximos (Google Places)
│       ├── cotacao/             # Motor de recomendação
│       ├── sessao/              # Gerenciamento de sessões
│       ├── documentos/          # Upload de documentos
│       └── painel/              # APIs do painel interno
├── components/
│   ├── cotacao/                 # Steps 1-6 do fluxo
│   └── ui/                      # Componentes base
├── lib/
│   ├── supabase.ts              # Client Supabase
│   ├── recomendador.ts          # Motor de recomendação IA
│   ├── utils.ts                 # Utilitários
│   └── scraping/                # Scrapers e scheduler
├── types/                       # Tipos TypeScript globais
supabase/
└── migrations/                  # Schema SQL e seeds
scripts/
├── seed.ts                      # Seed inicial
└── scraper.ts                   # Atualização de preços
```

## Fluxo de cotação

1. **Dados básicos** — Idades, CEP, tipo de plano
2. **Hospitais preferidos** — Seleção via Google Places
3. **Perfil de uso** — Frequência, condições, orçamento
4. **Resultado** — 4 planos rankeados por IA (score de compatibilidade)
5. **Pagamento** — Resumo, carências, formas de pagamento
6. **Documentos** — Upload de RG, CPF, comprovante de residência

## Scripts úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run scraping     # Atualizar preços manualmente
npm run seed         # Inserir dados iniciais
```

## Deploy (Vercel)

1. Criar novo projeto no Vercel
2. Conectar ao repositório GitHub
3. Configurar variáveis de ambiente no painel do Vercel
4. Deploy automático a cada push na branch `main`
