const clone = value => {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  return structuredClone(value);
};

const isPlainObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

function mergeStructured(target, patch) {
  if (!isPlainObject(target) || !isPlainObject(patch)) return clone(patch);

  const result = clone(target);
  for (const [key, value] of Object.entries(patch)) {
    result[key] = isPlainObject(result[key]) && isPlainObject(value)
      ? mergeStructured(result[key], value)
      : clone(value);
  }
  return result;
}

export function clericDomainsSource(source, translation) {
  if (typeof source === "string" && typeof translation?.custom === "string") return translation.custom;
  if (!isPlainObject(source) || !isPlainObject(translation)) return source;
  return mergeStructured(source, translation);
}

export function clericDomainsActivitiesById(source, translation) {
  if (!isPlainObject(source) || !isPlainObject(translation)) return source;

  const result = clone(source);
  for (const [id, patch] of Object.entries(translation)) {
    if (!isPlainObject(result[id]) || !isPlainObject(patch)) continue;
    result[id] = mergeStructured(result[id], patch);
  }
  return result;
}

export function clericDomainsEffectsById(source, translation) {
  if (!Array.isArray(source) || !isPlainObject(translation)) return source;
  return source.map(effect => isPlainObject(translation[effect._id])
    ? mergeStructured(effect, translation[effect._id])
    : effect);
}

export function clericDomainsAdvancementById(source, translation) {
  if (!source || typeof source !== "object" || !translation || typeof translation !== "object") return source;
  const result = clone(source);
  const patches = Array.isArray(translation)
    ? Object.fromEntries(translation.filter(value => value?._id ?? value?.id).map(value => [value._id ?? value.id, value]))
    : translation;
  const rows = Array.isArray(result.contents) ? result.contents : result;
  for (const [key, advancement] of Object.entries(rows)) {
    if (!advancement || typeof advancement !== "object" || Array.isArray(advancement)) continue;
    const id = advancement._id ?? advancement.id ?? key;
    const patch = Object.hasOwn(patches, id) ? patches[id] : undefined;
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) continue;
    const label = typeof patch.name === "string" ? patch.name : patch.title;
    if (typeof label === "string") advancement["name" in advancement ? "name" : "title"] = label;
    if (typeof patch.hint === "string") advancement.hint = patch.hint;
  }
  return result;
}

Hooks.once("babele.init", babele => {
  if (!babele?.registerConverters) return;
  babele.registerConverters({
    clericDomainsSource,
    clericDomainsActivitiesById,
    clericDomainsEffectsById,
    clericDomainsAdvancementById
  });
});
