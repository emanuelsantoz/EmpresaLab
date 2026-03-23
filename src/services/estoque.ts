import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type EstoqueInput = {
  nome: string;
  imagem: string;
  qtd: number;
  valor: number;
};

export async function createEstoque(input: EstoqueInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("estoque").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllEstoque() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("estoque")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("created_at", { ascending: false })
  );
}

export async function updateEstoque(id: string, input: Partial<EstoqueInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("estoque")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteEstoque(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("estoque").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
