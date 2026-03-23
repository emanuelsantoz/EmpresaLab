"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MetaProduto = {
  id: number;
  produto: string;
  periodo: string;
  valorVenda: number;
  valorProducao: number;
  operacoes: number;
};

const periodos = [
  "1º Período",
  "2º Período",
  "3º Período",
  "4º Período",
  "5º Período",
  "6º Período",
  "7º Período",
  "8º Período",
  "9º Período",
  "10º Período",
  "11º Período",
  "12º Período",
];

export default function MetasPage() {
  const [metas, setMetas] = useState<MetaProduto[]>([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(periodos[0]);

  const resumo = useMemo(() => {
    const resultadoTotal = metas.reduce(
      (acc, item) => acc + (item.valorVenda - item.valorProducao) * item.operacoes,
      0
    );
    const lucroMedioOperacao =
      metas.length > 0
        ? metas.reduce((acc, item) => acc + (item.valorVenda - item.valorProducao), 0) / metas.length
        : 0;
    return { resultadoTotal, lucroMedioOperacao };
  }, [metas]);

  function cadastrarMeta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const produto = String(formData.get("produto") ?? "").trim();
    const valorVenda = Number(formData.get("valorVenda") ?? 0);
    const valorProducao = Number(formData.get("valorProducao") ?? 0);
    const operacoes = Number(formData.get("operacoes") ?? 0);

    if (!produto || valorVenda <= 0 || valorProducao < 0 || operacoes <= 0) {
      return;
    }

    setMetas((prev) => [
      ...prev,
      {
        id: Date.now(),
        produto,
        periodo: periodoSelecionado,
        valorVenda,
        valorProducao,
        operacoes,
      },
    ]);
    event.currentTarget.reset();
  }

  function removerMeta(id: number) {
    setMetas((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Lucro líquido (LL)" value={`R$ ${resumo.resultadoTotal.toFixed(2)}`} valueClassName={resumo.resultadoTotal >= 0 ? "text-success" : "text-danger"} />
        <Card title="Lucro por operação" value={`R$ ${resumo.lucroMedioOperacao.toFixed(2)}`} />
        <Card title="Metas cadastradas" value={String(metas.length)} />
      </div>

      <form onSubmit={cadastrarMeta} className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Período</label>
          <select
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {periodos.map((periodo) => (
              <option key={periodo} value={periodo}>
                {periodo}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Produto</label>
          <Input name="produto" placeholder="Nome do produto" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Valor de venda</label>
          <Input name="valorVenda" type="number" min={0.01} step="0.01" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Valor de produção</label>
          <Input name="valorProducao" type="number" min={0} step="0.01" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600">Operações no período</label>
          <Input name="operacoes" type="number" min={1} step="1" required />
        </div>
        <Button type="submit" className="md:col-span-2 lg:col-span-5">
          Adicionar meta
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">Metas por produto e período</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Período</th>
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 text-right font-medium">Venda</th>
                <th className="px-5 py-3 text-right font-medium">Produção</th>
                <th className="px-5 py-3 text-right font-medium">Lucro por operação</th>
                <th className="px-5 py-3 text-right font-medium">Resultado final</th>
                <th className="px-5 py-3 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {metas.map((item) => {
                const lucroOperacao = item.valorVenda - item.valorProducao;
                const resultadoFinal = lucroOperacao * item.operacoes;
                return (
                  <tr key={item.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-5 py-3">{item.periodo}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{item.produto}</td>
                    <td className="px-5 py-3 text-right">R$ {item.valorVenda.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">R$ {item.valorProducao.toFixed(2)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${lucroOperacao >= 0 ? "text-success" : "text-danger"}`}>
                      R$ {lucroOperacao.toFixed(2)}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold ${resultadoFinal >= 0 ? "text-success" : "text-danger"}`}>
                      R$ {resultadoFinal.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" onClick={() => removerMeta(item.id)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {metas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                    Cadastre uma meta para começar.
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
