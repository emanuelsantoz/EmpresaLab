import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type ProdutoInput = {
  nome: string;
  custo: number;
  preco_venda?: number | null;
};

export async function createProduto(input: ProdutoInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("produtos").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllProdutos() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("produtos")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("created_at", { ascending: false })
  );
}

export async function updateProduto(id: string, input: Partial<ProdutoInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("produtos")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteProduto(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("produtos").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
