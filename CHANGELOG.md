# Changelog

## [Unreleased]

## [1.14.0] - 2026-10-27

### Changed

- Compatibilidad verificada con Foundry VTT 14.369 y D&D5e 6.0.6.

## [1.0.2] - 2026-10-05

### Fixed

- Compatibilidad de avances con arrays heredados y objetos indexados por ID en dnd5e 6.x; se conserva el contenedor y solo se traducen etiquetas y pistas, sin fusionar mecánicas.

### Added

- Pruebas de regresión y evidencia de validación en `dev-tools/VALIDACION-COMPATIBILIDAD-6X.md`.


## [1.0.1] - 2026-10-04

### Changed

- Traducido el título visible `Subclass Features` como `Rasgos de subclase`.
- Corregido el tratamiento estructurado de `source`, `range` y `target` sin sobrescribir datos mecánicos.
- Registrados el módulo y sus conversores directamente durante `babele.init`.
- Añadida validación exhaustiva de las 19 entradas y de los IDs de carpetas, actividades, efectos y avances.

## [1.0.0]

### Added

- Primera traducción española de los dominios del Conocimiento, la Naturaleza y la Tempestad.
