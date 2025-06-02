# Title

ADR 03. Einsatz von Docker zur Auslieferung der Applikation

## Status

Accepted.

## Context

- Die Applikation soll plattformunabhängig ausgeführt werden können.7
- Die Installation soll einfach sein.

## Decision

Für die Auslieferung der Applikation wird Docker verwendet. 

Begründung: Weit verbreitetes Tool, einfache Ausführung von Software, plattformunabhängig, Portabilität.

## Consequences

- Die Applikation wird in mehrere Docker Container aufgeteilt.
- Das Ausführen der Applikation erfolgt mittels `docker-compose`.

## Compliance

## Notes

Autor:innen: Sebastian Buresch;  Angenommen am: 16.04.2025; Letzte Änderung am: 16.04.2025