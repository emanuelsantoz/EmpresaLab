"use client";

import { useState } from "react";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CadastroEmpresasPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const tipo = String(formData.get("tipo") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const senha = String(formData.get("senha") ?? "");

    if (!nome || !tipo || !email || !senha) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      assertSupabaseConfigured();

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) {
        setError(authError.message || "Não foi possível criar o usuário.");
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Usuário criado. Confirme o e-mail para concluir o cadastro da empresa.");
        return;
      }

      const { error: empresaError } = await supabase.from("empresas").upsert(
        {
          user_id: userId,
          nome,
          tipo,
        },
        { onConflict: "user_id" }
      );

      if (empresaError) {
        setError(empresaError.message || "Usuário criado, mas não foi possível cadastrar a empresa.");
        return;
      }

      setSuccess("Usuário e empresa cadastrados com sucesso.");
      event.currentTarget.reset();
    } catch {
      setError("Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Cadastro de Empresas</h2>
      <p className="mb-6 text-sm text-slate-500">
        Crie o usuário com e-mail e senha e vincule a empresa no mesmo fluxo.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input name="nome" placeholder="Nome da empresa" required />
        <Input name="tipo" placeholder="Tipo da empresa" required />
        <Input name="email" type="email" placeholder="E-mail do usuário" required />
        <Input name="senha" type="password" placeholder="Senha do usuário" required />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Cadastrando..." : "Cadastrar empresa"}
        </Button>
      </form>
    </div>
  );
}
