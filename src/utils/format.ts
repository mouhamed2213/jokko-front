export const formatMoney = (value: number): string =>
  `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;

export const formatDateTime = (value: unknown): string => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

export const formatDate = (value: unknown): string => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
};
