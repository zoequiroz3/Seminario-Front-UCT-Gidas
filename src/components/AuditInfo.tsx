import React from 'react';
import { Calendar, Info } from 'lucide-react';

interface AuditInfoProps {
    created_at?: string;
    creator_name?: string;
    deleted_at?: string;
    deleter_name?: string;
    activo?: boolean;
}

const AuditInfo: React.FC<AuditInfoProps> = ({
    created_at,
    creator_name,
    deleted_at,
    deleter_name,
    activo = true,
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    if (!created_at && !deleted_at && activo) return null;

    return (
        <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-2 text-xs md:text-sm text-slate-400">
                {created_at && (
                    <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        <span>
                            <span className="font-medium text-slate-500">Creado:</span> {formatDate(created_at)}
                            {creator_name && (
                                <span className="ml-1 italic text-slate-400">por {creator_name}</span>
                            )}
                        </span>
                    </div>
                )}

                {deleted_at && (
                    <div className="flex items-center gap-2 text-red-400">
                        <Calendar size={12} />
                        <span>
                            <span className="font-medium">Eliminado:</span> {formatDate(deleted_at)}
                            {deleter_name && (
                                <span className="ml-1 italic">por {deleter_name}</span>
                            )}
                        </span>
                    </div>
                )}

                {!activo && !deleted_at && (
                    <div className="flex items-center gap-2 text-amber-500 italic">
                        <Info size={12} />
                        <span>Estado: Inactivo / Dado de baja</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditInfo;
