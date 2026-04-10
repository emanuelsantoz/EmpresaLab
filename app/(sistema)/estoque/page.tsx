"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEstoque, deleteEstoque, getAllEstoque } from "@/services/estoque";

type EstoqueItem = {
  id: string;
  imagem: string;
  nome: string;
  qtd: number;
  valor: number;
};

const estoqueInicial: EstoqueItem[] = [];

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>(estoqueInicial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarEstoque() {
      try {
        setError("");
        const { data, error: loadError } = await getAllEstoque();
        if (loadError) {
          throw loadError;
        }

        const itens = (data ?? []).map((item) => ({
          id: String(item.id),
          imagem: String(item.imagem ?? ""),
          nome: String(item.nome ?? ""),
          qtd: Number(item.qtd ?? 0),
          valor: Number(item.valor ?? 0),
        }));
        setEstoque(itens);
      } catch {
        setError("Não foi possível carregar o estoque.");
      } finally {
        setLoading(false);
      }
    }

    carregarEstoque();
  }, []);

  async function compressImage(file: File) {
    const imageUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });

    const maxSize = 900;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(imageUrl);
      throw new Error("Não foi possível processar a imagem.");
    }
    context.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(imageUrl);
    return canvas.toDataURL("image/jpeg", 0.72);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "").trim();
    const qtd = Number(formData.get("qtd") ?? 0);
    const valor = Number(formData.get("valor") ?? 0);
    const imagemArquivo = formData.get("imagem") as File | null;

    if (!nome || qtd <= 0 || valor <= 0 || !imagemArquivo || imagemArquivo.size <= 0) {
      return;
    }

    try {
      setError("");
      const imagem = await compressImage(imagemArquivo);
      const { data, error: createError } = await createEstoque({ nome, imagem, qtd, valor });
      if (createError) {
        throw createError;
      }
      if (!data) {
        throw new Error("Não foi possível salvar o produto.");
      }
      setEstoque((prev) => [
        {
          id: String(data.id),
          nome: String(data.nome ?? nome),
          imagem: String(data.imagem ?? imagem),
          qtd: Number(data.qtd ?? qtd),
          valor: Number(data.valor ?? valor),
        },
        ...prev,
      ]);
      event.currentTarget.reset();
    } catch {
      setError("Não foi possível salvar o produto.");
    }
  }

  async function removeItem(id: string) {
    try {
      setError("");
      const { error: deleteError } = await deleteEstoque(id);
      if (deleteError) {
        throw deleteError;
      }
      setEstoque((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Não foi possível remover o produto.");
    }
  }

  return (
    <div className="space-y-6">
      {loading ? <p className="text-sm text-slate-500">Carregando estoque...</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-white p-5 md:grid-cols-4">
        <Input name="nome" placeholder="Nome do produto" required />
        <Input name="imagem" type="file" accept="image/*" required />
        <Input name="qtd" type="number" placeholder="Quantidade" min={1} required />
        <Input name="valor" type="number" placeholder="Valor unitário" min={0.01} step="0.01" required />
        <Button type="submit" className="md:col-span-4">
          Adicionar produto
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estoque.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <img src={item.imagem} alt={item.nome} className="h-40 w-full rounded-xl object-cover" />
            <h2 className="mt-3 text-lg font-semibold">{item.nome}</h2>
            <p className="text-sm text-slate-500">Qtd: {item.qtd}</p>
            <p className="text-base font-medium text-primary">R$ {item.valor.toFixed(2)}</p>
            <Button variant="outline" className="mt-3 w-full" onClick={() => removeItem(item.id)}>
              Remover
            </Button>
          </div>
        ))}
        {estoque.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border bg-white p-6 text-center text-slate-500">
            Nenhum produto cadastrado.
          </div>
        ) : null}
      </div>
    </div>
  );
}
