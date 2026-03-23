"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TipoKpi = "campo" | "formula";
type CampoSistema = "receitaTotal" | "gastoTotal" | "capitalInvestido" | "lucroLiquido" | "rentabilidade";
type FormulaKpi = "lucroLiquido" | "rentabilidade" | "margemLiquida";

type KpiConfig = {
  id: number;
  nome: string;
  tipo: TipoKpi;
  campo?: CampoSistema;
  formula?: FormulaKpi;
};

export default function KpisPage() {
  const [receitaTotal, setReceitaTotal] = useState(0);
  const [gastoTotal, setGastoTotal] = useState(0);
  const [capitalInvestido, setCapitalInvestido] = useState(0);
  const [tipoCadastro, setTipoCadastro] = useState<TipoKpi>("campo");
  const [campoSelecionado, setCampoSelecionado] = useState<CampoSistema>("lucroLiquido");
  const [formulaSelecionada, setFormulaSelecionada] = useState<FormulaKpi>("rentabilidade");
  const [kpis, setKpis] = useState<KpiConfig[]>([]);

  const lucroLiquido = useMemo(() => receitaTotal - gastoTotal, [receitaTotal, gastoTotal]);
  const rentabilidade = useMemo(
    () => (capitalInvestido > 0 ? (lucroLiquido / capitalInvestido) * 100 : 0),
    [lucroLiquido, capitalInvestido]
  );
  const margemLiquida = useMemo(
    () => (receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0),
    [lucroLiquido, receitaTotal]
  );

  const valores = useMemo(
    () => ({
      receitaTotal,
      gastoTotal,
      capitalInvestido,
      lucroLiquido,
      rentabilidade,
      margemLiquida,
    }),
    [receitaTotal, gastoTotal, capitalInvestido, lucroLiquido, rentabilidade, margemLiquida]
  );

  function valorAtualKpi(kpi: KpiConfig) {
    if (kpi.tipo === "campo" && kpi.campo) {
      return valores[kpi.campo];
    }
    if (kpi.tipo === "formula" && kpi.formula) {
      if (kpi.formula === "lucroLiquido") {
        return valores.lucroLiquido;
      }
      if (kpi.formula === "rentabilidade") {
        return valores.rentabilidade;
      }
      return valores.margemLiquida;
    }
    return 0;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    if (!nome) {
      return;
    }

    setKpis((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome,
        tipo: tipoCadastro,
        campo: tipoCadastro === "campo" ? campoSelecionado : undefined,
        formula: tipoCadastro === "formula" ? formulaSelecionada : undefined,
      },
    ]);
    event.currentTarget.reset();
  }

  function removerKpi(id: number) {
    setKpis((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1 rounded-2xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-slate-600">Receita total</label>
          <Input type="number" value={receitaTotal} onChange={(e) => setReceitaTotal(Number(e.target.value))} />
        </div>
        <div className="space-y-1 rounded-2xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-slate-600">Gasto total</label>
          <Input type="number" value={gastoTotal} onChange={(e) => setGastoTotal(Number(e.target.value))} />
        </div>
        <div className="space-y-1 rounded-2xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-slate-600">Capital investido (CI)</label>
          <Input
            type="number"
            value={capitalInvestido}
            onChange={(e) => setCapitalInvestido(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Lucro Líquido (LL)" value={`R$ ${lucroLiquido.toFixed(2)}`} valueClassName={lucroLiquido >= 0 ? "text-success" : "text-danger"} />
        <Card title="Rentabilidade" value={`${rentabilidade.toFixed(2)}%`} valueClassName={rentabilidade >= 0 ? "text-success" : "text-danger"} />
        <Card title="Margem Líquida" value={`${margemLiquida.toFixed(2)}%`} />
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Nome do KPI</label>
          <Input name="nome" placeholder="Ex: Meta de rentabilidade" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Tipo</label>
          <select
            value={tipoCadastro}
            onChange={(e) => setTipoCadastro(e.target.value as TipoKpi)}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="campo">Campo do sistema</option>
            <option value="formula">Fórmula</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Origem do valor</label>
          {tipoCadastro === "campo" ? (
            <select
              value={campoSelecionado}
              onChange={(e) => setCampoSelecionado(e.target.value as CampoSistema)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="receitaTotal">Receita total</option>
              <option value="gastoTotal">Gasto total</option>
              <option value="capitalInvestido">Capital investido</option>
              <option value="lucroLiquido">Lucro líquido</option>
              <option value="rentabilidade">Rentabilidade</option>
            </select>
          ) : (
            <select
              value={formulaSelecionada}
              onChange={(e) => setFormulaSelecionada(e.target.value as FormulaKpi)}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="lucroLiquido">LL = Receita total - Gasto total</option>
              <option value="rentabilidade">Rentabilidade = (LL / CI) x 100</option>
              <option value="margemLiquida">Margem líquida = (LL / Receita) x 100</option>
            </select>
          )}
        </div>
        <Button type="submit" className="lg:mt-6">
          Cadastrar KPI
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">KPIs cadastrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-slate-500">
                <th className="px-5 py-3 font-medium">KPI</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 text-right font-medium">Valor atual</th>
                <th className="px-5 py-3 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi) => {
                const valor = valorAtualKpi(kpi);
                const isPercentual = kpi.campo === "rentabilidade" || kpi.formula === "rentabilidade" || kpi.formula === "margemLiquida";
                return (
                  <tr key={kpi.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-5 py-3 font-medium text-foreground">{kpi.nome}</td>
                    <td className="px-5 py-3">{kpi.tipo === "campo" ? "Campo" : "Fórmula"}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${valor >= 0 ? "text-success" : "text-danger"}`}>
                      {isPercentual ? `${valor.toFixed(2)}%` : `R$ ${valor.toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" onClick={() => removerKpi(kpi.id)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {kpis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
                    Cadastre um KPI para acompanhar os resultados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
