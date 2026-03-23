"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartEntry = {
  mes: string;
  receita?: number;
  despesa?: number;
  lucro?: number;
  totalEntradas?: number;
  totalSaidas?: number;
  resultado?: number;
  saldoAnterior?: number;
  saldoFinal?: number;
};

type ChartProps = {
  data: ChartEntry[];
  mode: "lucro" | "receita-despesa" | "fluxo";
};

export default function Chart({ data, mode }: ChartProps) {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const tooltipFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false,
      }),
    []
  );
  const yAxisFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: false,
      }),
    []
  );
  const chartData = useMemo(() => {
    if (mode !== "fluxo" || data.length === 0) {
      return data;
    }

    return [
      {
        mes: "Início",
        totalEntradas: 0,
        totalSaidas: 0,
        resultado: 0,
        saldoAnterior: 0,
        saldoFinal: 0,
      },
      ...data,
    ];
  }, [data, mode]);

  function toggleLine(dataKey: string) {
    setHiddenKeys((prev) =>
      prev.includes(dataKey)
        ? prev.filter((key) => key !== dataKey)
        : [...prev, dataKey]
    );
  }

  const legendLabels = useMemo(
    () => ({
      receita: "Receita",
      despesa: "Despesa",
      lucro: "Lucro",
      totalEntradas: "Total de Entradas",
      totalSaidas: "Total de Saídas",
      resultado: "Lucro",
      saldoAnterior: "Saldo Anterior",
      saldoFinal: "Saldo Final",
    }),
    []
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
          <XAxis dataKey="mes" />
          <YAxis
            domain={mode === "fluxo" ? [0, "auto"] : ["auto", "auto"]}
            tickFormatter={(value) => yAxisFormatter.format(Math.abs(Number(value)))}
          />
          <Tooltip
            formatter={(value) => tooltipFormatter.format(Math.abs(Number(value)))}
          />
          <Legend
            formatter={(value) => {
              const label = legendLabels[value as keyof typeof legendLabels] ?? value;
              const hidden = hiddenKeys.includes(value);
              return (
                <span className={hidden ? "opacity-40 line-through" : ""}>
                  {label}
                </span>
              );
            }}
            onClick={(entry) => {
              if (entry?.dataKey) {
                toggleLine(String(entry.dataKey));
              }
            }}
          />
          {(mode === "lucro" || mode === "receita-despesa") && (
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys.includes("receita")}
            />
          )}
          {mode === "receita-despesa" && (
            <Line
              type="monotone"
              dataKey="despesa"
              stroke="#0F172A"
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys.includes("despesa")}
            />
          )}
          {mode === "lucro" && (
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys.includes("lucro")}
            />
          )}
          {mode === "fluxo" && (
            <>
              <Line
                type="monotone"
                dataKey="totalEntradas"
                name="Total de Entradas"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                hide={hiddenKeys.includes("totalEntradas")}
              />
              <Line
                type="monotone"
                dataKey="totalSaidas"
                name="Total de Saídas"
                stroke="#DC2626"
                strokeWidth={2}
                dot={false}
                hide={hiddenKeys.includes("totalSaidas")}
              />
              <Line
                type="monotone"
                dataKey="resultado"
                name="Lucro"
                stroke="#16A34A"
                strokeWidth={4}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                hide={hiddenKeys.includes("resultado")}
              />
              <Line
                type="monotone"
                dataKey="saldoAnterior"
                name="Saldo Anterior"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                hide={hiddenKeys.includes("saldoAnterior")}
              />
              <Line
                type="monotone"
                dataKey="saldoFinal"
                name="Saldo Final"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                hide={hiddenKeys.includes("saldoFinal")}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
