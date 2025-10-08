// utils/getFromName.js
export function getFromName(book) {
  const direct =
    book?.processedCharacters?.[0]?.name
  if (direct) return direct;

  const scenes = book?.storyStructure?.scenes || [];
  const textFields = (s) =>
    s?.textContent || s?.sceneText || s?.sceneDescription || s?.narration || "";

  const tally = {};
  const COMMON = new Set(["The","A","An","And","I","We","You","They","He","She","It","On","In","At","To","From","For","With","Of","My","Our","Your"]);
  const re = /\b([A-Z][a-z]{1,})\b/g;

  for (const s of scenes) {
    const txt = textFields(s);
    for (const m of txt.matchAll(re)) {
      const w = m[1];
      if (COMMON.has(w)) continue;
      tally[w] = (tally[w] || 0) + 1;
    }
  }
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}
