import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  BarChart3,
  MapPin,
  Star,
  Clock,
} from "lucide-react";

const OPERADORAS = ["Amil", "SulAmérica", "Unimed", "Bradesco", "Hapvida", "NotreDame"];

const DORES = [
  "Corretor indica o plano que paga mais comissão pra ele",
  "Você não entende os termos do contrato (carência, coparticipação...)",
  "Seu hospital favorito não é coberto — você só descobre depois de assinar",
  "O plano parece barato mas cobra parte do atendimento na hora",
  "Semanas de ligações indesejadas após pedir uma simples cotação",
];

const ETAPAS = [
  {
    num: "01",
    titulo: "Seu perfil",
    subtitulo: "Menos de 1 minuto",
    desc: "Informe quantas pessoas, as idades e seu CEP. Sem cadastro, sem senha.",
    cor: "from-blue-50 to-indigo-50",
  },
  {
    num: "02",
    titulo: "Seus hospitais",
    subtitulo: "Opcional mas vale",
    desc: "Marque os hospitais e clínicas que você mais usa. A IA prioriza planos que cobrem eles.",
    cor: "from-violet-50 to-blue-50",
  },
  {
    num: "03",
    titulo: "IA analisa tudo",
    subtitulo: "Em segundos",
    desc: "Comparamos +500 planos de 50 operadoras e calculamos um score de compatibilidade para o seu perfil.",
    cor: "from-green-50 to-teal-50",
  },
  {
    num: "04",
    titulo: "Você escolhe e contrata",
    subtitulo: "100% online",
    desc: "Veja os 4 planos mais indicados, compare coberturas e carências em português claro, e contrate sem sair de casa.",
    cor: "from-teal-50 to-green-50",
  },
];

const VANTAGENS = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    titulo: "Dados oficiais da ANS",
    desc: "Usamos dados da Agência Nacional de Saúde Suplementar e direto dos sites das operadoras.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    titulo: "Score de 0 a 100%",
    desc: "Cada plano recebe uma nota baseada em quanto atende suas necessidades específicas.",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    titulo: "Seus hospitais, prioridade",
    desc: "Você indica os hospitais que importam. Só recomendamos planos que cobrem eles.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    titulo: "Resultado em 3 minutos",
    desc: "Sem formulários gigantes, sem esperar retorno. Você vê as opções na hora.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    titulo: "Sem letras miúdas",
    desc: "Explicamos carências, coparticipação e coberturas em português simples.",
  },
  {
    icon: <Star className="w-5 h-5" />,
    titulo: "Zero comissão",
    desc: "Corretores ganham comissão por venda. Nós não. Sua recomendação é 100% imparcial.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Meuplano<span className="text-gradient">.ai</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-gray-500 hover:text-brand-blue transition-colors font-medium">
              Como funciona
            </a>
            <a href="#vantagens" className="text-sm text-gray-500 hover:text-brand-blue transition-colors font-medium">
              Vantagens
            </a>
            <Link href="/painel/login">
              <Button variant="outline" size="sm">Área do operador</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef3ff] via-white to-[#e6faf4] -z-10" />
        {/* decoração geométrica sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-brand-blue/20 rounded-full px-4 py-2 text-sm text-brand-blue font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse inline-block" />
            IA + Dados da ANS em tempo real
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Encontre o plano de saúde certo.{" "}
            <span className="text-gradient">Sem corretor. Sem viés.</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Você responde 3 perguntas. Nossa IA analisa mais de{" "}
            <strong className="text-gray-700">500 planos</strong> e entrega os{" "}
            <strong className="text-gray-700">4 melhores para o seu perfil</strong> —
            com score de compatibilidade, seus hospitais e preço por pessoa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/cotacao">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-blue/25 text-base px-8">
                Fazer cotação grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Ver como funciona
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-green" /> 100% gratuito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-green" /> Sem cadastro
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-green" /> Menos de 3 minutos
            </span>
          </div>
        </div>
      </section>

      {/* ── OPERADORAS ─────────────────────────────────────── */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold mb-6">
            Comparamos as maiores operadoras do Brasil
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {OPERADORAS.map((op) => (
              <span key={op} className="text-gray-400 font-bold text-sm tracking-wide hover:text-gray-600 transition-colors">
                {op}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { valor: "+500", label: "Planos comparados", cor: "text-brand-blue" },
            { valor: "+50", label: "Operadoras", cor: "text-brand-blue" },
            { valor: "94%", label: "Taxa de satisfação", cor: "text-brand-green" },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <div className={`text-4xl font-extrabold ${s.cor}`}>{s.valor}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DORES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Você já passou por isso?
            </h2>
            <p className="text-gray-400">
              Escolher plano de saúde sem ajuda é uma cilada.
            </p>
          </div>
          <ul className="space-y-4">
            {DORES.map((dor) => (
              <li
                key={dor}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">{dor}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <p className="text-brand-green font-semibold text-lg mb-1">
              Com o Meuplano.ai, nada disso acontece.
            </p>
            <p className="text-gray-500 text-sm">
              IA imparcial, dados reais, zero ligações indesejadas.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Como funciona
            </h2>
            <p className="text-gray-500 text-lg">
              4 etapas. Do perfil ao plano ideal, em menos de 5 minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ETAPAS.map((e) => (
              <div
                key={e.num}
                className={`relative rounded-3xl bg-gradient-to-br ${e.cor} p-7 border border-gray-100 overflow-hidden`}
              >
                <span className="absolute right-6 top-4 text-8xl font-extrabold text-black/5 leading-none select-none">
                  {e.num}
                </span>
                <div className="relative">
                  <span className="inline-block text-xs font-bold text-brand-blue bg-white border border-brand-blue/20 rounded-full px-3 py-1 mb-4">
                    {e.subtitulo}
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                    {e.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/cotacao">
              <Button size="lg" className="shadow-lg shadow-brand-blue/20 px-10">
                Começar agora — é grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── VANTAGENS ──────────────────────────────────────── */}
      <section id="vantagens" className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Por que usar o Meuplano.ai?
            </h2>
            <p className="text-gray-500 text-lg">
              Não somos um corretor. Somos seu consultor digital imparcial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {VANTAGENS.map((v) => (
              <div
                key={v.titulo}
                className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/30 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{v.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-950">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-brand-green font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse inline-block" />
            Gratuito, sem cadastro
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
            Pronto para encontrar<br />seu plano ideal?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Sem compromisso. Sem telefonemas.<br />Resultado em menos de 3 minutos.
          </p>
          <Link href="/cotacao">
            <Button
              size="lg"
              className="bg-brand-green hover:bg-brand-green/90 text-white shadow-2xl shadow-brand-green/30 px-10 text-base"
            >
              Iniciar cotação grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-6 text-xs text-gray-600">
            Já economizamos em média R$180/mês para nossos usuários.
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-gray-900">
              Meuplano<span className="text-gradient">.ai</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 Meuplano.ai — Todos os direitos reservados
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/privacidade" className="hover:text-brand-blue transition-colors">
              Privacidade
            </a>
            <a href="/termos" className="hover:text-brand-blue transition-colors">
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
