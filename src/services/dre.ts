import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type DreInput = {
  modo: "anual" | "projetado" | "realizado";
  receita: number;
  imposto: number;
  comissao: number;
  custos: number;
  despesas: number;
  despesas_financeiras: number;
};

export async function createDRE(input: DreInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("dre").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllDRE() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("dre")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("created_at", { ascending: false })
  );
}

export async function updateDRE(id: string, input: Partial<DreInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("dre")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteDRE(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("dre").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
