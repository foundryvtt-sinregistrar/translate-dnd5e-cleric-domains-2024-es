# D&D 2024 — Cleric Domains: Spanish Translation

[Español](README.md) | **English**

![Foundry VTT](https://img.shields.io/badge/Foundry_VTT-14.367%2B-green)
![dnd5e](https://img.shields.io/badge/dnd5e-6.0.3%2B-blue)
[![Latest release](https://img.shields.io/github/v/release/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es?label=release)](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/releases/latest)

Babele translation for **D&D 2024 — Cleric Domains**. It translates the three compendium folders and all 19 documents by stable ID, without duplicating or replacing base-module content.

## Status

Compatible with Foundry VTT 14.367 or newer, dnd5e 6.0.3 or newer, Babele 2.9.1 or newer, and base module version 1.14.0 or newer.

## Requirements

- Foundry VTT 14.367 or newer.
- The dnd5e system 6.0.3 or newer.
- `dnd5e-2024-cleric-domains` 1.14.0 or newer.
- The official PHB 2024 module.
- Babele 2.9.1 or newer.

## Installation

Install the module from Foundry using this manifest:

```text
https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/releases/latest/download/module.json
```

## Activation and use

Enable this translation, the base module, Babele, PHB 2024, and dnd5e. Select Spanish as Foundry's language and reload the world. Imported copies do not synchronize automatically.

## Updating

Update the base module first and then this translation. The translation preserves original stable IDs, so it does not modify advancements, UUIDs, or stored mechanical data.

## Included content

It translates visible values in `source`, activities, `range`, `target`, and effects. The visible `Subclass Features` heading becomes `Rasgos de subclase` without changing advancements or their IDs.

## Limitations

Only visible fields are translated; base-module mechanical data remains intact.

## Support and contributions

Report issues in the [translation repository](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/issues).

## Development

The complete ID contract is in the base module's `LOCALIZATION.md`. Before publishing, run `npm test`; it compares the 19 entries, three folders, and all nested IDs against `dnd5e-2024-cleric-domains/data/`.

## License and credits

See [LICENSE.md](LICENSE.md) and [CHANGELOG.md](CHANGELOG.md). Published releases contain the installable ZIP, an external `module.json`, and `SHA256SUMS.txt`.
