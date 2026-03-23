import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

export async function getEmpresaId() {
  assertSupabaseConfigured();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("empresas")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error("Empresa não encontrada para o usuário logado");
  }

  return data.id as string;
}

export async function withEmpresa<T>(operation: (empresaId: string) => Promise<T>) {
  const empresaId = await getEmpresaId();
  return operation(empresaId);
}
