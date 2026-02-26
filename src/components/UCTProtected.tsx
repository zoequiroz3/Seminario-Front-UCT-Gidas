import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUct } from "@/hooks/useUct";
import AlertDialog from "@/components/AlertDialog";

export default function UCTProtected({ children }: { children: React.ReactNode }) {
    const { uct, isLoading } = useUct();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!isLoading && !uct) {
            setShow(true);
        }
    }, [isLoading, uct]);

    if (isLoading) {
        return (
            <div className="grid place-items-center min-h-[60vh] text-slate-500">
                Cargando configuración...
            </div>
        );
    }

    if (!uct) {
        return (
            <>
                <AlertDialog
                    open={show}
                    title="Grupo de investigación no configurado"
                    message="Para poder realizar esta acción, primero debe configurar el grupo de investigación (UCT) desde la sección correspondiente."
                    onClose={() => {
                        setShow(false);
                        navigate("/");
                    }}
                />
            </>
        );
    }

    return <>{children}</>;
}
