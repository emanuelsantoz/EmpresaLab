"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nomeEmpresa = String(formData.get("nomeEmpresa") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const senha = String(formData.get("senha") ?? "");

    try {
      setLoading(true);
      setError("");
      assertSupabaseConfigured();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) {
        setError(authError.message || "Não foi possível criar a conta.");
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Conta criada. Verifique seu email para confirmar o cadastro.");
        return;
      }

      await supabase.from("empresas").upsert({
        user_id: userId,
        nome: nomeEmpresa || "Minha Empresa",
        email,
      });

      router.push("/dashboard");
    } catch {
      setError("Configuração do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Criar Conta</h1>
          <p className="text-sm text-slate-500">Comece a gerir sua empresa</p>
        </div>
        <div className="space-y-3">
          <Input required name="nomeEmpresa" placeholder="Nome da empresa" />
          <Input required name="email" type="email" placeholder="Email" />
          <Input required name="senha" type="password" placeholder="Senha" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary">
            Fazer login
          </Link>
        </p>
      </form>
    </div>
  );
}
