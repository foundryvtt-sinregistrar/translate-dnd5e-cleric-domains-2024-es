const PACK_ID = "dnd5e-2024-cleric-domains.classes24";
const SOURCE_TITLE = "Subclass Features";
const TRANSLATED_TITLE = "Rasgos de subclase";

export function translateAdvancementText(value) {
  return value === SOURCE_TITLE ? TRANSLATED_TITLE : value;
}

function replaceAdvancementTitles(root) {
  if (!(root instanceof HTMLElement)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue ?? "";
    const trimmed = original.trim();
    if (translateAdvancementText(trimmed) !== trimmed) {
      node.nodeValue = original.replace(SOURCE_TITLE, TRANSLATED_TITLE);
    }
  }
}

Hooks.on("renderApplicationV2", (application, element) => {
  if (game.i18n.lang.split("-")[0].toLowerCase() !== "es") return;
  const document = application.document ?? application.item;
  if (document?.pack !== PACK_ID || document.type !== "subclass") return;

  const root = element instanceof HTMLElement ? element : element?.[0];
  replaceAdvancementTitles(root);
  if (!(root instanceof HTMLElement)) return;

  const observer = new MutationObserver(() => {
    if (!root.isConnected) return observer.disconnect();
    replaceAdvancementTitles(root);
  });
  observer.observe(root, { childList: true, subtree: true });
});
