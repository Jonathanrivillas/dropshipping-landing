export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'Procesando', color: 'bg-blue-100 text-blue-700' },
  SHIPPED:    { label: 'Enviado',    color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED:  { label: 'Entregado',  color: 'bg-green-100 text-green-700' },
  CANCELLED:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700' },
};

export const VALID_STATUSES = Object.keys(STATUS_LABELS);
