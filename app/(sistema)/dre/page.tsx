"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustoMateriaPrimaTotal, loadMateriaPrimaFromStorage } from "@/lib/materiaPrima";
import { createDRE, getAllDRE, updateDRE } from "@/services/dre";

type Modo = "anual" | "projetado" | "realizado";
type DreState = {
  receita: number;
  imposto: number;
  comissao: number;
  custos: number;
  despesas: number;
  despesasFinanceiras: number;
};

const DRE_DRAFT_STORAGE_KEY = "guto_dashboard_dre_draft";
const DRE_MODE_STORAGE_KEY = "guto_dashboard_dre_mode";

const initialState: Record<Modo, DreState> = {
  anual: {
    receita: 0,
    imposto: 0,
    comissao: 0,
    custos: 0,
    despesas: 0,
    despesasFinanceiras: 0,
  },
  projetado: {
    receita: 0,
    imposto: 0,
    comissao: 0,
    custos: 0,
    despesas: 0,
    despesasFinanceiras: 0,
  },
  realizado: {
    receita: 0,
    imposto: 0,
    comissao: 0,
    custos: 0,
    despesas: 0,
    despesasFinanceiras: 0,
  },
};

function isModo(value: unknown): value is Modo {
  return value === "anual" || value === "projetado" || value === "realizado";
}

function normalizeDreState(value: unknown): DreState {
  const source = value as Partial<DreState> | null | undefined;
  return {
    receita: Number(source?.receita ?? 0),
    imposto: Number(source?.imposto ?? 0),
    comissao: Number(source?.comissao ?? 0),
    custos: Number(source?.custos ?? 0),
    despesas: Number(source?.despesas ?? 0),
    despesasFinanceiras: Number(source?.despesasFinanceiras ?? 0),
  };
}

export default function DrePage() {
  const [modo, setModo] = useState<Modo>("projetado");
  const [values, setValues] = useState<Record<Modo, DreState>>(initialState);
  const [dreIds, setDreIds] = useState<Partial<Record<Modo, string>>>({});
  const form = values[modo];
  const [custoMateriaPrima, setCustoMateriaPrima] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const custoOperacionalTotal = form.custos + custoMateriaPrima;

  useEffect(() => {
    let hasLocalDraft = false;
    try {
      const savedValues = window.localStorage.getItem(DRE_DRAFT_STORAGE_KEY);
      if (savedValues) {
        hasLocalDraft = true;
        const parsed = JSON.parse(savedValues) as Partial<Record<Modo, DreState>>;
        setValues({
          anual: normalizeDreState(parsed?.anual),
          projetado: normalizeDreState(parsed?.projetado),
          realizado: normalizeDreState(parsed?.realizado),
        });
      }

      const savedMode = window.localStorage.getItem(DRE_MODE_STORAGE_KEY);
      if (isModo(savedMode)) {
        hasLocalDraft = true;
        setModo(savedMode);
      }
    } catch {}

    async function carregarDre() {
      try {
        const { data, error: loadError } = await getAllDRE();
        if (loadError) {
          throw loadError;
        }

        if (!data?.length) {
          return;
        }

        const nextValues = { ...initialState };
        const nextIds: Partial<Record<Modo, string>> = {};

        data.forEach((row) => {
          const mode = row.modo as Modo;
          if (mode === "anual" || mode === "projetado" || mode === "realizado") {
            nextValues[mode] = {
              receita: Number(row.receita ?? 0),
              imposto: Number(row.imposto ?? 0),
              comissao: Number(row.comissao ?? 0),
              custos: Number(row.custos ?? 0),
              despesas: Number(row.despesas ?? 0),
              despesasFinanceiras: Number(row.despesas_financeiras ?? 0),
            };
            nextIds[mode] = String(row.id);
          }
        });

        if (!hasLocalDraft) {
          setValues(nextValues);
        }
        setDreIds(nextIds);
      } catch {
        setError("Não foi possível carregar os dados da DRE.");
      } finally {
        setLoading(false);
      }
    }

    function atualizarCustoMateriaPrima() {
      setCustoMateriaPrima(getCustoMateriaPrimaTotal(loadMateriaPrimaFromStorage()));
    }

    carregarDre();
    atualizarCustoMateriaPrima();
    window.addEventListener("focus", atualizarCustoMateriaPrima);
    return () => {
      window.removeEventListener("focus", atualizarCustoMateriaPrima);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DRE_DRAFT_STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    window.localStorage.setItem(DRE_MODE_STORAGE_KEY, modo);
  }, [modo]);

  const impostosValor = useMemo(() => form.receita * (form.imposto / 100), [form]);
  const comissaoValor = useMemo(() => form.receita * (form.comissao / 100), [form]);
  const lucroLiquido = useMemo(
    () =>
      form.receita -
      impostosValor -
      comissaoValor -
      custoOperacionalTotal -
      form.despesas -
      form.despesasFinanceiras,
    [form, impostosValor, comissaoValor, custoOperacionalTotal]
  );
  const dreTabela = useMemo(
    () => [
      { conta: "Receita Bruta", valor: form.receita, percentual: 100, tipo: "receita" as const },
      {
        conta: "Impostos sobre vendas",
        valor: -impostosValor,
        percentual: form.receita > 0 ? (impostosValor / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Comissões sobre vendas",
        valor: -comissaoValor,
        percentual: form.receita > 0 ? (comissaoValor / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Custo de matéria-prima",
        valor: -custoMateriaPrima,
        percentual: form.receita > 0 ? (custoMateriaPrima / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Outros custos operacionais",
        valor: -form.custos,
        percentual: form.receita > 0 ? (form.custos / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Despesas",
        valor: -form.despesas,
        percentual: form.receita > 0 ? (form.despesas / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Despesas financeiras",
        valor: -form.despesasFinanceiras,
        percentual: form.receita > 0 ? (form.despesasFinanceiras / form.receita) * 100 : 0,
        tipo: "deducao" as const,
      },
      {
        conta: "Lucro Líquido",
        valor: lucroLiquido,
        percentual: form.receita > 0 ? (lucroLiquido / form.receita) * 100 : 0,
        tipo: "resultado" as const,
      },
    ],
    [form, impostosValor, comissaoValor, custoMateriaPrima, lucroLiquido]
  );

  async function updateField(field: keyof DreState, value: number) {
    setValues((prev) => ({
      ...prev,
      [modo]: { ...prev[modo], [field]: value },
    }));

    const payload = {
      modo,
      receita: field === "receita" ? value : values[modo].receita,
      imposto: field === "imposto" ? value : values[modo].imposto,
      comissao: field === "comissao" ? value : values[modo].comissao,
      custos: field === "custos" ? value : values[modo].custos,
      despesas: field === "despesas" ? value : values[modo].despesas,
      despesas_financeiras:
        field === "despesasFinanceiras" ? value : values[modo].despesasFinanceiras,
    };

    try {
      setError("");
      const id = dreIds[modo];
      if (id) {
        const { error: saveError } = await updateDRE(id, payload);
        if (saveError) {
          throw saveError;
        }
      } else {
        const { data, error: createError } = await createDRE(payload);
        if (createError) {
          throw createError;
        }
        if (data?.id) {
          setDreIds((prev) => ({ ...prev, [modo]: String(data.id) }));
        }
      }
    } catch {
      setError("Não foi possível salvar os dados da DRE.");
    }
  }

  return (
    <div className="space-y-6">
      {loading ? <p className="text-sm text-slate-500">Carregando dados da DRE...</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
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
      <div className="grid gap-4 rounded-2xl border border-border bg-white p-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="text-base font-semibold text-foreground">Base de Cálculo para o DRE</h3>
        </div>
        <div className="space-y-1">
          <label htmlFor="receita" className="text-sm font-medium text-slate-700">
            Receita Bruta
          </label>
          <Input
            id="receita"
            type="number"
            placeholder="Ex: 100000"
            value={form.receita}
            onChange={(e) => updateField("receita", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Base de 100% para todo o cálculo da DRE.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="imposto" className="text-sm font-medium text-slate-700">
            Impostos (%)
          </label>
          <Input
            id="imposto"
            type="number"
            placeholder="Ex: 9.62"
            value={form.imposto}
            onChange={(e) => updateField("imposto", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Percentual de impostos sobre a receita bruta.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="comissao" className="text-sm font-medium text-slate-700">
            Comissão (%)
          </label>
          <Input
            id="comissao"
            type="number"
            placeholder="Ex: 5"
            value={form.comissao}
            onChange={(e) => updateField("comissao", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Percentual pago em comissões de vendas.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="custos" className="text-sm font-medium text-slate-700">
            Outros Custos Operacionais
          </label>
          <Input
            id="custos"
            type="number"
            placeholder="Ex: 40000"
            value={form.custos}
            onChange={(e) => updateField("custos", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Custos manuais. A matéria-prima entra automaticamente no total operacional.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="materia-prima" className="text-sm font-medium text-slate-700">
            Custo Matéria Prima (Automático)
          </label>
          <Input
            id="materia-prima"
            type="text"
            value={`R$ ${custoMateriaPrima.toFixed(2)}`}
            disabled
          />
          <p className="text-xs text-slate-500">Valor vindo da aba de estoque de matéria-prima.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="despesas" className="text-sm font-medium text-slate-700">
            Despesas
          </label>
          <Input
            id="despesas"
            type="number"
            placeholder="Ex: 25000"
            value={form.despesas}
            onChange={(e) => updateField("despesas", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Despesas administrativas, fixas e variáveis.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="despesas-financeiras" className="text-sm font-medium text-slate-700">
            Despesa Financeira
          </label>
          <Input
            id="despesas-financeiras"
            type="number"
            placeholder="Ex: 3000"
            value={form.despesasFinanceiras}
            onChange={(e) => updateField("despesasFinanceiras", Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">Valor deduzido do resultado por juros e encargos.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Impostos em valor" value={`R$ ${impostosValor.toFixed(2)}`} valueClassName="text-danger" />
        <Card title="Comissão em valor" value={`R$ ${comissaoValor.toFixed(2)}`} valueClassName="text-danger" />
        <Card
          title="Custo Operacional Total"
          value={`R$ ${custoOperacionalTotal.toFixed(2)}`}
          valueClassName="text-danger"
        />
        <Card
          title="Lucro Líquido"
          value={`R$ ${lucroLiquido.toFixed(2)}`}
          valueClassName={lucroLiquido >= 0 ? "text-success" : "text-danger"}
          className="bg-muted"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-slate-50 px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">DRE Analítica</h3>
          <p className="text-sm text-slate-500">Visual moderno com valor e percentual sobre a receita bruta</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Conta</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3 text-right font-medium">% da Receita</th>
              </tr>
            </thead>
            <tbody>
              {dreTabela.map((linha) => (
                <tr key={linha.conta} className="border-b border-border/70 last:border-b-0">
                  <td className="px-5 py-3 font-medium text-foreground">{linha.conta}</td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      linha.valor < 0
                        ? "text-danger"
                        : linha.valor > 0
                          ? "text-success"
                          : "text-foreground"
                    }`}
                  >
                    R$ {linha.valor.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{linha.percentual.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
