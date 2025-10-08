// utils/toCreatePayload.js
const ref = (v) => (typeof v === "string" ? v : v?._id ?? v?.id ?? v?.value ?? null);

export const toCreatePayload = (d = {}) => ({
  ageGroupId: ref(d.ageGroupId),
  themeId: ref(d.themeId),
  subThemeId: ref(d.subThemeId),
  centralMessageId: ref(d.centralMessageId),
  illustrationStyleId: ref(d.illustrationStyleId),
  fontStyleId: ref(d.fontStyleId),

  hobbies: Array.isArray(d.hobbies)
    ? d.hobbies
    : (d.hobbies || "").split(",").map(s => s.trim()).filter(Boolean),
  favoriteFood: d.favoriteFood || "",
  specialEvent: d.specialEvent || "",
  creatorName: d.creatorName || "",
  bookForward: d.bookForward || "",

  // include characters if your API supports them on create:
  // characters: (d.characters || []).map(c => ({
  //   name: c.name, age: c.age, gender: c.gender,
  //   characterType: c.characterType,
  //   originalImageUrl: c.originalImageUrl
  // }))
});
