"use client";

import { usePathname } from "next/navigation";
import ThemeControls from "@/components/ThemeControls";

const labels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dre": "DRE",
  "/fluxo-caixa": "Fluxo de Caixa",
  "/estoque": "Estoque",
  "/materia-prima": "Matéria Prima",
  "/balanco-gerencial": "Balanço Gerencial",
  "/metas": "Metas",
  "/kpis": "KPIs",
  "/vendas": "Vendas",
  "/empresa": "Empresa",
  "/cadastro-empresas": "Cadastro de Empresas",
};

export default function Header() {
  const pathname = usePathname();
  const title = labels[pathname] ?? "Dashboard";

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-slate-500">
          Visão anual, projetada e realizada em tempo real
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeControls />
        <div className="rounded-xl bg-muted px-3 py-2 text-sm font-medium text-primary">
          Empresa ativa
        </div>
      </div>
    </header>
  );
}
