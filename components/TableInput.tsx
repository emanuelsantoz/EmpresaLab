"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = {
  id: number;
  tipo: "Entrada" | "Saída";
  valor: number;
  descricao: string;
};

export default function TableInput() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, tipo: "Entrada", valor: 500, descricao: "Venda à vista" },
    { id: 2, tipo: "Saída", valor: 200, descricao: "Fornecedor" },
  ]);

  const saldo = useMemo(
    () =>
      rows.reduce((acc, row) => {
        return row.tipo === "Entrada" ? acc + row.valor : acc - row.valor;
      }, 0),
    [rows]
  );

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), tipo: "Entrada", valor: 0, descricao: "" },
    ]);
  }

  function updateRow(id: number, key: keyof Row, value: string | number) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lançamentos</h2>
        <Button onClick={addRow}>Novo lançamento</Button>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-4">
            <select
              value={row.tipo}
              onChange={(e) => updateRow(row.id, "tipo", e.target.value as Row["tipo"])}
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm"
            >
              <option>Entrada</option>
              <option>Saída</option>
            </select>
            <Input
              placeholder="Descrição"
              value={row.descricao}
              onChange={(e) => updateRow(row.id, "descricao", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Valor"
              value={row.valor}
              onChange={(e) => updateRow(row.id, "valor", Number(e.target.value))}
            />
            <div className="flex items-center rounded-xl bg-white px-3 text-sm font-medium text-slate-600">
              {row.tipo}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-muted p-4">
        <p className="text-sm text-slate-600">Saldo automático</p>
        <p className="text-2xl font-bold text-foreground">R$ {saldo.toFixed(2)}</p>
      </div>
    </div>
  );
}
