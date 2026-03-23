import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type ContaPagarInput = {
  descricao: string;
  valor: number;
  vencimento: string;
  status: "aberta" | "paga" | "vencida";
};

export async function createContaPagar(input: ContaPagarInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("contas_pagar").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllContasPagar() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("contas_pagar")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("vencimento", { ascending: true })
  );
}

export async function updateContaPagar(id: string, input: Partial<ContaPagarInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("contas_pagar")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteContaPagar(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("contas_pagar").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
