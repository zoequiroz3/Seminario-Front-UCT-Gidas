import type React from "react";

export default function ErrorText({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-red-500 text-sm mt-1">
            {children}
        </p>
    );
}
