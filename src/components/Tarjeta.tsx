import * as React from "react";

type TarjetaPropiedades<T> = {
  item: T;
  title: (item: T) => React.ReactNode;
  subtitle?: (item: T) => React.ReactNode;
  onClick?: () => void;

  // NUEVO
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;

  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export default function Tarjeta<T>({
  item,
  title,
  subtitle,
  onClick,

  selectable = false,
  selected = false,
  onSelectChange,

  className = "",
  titleClassName = "",
  subtitleClassName = "",
}: TarjetaPropiedades<T>) {
  return (
    <div
      className={[
        "relative w-full rounded-xl border border-slate-200 bg-white/80 px-6 py-6",
        "shadow-sm hover:shadow transition-shadow",
        className,
      ].join(" ")}
    >
      {selectable && (
        <div className="absolute inset-y-0 right-4 flex items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectChange?.(e.target.checked)}
            className="h-4 w-4 accent-slate-700"
          />
        </div>
      )}


      <button
        type="button"
        onClick={selectable ? undefined : onClick}
        className="w-full text-left"
      >
        <div className={["font-semibold text-lg", titleClassName].join(" ")}>
          {title(item)}
        </div>

        {subtitle && (
          <div
            className={[
              "mt-1 text-sm text-slate-500",
              subtitleClassName,
            ].join(" ")}
          >
            {subtitle(item)}
          </div>
        )}
      </button>
    </div>
  );
}
