"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type MateriaPrimaItem,
  getCustoMateriaPrimaTotal,
  loadMateriaPrimaFromStorage,
  saveMateriaPrimaToStorage,
} from "@/lib/materiaPrima";

export default function MateriaPrimaPage() {
  const [itens, setItens] = useState<MateriaPrimaItem[]>([]);
  const custoTotal = useMemo(() => getCustoMateriaPrimaTotal(itens), [itens]);

  useEffect(() => {
    setItens(loadMateriaPrimaFromStorage());
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const imagem = String(formData.get("imagem") ?? "").trim();
    const qtd = Number(formData.get("qtd") ?? 0);
    const valor = Number(formData.get("valor") ?? 0);

    if (!nome || !imagem || qtd <= 0 || valor <= 0) {
      return;
    }

    const novosItens = [...itens, { id: Date.now(), nome, imagem, qtd, valor }];
    setItens(novosItens);
    saveMateriaPrimaToStorage(novosItens);
    event.currentTarget.reset();
  }

  function removeItem(id: number) {
    const novosItens = itens.filter((item) => item.id !== id);
    setItens(novosItens);
    saveMateriaPrimaToStorage(novosItens);
  }

  return (
    <div className="space-y-6">
      <Card
        title="Custo operacional automático (matéria-prima)"
        value={`R$ ${custoTotal.toFixed(2)}`}
      />
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-white p-5 md:grid-cols-4">
        <Input name="nome" placeholder="Nome da matéria-prima" required />
        <Input name="imagem" placeholder="URL da imagem" required />
        <Input name="qtd" type="number" placeholder="Quantidade" min={1} required />
        <Input name="valor" type="number" placeholder="Valor unitário" min={0.01} step="0.01" required />
        <Button type="submit" className="md:col-span-4">
          Adicionar matéria-prima
        </Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <img src={item.imagem} alt={item.nome} className="h-40 w-full rounded-xl object-cover" />
            <h2 className="mt-3 text-lg font-semibold">{item.nome}</h2>
            <p className="text-sm text-slate-500">Qtd: {item.qtd}</p>
            <p className="text-sm text-slate-500">Valor unitário: R$ {item.valor.toFixed(2)}</p>
            <p className="text-base font-medium text-primary">
              Total: R$ {(item.qtd * item.valor).toFixed(2)}
            </p>
            <Button variant="outline" className="mt-3 w-full" onClick={() => removeItem(item.id)}>
              Remover
            </Button>
          </div>
        ))}
        {itens.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border bg-white p-6 text-center text-slate-500">
            Nenhuma matéria-prima cadastrada.
          </div>
        ) : null}
      </div>
    </div>
  );
}
