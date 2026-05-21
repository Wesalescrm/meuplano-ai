import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meuplano.ai — Encontre o melhor plano de saúde para você",
  description:
    "Cotação inteligente de planos de saúde. Sem corretores, sem viés. Recomendamos o melhor plano de verdade, com transparência total.",
  keywords: "plano de saúde, cotação, ANS, saúde, seguro saúde, comparar planos",
  openGraph: {
    title: "Meuplano.ai",
    description: "Encontre o melhor plano de saúde sem corretores",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
