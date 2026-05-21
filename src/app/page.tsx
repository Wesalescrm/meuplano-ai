import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Meuplano<span className="text-gradient">.ai</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-gray-600 hover:text-brand-blue transition-colors">
              Como funciona
            </a>
            <a href="#vantagens" className="text-sm text-gray-600 hover:text-brand-blue transition-colors">
              Vantagens
            </a>
            <Link href="/painel/login">
              <Button variant="outline" size="sm">
                Área do operador
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light via-white to-brand-green-light -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-brand-blue/20 rounded-full px-4 py-2 text-sm text-brand-blue font-medium mb-6 shadow-sm">
            <Star className="w-4 h-4 fill-brand-blue" />
            Recomendação 100% imparcial por IA
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Encontre o melhor plano de saúde{" "}
            <span className="text-gradient">sem corretores</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nossa IA analisa seu perfil, sua localização e suas preferências para
            recomendar o plano certo para você. Transparência total, sem viés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacao">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-blue/20">
                Fazer cotação grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver como funciona
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Sem cadastro. Leva menos de 5 minutos.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { valor: "+500", label: "Planos comparados" },
            { valor: "+50", label: "Operadoras cadastradas" },
            { valor: "94%", label: "Taxa de satisfação" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold text-gradient mb-1">
                {stat.valor}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Como funciona
            </h2>
            <p className="text-gray-500 text-lg">
              6 etapas simples. Resultado em minutos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                titulo: "Seus dados básicos",
                desc: "Informe as idades dos beneficiários e seu CEP. A localização nos ajuda a filtrar planos disponíveis na sua região.",
                icon: <MapPin className="w-6 h-6" />,
              },
              {
                step: "2",
                titulo: "Hospitais preferidos",
                desc: "Mostramos hospitais e clínicas próximos a você. Marque quais são importantes e priorizamos planos que cobrem eles.",
                icon: <ShieldCheck className="w-6 h-6" />,
              },
              {
                step: "3",
                titulo: "Seu perfil de saúde",
                desc: "Com que frequência você usa planos? Tem condições especiais? Quanto deseja pagar por mês? Tudo influencia na recomendação.",
                icon: <TrendingUp className="w-6 h-6" />,
              },
              {
                step: "4",
                titulo: "4 planos rankeados",
                desc: "Nossa IA recomenda os 4 melhores planos com score de compatibilidade, preços e coberturas detalhadas.",
                icon: <Star className="w-6 h-6" />,
              },
              {
                step: "5",
                titulo: "Pagamento e carências",
                desc: "Tudo explicado em português claro: quando começa a cobertura, quanto custa e como pagar.",
                icon: <CheckCircle2 className="w-6 h-6" />,
              },
              {
                step: "6",
                titulo: "Envio de documentos",
                desc: "Faça upload dos documentos e um especialista confirma tudo em até 24h pelo WhatsApp.",
                icon: <ArrowRight className="w-6 h-6" />,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-blue/30 hover:shadow-lg hover:shadow-brand-blue/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center font-bold text-sm group-hover:bg-gradient-brand group-hover:text-white transition-all">
                    {item.step}
                  </div>
                  <div className="text-brand-blue">{item.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section id="vantagens" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Por que usar o Meuplano.ai?
            </h2>
            <p className="text-gray-500 text-lg">
              Não somos um corretor. Somos seu consultor digital imparcial.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                titulo: "Sem comissões",
                desc: "Corretores ganham comissão pelas vendas. Nós não. Nossa recomendação é baseada apenas no seu perfil.",
              },
              {
                titulo: "Dados reais da ANS",
                desc: "Usamos dados oficiais da Agência Nacional de Saúde Suplementar e direto dos sites das operadoras.",
              },
              {
                titulo: "Score de compatibilidade",
                desc: "Cada plano recebe um score de 0 a 100% baseado em quanto ele atende suas necessidades específicas.",
              },
              {
                titulo: "Sem letras miúdas",
                desc: "Explicamos carências, coparticipação e coberturas em português simples e direto.",
              },
              {
                titulo: "Seus hospitais, prioridade",
                desc: "Você escolhe quais hospitais são importantes. A IA só recomenda planos que cobrem eles.",
              },
              {
                titulo: "Processo 100% digital",
                desc: "Da cotação à contratação, tudo online. Sem reuniões, sem ligações não solicitadas.",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.titulo}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-blue to-brand-green">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Pronto para encontrar seu plano ideal?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Grátis, sem compromisso, sem telefonemas indesejados.
          </p>
          <Link href="/cotacao">
            <Button
              size="lg"
              className="bg-white text-brand-blue hover:bg-white/90 shadow-xl"
            >
              Iniciar cotação grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-gray-100">
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
            © 2024 Meuplano.ai — Todos os direitos reservados
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
