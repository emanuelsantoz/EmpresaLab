export type MateriaPrimaItem = {
  id: number;
  imagem: string;
  nome: string;
  qtd: number;
  valor: number;
};

export const materiaPrimaEstoque: MateriaPrimaItem[] = [];

export const MATERIA_PRIMA_STORAGE_KEY = "guto_dashboard_materia_prima";

export function getCustoMateriaPrimaTotal(items: MateriaPrimaItem[] = []) {
  return items.reduce((acc, item) => acc + item.qtd * item.valor, 0);
}

export function loadMateriaPrimaFromStorage() {
  if (typeof window === "undefined") {
    return materiaPrimaEstoque;
  }

  const raw = window.localStorage.getItem(MATERIA_PRIMA_STORAGE_KEY);
  if (!raw) {
    return materiaPrimaEstoque;
  }

  try {
    const parsed = JSON.parse(raw) as MateriaPrimaItem[];
    if (!Array.isArray(parsed)) {
      return materiaPrimaEstoque;
    }
    return parsed;
  } catch {
    return materiaPrimaEstoque;
  }
}

export function saveMateriaPrimaToStorage(items: MateriaPrimaItem[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(MATERIA_PRIMA_STORAGE_KEY, JSON.stringify(items));
}
