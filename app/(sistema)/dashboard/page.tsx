"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import Chart from "@/components/Chart";
import { Button } from "@/components/ui/button";

type Modo = "anual" | "projetado" | "realizado";

const dataPorModo = {
  anual: [
    { mes: "Jan", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Fev", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Mar", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
  ],
  projetado: [
    { mes: "Abr", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Mai", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Jun", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
  ],
  realizado: [
    { mes: "Abr", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Mai", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
    { mes: "Jun", receita: 0, despesa: 0, lucro: 0, saldo: 0 },
  ],
};

export default function DashboardPage() {
  const [modo, setModo] = useState<Modo>("projetado");
  const data = dataPorModo[modo];

  const total = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        receita: acc.receita + item.receita,
        despesa: acc.despesa + item.despesa,
        lucro: acc.lucro + item.lucro,
      }),
      { receita: 0, despesa: 0, lucro: 0 }
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant={modo === "anual" ? "default" : "outline"} onClick={() => setModo("anual")}>
          Anual
        </Button>
        <Button
          variant={modo === "projetado" ? "default" : "outline"}
          onClick={() => setModo("projetado")}
        >
          Projetado
        </Button>
        <Button
          variant={modo === "realizado" ? "default" : "outline"}
          onClick={() => setModo("realizado")}
        >
          Realizado
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Receita Total" value={`R$ ${total.receita.toFixed(2)}`} />
        <Card title="Despesa Total" value={`R$ ${total.despesa.toFixed(2)}`} />
        <Card title="Lucro Total" value={`R$ ${total.lucro.toFixed(2)}`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Lucro por mês">
          <div className="mt-4">
            <Chart data={data} mode="lucro" />
          </div>
        </Card>
        <Card title="Receita vs Despesa">
          <div className="mt-4">
            <Chart data={data} mode="receita-despesa" />
          </div>
        </Card>
      </div>
    </div>
  );
}
