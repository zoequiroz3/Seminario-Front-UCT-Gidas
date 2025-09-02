import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base = "px-4 py-2 rounded-lg font-medium transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:opacity-90"
      : "bg-slate-200 text-slate-900 hover:bg-slate-300";

  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}