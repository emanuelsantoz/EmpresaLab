"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const senha = String(formData.get("senha") ?? "");

    try {
      setLoading(true);
      setError("");
      assertSupabaseConfigured();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (loginError) {
        setError(loginError.message || "Email ou senha inválidos.");
        return;
      }
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
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-slate-500">Acesse seu painel financeiro</p>
        </div>
        <div className="space-y-3">
          <Input required name="email" type="email" placeholder="Email" />
          <Input required name="senha" type="password" placeholder="Senha" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-primary">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
