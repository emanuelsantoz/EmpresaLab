"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

type BalancoState = {
  disponivel: number;
  contasReceber: number;
  estoques: number;
  imobilizado: number;
  fornecedores: number;
  impostos: number;
  emprestimosCurto: number;
  outrasContas: number;
  emprestimosLongo: number;
  capital: number;
  reservas: number;
};

export default function BalancoGerencialPage() {
  const [data, setData] = useState<BalancoState>({
    disponivel: 0,
    contasReceber: 0,
    estoques: 0,
    imobilizado: 0,
    fornecedores: 0,
    impostos: 0,
    emprestimosCurto: 0,
    outrasContas: 0,
    emprestimosLongo: 0,
    capital: 0,
    reservas: 0,
  });

  function updateField(field: keyof BalancoState, value: number) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const totais = useMemo(() => {
    const ativoCirculante = data.disponivel + data.contasReceber + data.estoques;
    const ativoNaoCirculante = data.imobilizado;
    const ativoTotal = ativoCirculante + ativoNaoCirculante;
    const passivoCirculante =
      data.fornecedores + data.impostos + data.emprestimosCurto + data.outrasContas;
    const passivoNaoCirculante = data.emprestimosLongo;
    const patrimonioLiquido = data.capital + data.reservas;
    const passivoTotal = passivoCirculante + passivoNaoCirculante + patrimonioLiquido;

    return {
      ativoCirculante,
      ativoNaoCirculante,
      ativoTotal,
      passivoCirculante,
      passivoNaoCirculante,
      patrimonioLiquido,
      passivoTotal,
      diferenca: ativoTotal - passivoTotal,
    };
  }, [data]);

  function currency(value: number) {
    return `R$ ${value.toFixed(2)}`;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/30 px-5 py-4">
          <h2 className="text-lg font-semibold">Balanço Gerencial</h2>
          <p className="text-sm text-slate-500">Ativo, passivo e patrimônio líquido por lançamento</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-slate-500">
                <th className="px-4 py-3 text-base font-semibold text-foreground">ATIVO</th>
                <th className="px-4 py-3 text-right font-medium">Valores (R$)</th>
                <th className="px-4 py-3 text-base font-semibold text-foreground">PASSIVO</th>
                <th className="px-4 py-3 text-right font-medium">Valores (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold">Circulante - Disponível</td>
                <td className="px-4 py-2"><Input type="number" value={data.disponivel} onChange={(e) => updateField("disponivel", Number(e.target.value))} /></td>
                <td className="px-4 py-2 font-semibold">Circulante - Fornecedores</td>
                <td className="px-4 py-2"><Input type="number" value={data.fornecedores} onChange={(e) => updateField("fornecedores", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold">Circulante - Contas a receber</td>
                <td className="px-4 py-2"><Input type="number" value={data.contasReceber} onChange={(e) => updateField("contasReceber", Number(e.target.value))} /></td>
                <td className="px-4 py-2 font-semibold">Circulante - Impostos</td>
                <td className="px-4 py-2"><Input type="number" value={data.impostos} onChange={(e) => updateField("impostos", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold">Circulante - Estoques</td>
                <td className="px-4 py-2"><Input type="number" value={data.estoques} onChange={(e) => updateField("estoques", Number(e.target.value))} /></td>
                <td className="px-4 py-2 font-semibold">Circulante - Empréstimos</td>
                <td className="px-4 py-2"><Input type="number" value={data.emprestimosCurto} onChange={(e) => updateField("emprestimosCurto", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold">Não circulante - Imobilizado</td>
                <td className="px-4 py-2"><Input type="number" value={data.imobilizado} onChange={(e) => updateField("imobilizado", Number(e.target.value))} /></td>
                <td className="px-4 py-2 font-semibold">Circulante - Outras contas</td>
                <td className="px-4 py-2"><Input type="number" value={data.outrasContas} onChange={(e) => updateField("outrasContas", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold text-primary">Total Ativo Circulante</td>
                <td className="px-4 py-2 text-right font-semibold text-primary">{currency(totais.ativoCirculante)}</td>
                <td className="px-4 py-2 font-semibold">Não circulante - Empréstimos LP</td>
                <td className="px-4 py-2"><Input type="number" value={data.emprestimosLongo} onChange={(e) => updateField("emprestimosLongo", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold text-primary">Total Ativo Não Circulante</td>
                <td className="px-4 py-2 text-right font-semibold text-primary">{currency(totais.ativoNaoCirculante)}</td>
                <td className="px-4 py-2 font-semibold">Patrimônio Líquido - Capital</td>
                <td className="px-4 py-2"><Input type="number" value={data.capital} onChange={(e) => updateField("capital", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70">
                <td className="px-4 py-2 font-semibold text-success">ATIVO TOTAL</td>
                <td className="px-4 py-2 text-right text-base font-bold text-success">{currency(totais.ativoTotal)}</td>
                <td className="px-4 py-2 font-semibold">Patrimônio Líquido - Reservas</td>
                <td className="px-4 py-2"><Input type="number" value={data.reservas} onChange={(e) => updateField("reservas", Number(e.target.value))} /></td>
              </tr>
              <tr className="border-b border-border/70 bg-muted/30">
                <td className="px-4 py-2 font-semibold" />
                <td className="px-4 py-2" />
                <td className="px-4 py-2 font-semibold">Passivo Circulante + Não Circulante + PL</td>
                <td className="px-4 py-2 text-right font-semibold">{currency(totais.passivoTotal)}</td>
              </tr>
              <tr className="bg-muted/40">
                <td className="px-4 py-2 font-semibold">Diferença (Ativo - Passivo)</td>
                <td
                  className={`px-4 py-2 text-right text-base font-bold ${
                    totais.diferenca === 0
                      ? "text-success"
                      : totais.diferenca > 0
                        ? "text-primary"
                        : "text-danger"
                  }`}
                >
                  {currency(totais.diferenca)}
                </td>
                <td className="px-4 py-2 font-semibold">Patrimônio Líquido</td>
                <td className="px-4 py-2 text-right font-semibold">{currency(totais.patrimonioLiquido)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
