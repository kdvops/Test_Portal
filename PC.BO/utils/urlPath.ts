export const urlPathRegex =
  /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

export function formatPath(value: string): string {
  let v = (value ?? "").trim();
  v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  v = v.replace(/\s+/g, "-").replace(/-{2,}/g, "-");
  v = v.replace(/[^a-zA-Z0-9\/-]/g, "");
  if (!v.startsWith("/")) v = "/" + v;
  v = v.replace(/\/{2,}/g, "/");
  if (v.length > 1) v = v.replace(/\/+$/g, "");
  return v.toLowerCase();
}

export function buildUrlPathRules(
  existingPaths: string[],
  editingIndex: number
) {
  return [
    (v: string) => !!v || "La URL es requerida",
    (v: string) =>
      urlPathRegex.test(v) || "Formato inválido. Usa /segmento/sub-segmento",
    (v: string) => {
      const idx = existingPaths.findIndex((p) => p === v);
      return (
        idx === -1 || idx === editingIndex || "Ya existe una página con esa URL"
      );
    },
  ];
}

/**
 * Convierte un path en un título (usa el último segmento).
 * "/" => "Inicio"
 * "/productos/tarjetas" => "Productos Tarjetas"
 */
export function titleFromPath(path: string): string {
  const p = formatPath(path || "");
  if (p === "/" || p === "") return "Inicio";
  const segs = p.split("/").filter(Boolean);
  const last = segs[segs.length - 1] || "";
  return slugToTitle(last);
}

export function slugToTitle(slug: string): string {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
