"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  Scale,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dre", label: "DRE", icon: FileText },
  { href: "/fluxo-caixa", label: "Fluxo de Caixa", icon: Wallet },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/materia-prima", label: "Matéria Prima", icon: Package },
  { href: "/balanco-gerencial", label: "Balanço Gerencial", icon: Scale },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/kpis", label: "KPIs", icon: TrendingUp },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/empresa", label: "Empresa", icon: Building2 },
  { href: "/cadastro-empresas", label: "Cadastro de Empresas", icon: Building2 },
] satisfies { href: string; label: string; icon: LucideIcon }[];

const iconSize = 18;
const ORDER_STORAGE_KEY = "guto_dashboard_sidebar_order";

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("mb-8", collapsed ? "mb-4" : "")}>
      <div className={cn("mb-2 h-9", collapsed ? "block" : "hidden")} />
      {!collapsed ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gestão Financeira
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Guto Dashboard</h2>
        </>
      ) : null}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderedHrefs, setOrderedHrefs] = useState<string[]>(links.map((link) => link.href));
  const collapsed = !isHovered;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ORDER_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as string[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return;
      }

      const knownHrefs = new Set(links.map((link) => link.href));
      const filtered = parsed.filter((href) => knownHrefs.has(href));
      const missing = links.map((link) => link.href).filter((href) => !filtered.includes(href));
      const next = [...filtered, ...missing];

      if (next.length) {
        setOrderedHrefs(next);
      }
    } catch {
      setOrderedHrefs(links.map((link) => link.href));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderedHrefs));
  }, [orderedHrefs]);

  const orderedLinks = useMemo(() => {
    const byHref = new Map(links.map((link) => [link.href, link]));
    return orderedHrefs.reduce<(typeof links)[number][]>((acc, href) => {
      const found = byHref.get(href);
      if (found) {
        acc.push(found);
      }
      return acc;
    }, []);
  }, [orderedHrefs]);

  function moveLink(href: string, direction: "up" | "down") {
    setOrderedHrefs((prev) => {
      const index = prev.indexOf(href);
      if (index < 0) {
        return prev;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsEditingOrder(false);
      }}
      className={cn(
        "hidden border-r border-border bg-card p-3 transition-all duration-300 lg:block",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarHeader collapsed={collapsed} />
      {!collapsed ? (
        <button
          className="mb-3 w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-foreground"
          onClick={() => setIsEditingOrder((prev) => !prev)}
        >
          {isEditingOrder ? "Concluir ordem" : "Editar ordem"}
        </button>
      ) : null}
      <nav className="space-y-2">
        {orderedLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          const index = orderedHrefs.indexOf(link.href);

          return (
            <div key={link.href} className="flex items-center gap-1">
              <Link
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center rounded-xl py-3 text-sm font-medium transition-colors",
                  collapsed ? "w-full justify-center px-2" : "flex-1 gap-3 px-4",
                  active
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-foreground"
                )}
              >
                <Icon size={iconSize} suppressHydrationWarning />
                {!collapsed ? <span>{link.label}</span> : null}
              </Link>
              {!collapsed && isEditingOrder ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveLink(link.href, "up")}
                    disabled={index <= 0}
                    className="rounded-md border border-border p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    aria-label={`Subir ${link.label}`}
                  >
                    <ArrowUp size={14} suppressHydrationWarning />
                  </button>
                  <button
                    onClick={() => moveLink(link.href, "down")}
                    disabled={index >= orderedHrefs.length - 1}
                    className="rounded-md border border-border p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    aria-label={`Descer ${link.label}`}
                  >
                    <ArrowDown size={14} suppressHydrationWarning />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
