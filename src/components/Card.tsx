import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
  valueClassName?: string;
};

export default function Card({ title, value, children, className, valueClassName }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      {title ? <p className="text-sm text-slate-500">{title}</p> : null}
      {value ? (
        <p className={cn("mt-1 text-2xl font-semibold text-foreground", valueClassName)}>
          {value}
        </p>
      ) : null}
      {children}
    </div>
  );
}
