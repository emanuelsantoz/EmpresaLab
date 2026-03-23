"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState({
    nome: "",
    email: "",
    segmento: "",
  });

  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Dados da Empresa</h2>
      <div className="space-y-3">
        <Input
          placeholder="Nome da empresa"
          value={empresa.nome}
          onChange={(e) => setEmpresa((prev) => ({ ...prev, nome: e.target.value }))}
        />
        <Input
          type="email"
          placeholder="Email"
          value={empresa.email}
          onChange={(e) => setEmpresa((prev) => ({ ...prev, email: e.target.value }))}
        />
        <Input
          placeholder="Segmento"
          value={empresa.segmento}
          onChange={(e) => setEmpresa((prev) => ({ ...prev, segmento: e.target.value }))}
        />
      </div>
      <Button className="mt-4">Salvar</Button>
    </div>
  );
}
