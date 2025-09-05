import * as React from "react";

type TarjetaPropiedades<T> = {
  item: T;
  title: (item: T) => React.ReactNode;
  subtitle?: (item: T) => React.ReactNode;
  onClick?: () => void;
  className?: string;
  titleClassName?: string;    
  subtitleClassName?: string; 
};

export default function Tarjeta<T>({
  item,
  title,
  subtitle,
  onClick,
  className = "",
  titleClassName = "", subtitleClassName = "",
}: TarjetaPropiedades<T>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl border border-slate-200 bg-white/80 px-6 py-6",
        "shadow-sm hover:shadow transition-shadow focus:outline-none focus:ring-2 focus:ring-slate-300",
        className,
      ].join(" ")}
    >
       <div className={["font-semibold text-lg", titleClassName].join(" ")}>
        {title(item)}
      </div>
      {subtitle && (
        <div className={["mt-1 text-sm text-slate-500", subtitleClassName].join(" ")}>
          {subtitle(item)}
        </div>
      )}
    </button>
  );
}
