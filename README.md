# D&D 2024 — Dominios de clérigo: traducción al español

**Español** | [English](README.en.md)

![Foundry VTT](https://img.shields.io/badge/Foundry_VTT-14.367%2B-green)
![dnd5e](https://img.shields.io/badge/dnd5e-6.0.3%2B-blue)
[![Última versión](https://img.shields.io/github/v/release/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es?label=versi%C3%B3n)](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/releases/latest)

Traducción mediante Babele para **D&D 2024 — Cleric Domains**. Traduce por identificador estable las tres carpetas y los 19 documentos del compendio, sin duplicar ni reemplazar contenido del módulo base.

## Estado

Compatible con Foundry VTT 14.367 o posterior, dnd5e 6.0.3 o posterior, Babele 2.9.1 o posterior y la versión 1.14.0 o posterior del módulo base.

## Requisitos

- Foundry VTT 14.367 o posterior.
- El sistema dnd5e 6.0.3 o posterior.
- `dnd5e-2024-cleric-domains` 1.14.0 o posterior.
- El módulo oficial PHB 2024.
- Babele 2.9.1 o posterior.

## Instalación

Instala el módulo desde Foundry con este manifiesto:

```text
https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/releases/latest/download/module.json
```

## Activación y uso

Activa esta traducción, el módulo base, Babele, el PHB 2024 y dnd5e. Selecciona español como idioma de Foundry y recarga el mundo. Las copias importadas no se sincronizan automáticamente.

## Actualización

Actualiza primero el módulo base y después esta traducción. La traducción conserva los identificadores estables del contenido original, por lo que no modifica avances, UUID ni datos mecánicos almacenados.

## Contenido incluido

Traduce los valores visibles de `source`, actividades, `range`, `target` y efectos. El título visible `Subclass Features` se presenta como `Rasgos de subclase` sin cambiar los avances ni sus IDs.

## Limitaciones

Solo se traducen campos visibles; los datos mecánicos del módulo base permanecen intactos.

## Soporte y contribuciones

Comunica incidencias en el [repositorio de la traducción](https://github.com/foundryvtt-sinregistrar/translate-dnd5e-cleric-domains-2024-es/issues).

## Desarrollo

El contrato completo de IDs está en `LOCALIZATION.md` del módulo base. Antes de publicar, ejecuta `npm test`: la prueba compara las 19 entradas, las tres carpetas y todos los IDs anidados con `dnd5e-2024-cleric-domains/data/`.

## Licencia y créditos

Consulta [LICENSE.md](LICENSE.md) y [CHANGELOG.md](CHANGELOG.md). Las versiones publicadas incluyen el ZIP instalable, un `module.json` externo y `SHA256SUMS.txt`.
