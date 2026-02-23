import type React from "react";

export default function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label}
            </label>
            {children}
        </div>
    );
}
