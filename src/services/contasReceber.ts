import { supabase } from "@/lib/supabase";
import { withEmpresa } from "@/services/base";

export type ContaReceberInput = {
  descricao: string;
  valor: number;
  vencimento: string;
  status: "aberta" | "recebida" | "vencida";
};

export async function createContaReceber(input: ContaReceberInput) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("contas_receber").insert({ ...input, empresa_id }).select("*").single()
  );
}

export async function getAllContasReceber() {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("contas_receber")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("vencimento", { ascending: true })
  );
}

export async function updateContaReceber(id: string, input: Partial<ContaReceberInput>) {
  return withEmpresa(async (empresa_id) =>
    supabase
      .from("contas_receber")
      .update(input)
      .eq("id", id)
      .eq("empresa_id", empresa_id)
      .select("*")
      .single()
  );
}

export async function deleteContaReceber(id: string) {
  return withEmpresa(async (empresa_id) =>
    supabase.from("contas_receber").delete().eq("id", id).eq("empresa_id", empresa_id)
  );
}
