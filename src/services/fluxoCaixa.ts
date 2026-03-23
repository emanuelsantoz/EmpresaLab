import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type FluxoCaixaInput = {
  periodo_indice: number;
  periodo_nome: string;
  chave_linha: string;
  tipo: "entrada" | "saida";
  valor: number;
};

export async function createFluxoCaixa(input: FluxoCaixaInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("fluxo_caixa").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllFluxoCaixa() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("fluxo_caixa")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("periodo_indice", { ascending: true })
      .order("created_at", { ascending: true })
  );
}

export async function updateFluxoCaixa(id: string, input: Partial<FluxoCaixaInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("fluxo_caixa")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteFluxoCaixa(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("fluxo_caixa").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
