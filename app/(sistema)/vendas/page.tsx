"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";

const produtos: { id: number; nome: string; custo: number }[] = [];

export default function VendasPage() {
  const [margem, setMargem] = useState(0);
  const [unidadesProjetadas, setUnidadesProjetadas] = useState(0);
  const [crescimento, setCrescimento] = useState(0);

  const cards = useMemo(
    () =>
      produtos.map((produto) => ({
        ...produto,
        precoVenda: produto.custo * (1 + margem / 100),
        projecaoUnidades: Math.max(
          0,
          Math.round(unidadesProjetadas * (1 + crescimento / 100))
        ),
      })),
    [margem, unidadesProjetadas, crescimento]
  );

  const faturamentoProjetado = useMemo(
    () =>
      cards.reduce(
        (acc, produto) => acc + produto.precoVenda * produto.projecaoUnidades,
        0
      ),
    [cards]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-white p-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Margem de lucro (%)</label>
          <Input
            type="number"
            value={margem}
            onChange={(e) => setMargem(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Unidades base por produto</label>
          <Input
            type="number"
            value={unidadesProjetadas}
            onChange={(e) => setUnidadesProjetadas(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Crescimento projetado (%)</label>
          <Input
            type="number"
            value={crescimento}
            onChange={(e) => setCrescimento(Number(e.target.value))}
          />
        </div>
      </div>
      <Card
        title="Faturamento Projetado (mensal)"
        value={`R$ ${faturamentoProjetado.toFixed(2)}`}
        valueClassName={faturamentoProjetado >= 0 ? "text-success" : "text-danger"}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((produto) => (
          <Card key={produto.id} className="space-y-1">
            <h2 className="text-lg font-semibold">{produto.nome}</h2>
            <p className="text-sm text-slate-500">Custo: R$ {produto.custo.toFixed(2)}</p>
            <p className="text-base font-medium text-primary">
              Preço de venda: R$ {produto.precoVenda.toFixed(2)}
            </p>
            <p className="text-sm text-slate-500">
              Projeção de unidades: {produto.projecaoUnidades}
            </p>
            <p className="text-base font-medium text-success">
              Projeção de vendas: R$ {(produto.precoVenda * produto.projecaoUnidades).toFixed(2)}
            </p>
          </Card>
        ))}
        {cards.length === 0 ? (
          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 text-center text-slate-500">
            Nenhum produto cadastrado para projeção de vendas.
          </div>
        ) : null}
      </div>
    </div>
  );
}
