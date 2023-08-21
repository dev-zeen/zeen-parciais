export function normalizeQuery(query: string) {
  return query
    .normalize('NFD') // Normaliza a string para decompor os caracteres acentuados em caracteres separados
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase(); // Remove os caracteres acentuados
}
