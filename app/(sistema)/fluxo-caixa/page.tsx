"use client";

import { useEffect, useMemo, useState } from "react";
import Chart from "@/components/Chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RowKey =
  | "recebimento_vendas"
  | "emprestimos_entrada"
  | "outras_entradas"
  | "impostos_federais"
  | "comissoes_vendas"
  | "fornecedores"
  | "despesas_fixas"
  | "emprestimos_saida"
  | "juros_bancarios";

type RowType = "entrada" | "saida";

type CashflowRow = {
  key: RowKey;
  label: string;
  type: RowType;
};

const rows: CashflowRow[] = [
  { key: "recebimento_vendas", label: "Recebimento das vendas", type: "entrada" },
  { key: "emprestimos_entrada", label: "Empréstimos", type: "entrada" },
  { key: "outras_entradas", label: "Outras entradas", type: "entrada" },
  { key: "impostos_federais", label: "Impostos federais", type: "saida" },
  { key: "comissoes_vendas", label: "Comissões sobre vendas", type: "saida" },
  { key: "fornecedores", label: "Fornecedores (matérias-primas ou mercadorias)", type: "saida" },
  { key: "despesas_fixas", label: "Despesas fixas", type: "saida" },
  { key: "emprestimos_saida", label: "Empréstimos", type: "saida" },
  { key: "juros_bancarios", label: "Juros e despesas bancárias", type: "saida" },
];

const initialValues: Record<RowKey, number[]> = {
  recebimento_vendas: [0, 0],
  emprestimos_entrada: [0, 0],
  outras_entradas: [0, 0],
  impostos_federais: [0, 0],
  comissoes_vendas: [0, 0],
  fornecedores: [0, 0],
  despesas_fixas: [0, 0],
  emprestimos_saida: [0, 0],
  juros_bancarios: [0, 0],
};

const FLUXO_STORAGE_KEY = "guto_dashboard_fluxo_caixa_draft";

export default function FluxoCaixaPage() {
  const [periodos, setPeriodos] = useState(["1º Período", "2º Período"]);
  const [values, setValues] = useState<Record<RowKey, number[]>>(initialValues);
  const [entradasMinimizadas, setEntradasMinimizadas] = useState(false);
  const [saidasMinimizadas, setSaidasMinimizadas] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FLUXO_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        periodos?: string[];
        values?: Partial<Record<RowKey, number[]>>;
        entradasMinimizadas?: boolean;
        saidasMinimizadas?: boolean;
      };

      const savedPeriodos =
        Array.isArray(parsed.periodos) && parsed.periodos.length > 0
          ? parsed.periodos.map((item, index) => String(item || `${index + 1}º Período`))
          : ["1º Período", "2º Período"];
      const periodCount = savedPeriodos.length;
      setPeriodos(savedPeriodos);

      const sourceValues = parsed.values ?? {};
      const normalizeList = (list: number[] | undefined) => {
        if (!Array.isArray(list)) {
          return Array.from({ length: periodCount }, () => 0);
        }
        const normalized = list.map((item) => Number(item ?? 0));
        if (normalized.length >= periodCount) {
          return normalized.slice(0, periodCount);
        }
        return [...normalized, ...Array.from({ length: periodCount - normalized.length }, () => 0)];
      };
      setValues({
        recebimento_vendas: normalizeList(sourceValues.recebimento_vendas),
        emprestimos_entrada: normalizeList(sourceValues.emprestimos_entrada),
        outras_entradas: normalizeList(sourceValues.outras_entradas),
        impostos_federais: normalizeList(sourceValues.impostos_federais),
        comissoes_vendas: normalizeList(sourceValues.comissoes_vendas),
        fornecedores: normalizeList(sourceValues.fornecedores),
        despesas_fixas: normalizeList(sourceValues.despesas_fixas),
        emprestimos_saida: normalizeList(sourceValues.emprestimos_saida),
        juros_bancarios: normalizeList(sourceValues.juros_bancarios),
      });

      if (typeof parsed.entradasMinimizadas === "boolean") {
        setEntradasMinimizadas(parsed.entradasMinimizadas);
      }
      if (typeof parsed.saidasMinimizadas === "boolean") {
        setSaidasMinimizadas(parsed.saidasMinimizadas);
      }
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      FLUXO_STORAGE_KEY,
      JSON.stringify({ periodos, values, entradasMinimizadas, saidasMinimizadas })
    );
  }, [periodos, values, entradasMinimizadas, saidasMinimizadas]);

  function addPeriodo() {
    setPeriodos((prev) => [...prev, `${prev.length + 1}º Período`]);
    setValues((prev) => {
      const next = { ...prev };
      (Object.keys(next) as RowKey[]).forEach((key) => {
        next[key] = [...next[key], 0];
      });
      return next;
    });
  }

  function updateValue(key: RowKey, periodoIndex: number, rawValue: string) {
    const normalized = rawValue.replace(",", ".").replace(/[^\d.]/g, "");
    const [intPart = "", ...decimalParts] = normalized.split(".");
    const decimalPart = decimalParts.join("");
    const cleanInt = intPart.replace(/^0+(?=\d)/, "");
    const sanitized =
      normalized === ""
        ? "0"
        : decimalPart
          ? `${cleanInt || "0"}.${decimalPart.slice(0, 2)}`
          : cleanInt || "0";
    const value = Number(sanitized);

    setValues((prev) => ({
      ...prev,
      [key]: prev[key].map((item, index) =>
        index === periodoIndex ? (Number.isNaN(value) ? 0 : value) : item
      ),
    }));
  }

  const calculos = useMemo(() => {
    const totalEntradas = periodos.map((_, index) =>
      rows
        .filter((row) => row.type === "entrada")
        .reduce((acc, row) => acc + (values[row.key][index] ?? 0), 0)
    );
    const totalSaidas = periodos.map((_, index) =>
      rows
        .filter((row) => row.type === "saida")
        .reduce((acc, row) => acc + (values[row.key][index] ?? 0), 0)
    );
    const resultado = totalEntradas.map((item, index) => item - totalSaidas[index]);
    const saldoAnterior: number[] = [];
    const saldoFinal: number[] = [];

    resultado.forEach((item, index) => {
      const anterior = index === 0 ? 0 : saldoFinal[index - 1];
      saldoAnterior.push(anterior);
      saldoFinal.push(anterior + item);
    });

    return { totalEntradas, totalSaidas, resultado, saldoAnterior, saldoFinal };
  }, [periodos, values]);

  const dataFluxo = useMemo(
    () =>
      periodos.map((periodo, index) => ({
        mes: periodo,
        totalEntradas: calculos.totalEntradas[index] ?? 0,
        totalSaidas: calculos.totalSaidas[index] ?? 0,
        resultado: calculos.resultado[index] ?? 0,
        saldoAnterior: calculos.saldoAnterior[index] ?? 0,
        saldoFinal: calculos.saldoFinal[index] ?? 0,
      })),
    [
      periodos,
      calculos.totalEntradas,
      calculos.totalSaidas,
      calculos.resultado,
      calculos.saldoAnterior,
      calculos.saldoFinal,
    ]
  );

  function renderNumber(value: number, withSignalColor = false) {
    return (
      <span className={withSignalColor ? (value < 0 ? "text-danger" : value > 0 ? "text-success" : "") : ""}>
        R$ {value.toFixed(2)}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Fluxo de Caixa por Períodos</h2>
            <p className="text-sm text-slate-500">Entradas e saídas por período, com lançamentos diretos na tabela</p>
          </div>
          <Button onClick={addPeriodo}>+ Período</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-slate-500">
                <th className="px-3 py-2 font-medium">Conta</th>
                {periodos.map((periodo) => (
                  <th key={periodo} className="px-3 py-2 text-center font-medium">
                    {periodo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-3 text-base font-semibold text-foreground">
                  <button
                    className="cursor-pointer rounded-md px-1 transition-colors hover:bg-muted/40"
                    onClick={() => setEntradasMinimizadas((prev) => !prev)}
                  >
                    {entradasMinimizadas ? "▸" : "▾"} ENTRADAS
                  </button>
                </td>
                <td colSpan={periodos.length} />
              </tr>
              {!entradasMinimizadas &&
                rows
                  .filter((row) => row.type === "entrada")
                  .map((row) => (
                    <tr key={row.key} className="border-b border-border/70">
                      <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                      {periodos.map((_, periodIndex) => (
                        <td key={`${row.key}-${periodIndex}`} className="px-3 py-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={values[row.key][periodIndex]}
                            onFocus={(e) => {
                              if ((values[row.key][periodIndex] ?? 0) === 0) {
                                e.currentTarget.select();
                              }
                            }}
                            onChange={(e) => updateValue(row.key, periodIndex, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              <tr className="border-b border-border bg-muted/30">
                <td className="px-3 py-2 font-semibold text-foreground">TOTAL DE ENTRADAS</td>
                {calculos.totalEntradas.map((value, index) => (
                  <td key={`entrada-total-${index}`} className="px-3 py-2 text-center font-semibold">
                    {renderNumber(value, true)}
                  </td>
                ))}
              </tr>
              <tr>
                <td colSpan={periodos.length + 1} className="h-[15px]" />
              </tr>
              <tr>
                <td className="px-3 py-3 text-base font-semibold text-foreground">
                  <button
                    className="cursor-pointer rounded-md px-1 transition-colors hover:bg-muted/40"
                    onClick={() => setSaidasMinimizadas((prev) => !prev)}
                  >
                    {saidasMinimizadas ? "▸" : "▾"} SAÍDAS
                  </button>
                </td>
                <td colSpan={periodos.length} />
              </tr>
              {!saidasMinimizadas &&
                rows
                  .filter((row) => row.type === "saida")
                  .map((row) => (
                    <tr key={row.key} className="border-b border-border/70">
                      <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                      {periodos.map((_, periodIndex) => (
                        <td key={`${row.key}-${periodIndex}`} className="px-3 py-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={values[row.key][periodIndex]}
                            onFocus={(e) => {
                              if ((values[row.key][periodIndex] ?? 0) === 0) {
                                e.currentTarget.select();
                              }
                            }}
                            onChange={(e) => updateValue(row.key, periodIndex, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              <tr className="border-b border-border bg-muted/30">
                <td className="px-3 py-2 font-semibold text-foreground">TOTAL DE SAÍDAS</td>
                {calculos.totalSaidas.map((value, index) => (
                  <td key={`saida-total-${index}`} className="px-3 py-2 text-center font-semibold">
                    {renderNumber(-value, true)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-success/40 bg-success/10">
                <td className="px-3 py-2 font-semibold text-success">LUCRO</td>
                {calculos.resultado.map((value, index) => (
                  <td key={`resultado-${index}`} className="px-3 py-2 text-center font-semibold">
                    {renderNumber(value, true)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 font-semibold text-foreground">SALDO ANTERIOR</td>
                {calculos.saldoAnterior.map((value, index) => (
                  <td key={`saldo-anterior-${index}`} className="px-3 py-2 text-center font-semibold">
                    {renderNumber(value)}
                  </td>
                ))}
              </tr>
              <tr className="bg-muted/40">
                <td className="px-3 py-2 font-semibold text-foreground">SALDO FINAL</td>
                {calculos.saldoFinal.map((value, index) => (
                  <td key={`saldo-final-${index}`} className="px-3 py-2 text-center text-base font-bold">
                    {renderNumber(value, true)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Gráfico do Fluxo de Caixa</p>
          <p className="mb-3 text-xs text-slate-500">
            Total de entradas, total de saídas, lucro, saldo anterior e saldo final por período
          </p>
          <Chart data={dataFluxo} mode="fluxo" />
        </div>
      </div>
    </div>
  );
}
