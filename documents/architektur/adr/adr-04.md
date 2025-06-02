# Title

ADR 04. Einsatz einer CI/CD-Pipeline für Build, Test, und Auslieferung der Applikation

## Status

Accepted.

## Context

- Der Build soll einheitlich und automatisiert erfolgen.
- Die Rückwärtskompatibilität von Änderung mit bestehender Software soll gewährleistet sein.
- Die ausgelieferte Software soll möglichst fehlerfrei sein.
- Neue Softwarestände sollen automatisch ausgeliefert werden. 

## Decision

Für den Build, die Tests und die Auslieferung der Software wird eine GitLab-CI/CD-Pipeline verwendet.

Begründung: Vorgabe zur Nutzung von GitLab.

## Consequences

- Die Applikation wird in mehrere Docker Container aufgeteilt.
- Das Ausführen der Applikation erfolgt mittels `docker` und `docker-compose`.

## Compliance

## Notes

Autor:innen: Sebastian Buresch;  Angenommen am: 16.04.2025; Letzte Änderung am: 16.04.2025