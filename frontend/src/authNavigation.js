export function safeReturnTo(value) {
  if (typeof value !== "string" || value !== value.trim()) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}
