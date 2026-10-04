Hooks.once("babele.init", babele => {
  if (!babele?.register) return;
  babele.register({
    module: "translate-dnd5e-cleric-domains-2024-es",
    lang: "es",
    dir: "compendium"
  });
});
