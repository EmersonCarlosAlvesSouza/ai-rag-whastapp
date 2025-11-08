export function chunkText(text: string, chunkSize = 1200, overlap = 150) {
  const chunks: string[] = [];
  let i = 0;
  const s = text.replace(/\r/g, ""); // normaliza
  while (i < s.length) {
    const end = Math.min(i + chunkSize, s.length);
    chunks.push(s.slice(i, end).trim());
    if (end === s.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks.filter(Boolean);
}
