import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type VendaInput = {
  margem: number;
  unidades_base: number;
  crescimento_percentual: number;
};

export async function createVenda(input: VendaInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("vendas").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllVendas() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("vendas")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("created_at", { ascending: false })
  );
}

export async function updateVenda(id: string, input: Partial<VendaInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("vendas")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteVenda(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("vendas").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
