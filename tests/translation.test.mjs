import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";

const translation = JSON.parse(readFileSync(
  new URL("../compendium/dnd5e-2024-cleric-domains.classes24.json", import.meta.url),
  "utf8"
));
const registration = readFileSync(new URL("../scripts/babele-register.mjs", import.meta.url), "utf8");
const converterRegistration = readFileSync(new URL("../scripts/converters.mjs", import.meta.url), "utf8");
const baseModulePath = process.env.CLERIC_DOMAINS_BASE_PATH
  ? resolve(process.env.CLERIC_DOMAINS_BASE_PATH)
  : fileURLToPath(new URL("../../dnd5e-2024-cleric-domains", import.meta.url));
const { CONTENT_ITEMS, CONTENT_FOLDERS } = await import(pathToFileURL(resolve(baseModulePath, "data/index.mjs")));

globalThis.Hooks = { once() {} };
const {
  clericDomainsSource,
  clericDomainsActivitiesById,
  clericDomainsEffectsById,
  clericDomainsAdvancementById
} = await import(new URL("../scripts/converters.mjs", import.meta.url));
const advancementLocalization = readFileSync(new URL("../scripts/advancement-localization.mjs", import.meta.url), "utf8");

const sorted = values => [...values].sort();

test("registers Babele and converters during babele.init", () => {
  assert.match(registration, /module: "translate-dnd5e-cleric-domains-2024-es"/);
  assert.doesNotMatch(registration, /Hooks\.once\("setup"/);
  assert.doesNotMatch(converterRegistration, /Hooks\.once\("setup"/);
  assert.match(converterRegistration, /clericDomainsSource/);
  assert.match(advancementLocalization, /renderApplicationV2/);
  assert.match(advancementLocalization, /Rasgos de subclase/);
});

test("Spanish translation covers every Item and folder ID", () => {
  assert.equal(translation.metadata.pack, "dnd5e-2024-cleric-domains.classes24");
  assert.equal(translation.metadata.entries, CONTENT_ITEMS.length);
  assert.deepEqual(sorted(Object.keys(translation.entries)), sorted(CONTENT_ITEMS.map(item => item._id)));
  assert.deepEqual(sorted(Object.keys(translation.folders)), sorted(CONTENT_FOLDERS.map(folder => folder.name)));
});

test("nested activity, effect, and advancement IDs match the source data", () => {
  for (const item of CONTENT_ITEMS) {
    const entry = translation.entries[item._id];
    assert.ok(entry, `Missing translation for ${item._id}`);
    assert.deepEqual(sorted(Object.keys(entry.activities ?? {})), sorted(Object.keys(item.system.activities ?? {})), `${item._id} activity IDs`);
    assert.deepEqual(sorted(Object.keys(entry.effects ?? {})), sorted((item.effects ?? []).map(effect => effect._id)), `${item._id} effect IDs`);
    assert.deepEqual(sorted(Object.keys(entry.advancement ?? {})), sorted((item.system.advancement ?? []).map(advancement => advancement._id)), `${item._id} advancement IDs`);
    for (const advancement of Object.values(entry.advancement ?? {})) {
      assert.equal(advancement.title, "Rasgos de subclase", `${item._id} advancement title`);
    }
  }
});

test("source, range, and target payloads preserve the source schema", () => {
  assert.equal(translation.mapping.source.path, "system.source.custom");
  for (const item of CONTENT_ITEMS) {
    const entry = translation.entries[item._id];
    assert.equal(typeof entry.source?.custom, "string", `${item._id} source.custom`);

    for (const [activityId, patch] of Object.entries(entry.activities ?? {})) {
      const sourceActivity = item.system.activities[activityId];
      assert.ok(sourceActivity, `${item._id}.${activityId} exists in source`);
      if (patch.range !== undefined) {
        assert.equal(typeof patch.range, "object", `${item._id}.${activityId}.range`);
        assert.equal(typeof sourceActivity.range, "object", `${item._id}.${activityId} source range`);
      }
      if (patch.target !== undefined) {
        assert.equal(typeof patch.target, "object", `${item._id}.${activityId}.target`);
        assert.equal(typeof sourceActivity.target, "object", `${item._id}.${activityId} source target`);
      }
    }
  }
});

test("all translated entries are complete and contain no known English labels", () => {
  for (const [id, entry] of Object.entries(translation.entries)) {
    assert.match(id, /^[A-Za-z0-9]{16}$/);
    assert.ok(entry.name.trim(), `${id} name`);
    assert.ok(entry.description.trim(), `${id} description`);
    assert.doesNotMatch(JSON.stringify(entry), /Subclass Features|Knowledge Domain|Nature Domain|Tempest Domain/);
  }
});

test("structured converters translate without discarding mechanical fields", () => {
  const source = { custom: "English", rules: "2024", revision: 1, license: "", book: "" };
  assert.deepEqual(clericDomainsSource(source, { custom: "Español" }), { ...source, custom: "Español" });
  assert.equal(clericDomainsSource(source.custom, { custom: "Español" }), "Español");

  const activities = {
    activity0000001: {
      name: "English",
      range: { units: "ft", special: "English", override: false },
      target: { prompt: true, affects: { type: "creature", special: "English" } }
    }
  };
  const translatedActivities = clericDomainsActivitiesById(activities, {
    activity0000001: {
      name: "Español",
      range: { special: "Treinta pies" },
      target: { affects: { special: "Una criatura" } }
    }
  });
  assert.equal(translatedActivities.activity0000001.range.units, "ft");
  assert.equal(translatedActivities.activity0000001.range.special, "Treinta pies");
  assert.equal(translatedActivities.activity0000001.target.prompt, true);
  assert.equal(translatedActivities.activity0000001.target.affects.type, "creature");
  assert.equal(translatedActivities.activity0000001.target.affects.special, "Una criatura");

  assert.equal(clericDomainsEffectsById([{ _id: "effect0000000001", name: "English", disabled: false }], {
    effect0000000001: { name: "Español" }
  })[0].disabled, false);
  assert.equal(clericDomainsAdvancementById([{ _id: "advance000000001", title: "Subclass Features", level: 3 }], {
    advance000000001: { title: "Rasgos de subclase" }
  })[0].title, "Rasgos de subclase");

});
