## Title
ADR 06. Verwendung von Karma als Testframework für Angular

## Status
Accepted.

## Context
Für das Angular-Frontend sollen automatisierte Tests implementiert werden, um die Qualität, Wartbarkeit und Stabilität des Codes sicherzustellen. Es wird ein Testframework benötigt, das nahtlos mit Angular integrierbar ist und eine zuverlässige Ausführung von Unit-Tests ermöglicht.

## Decision
Karma wird als Testframework für das Angular-Projekt verwendet.

Begründung: Karma ist das Standard-Testframework in der Angular-Toolchain und lässt sich nahtlos mit Jasmine sowie dem Angular CLI integrieren. Es bietet eine robuste Umgebung für Unit-Tests mit Live-Browser-Support und ermöglicht eine kontinuierliche Testausführung in verschiedenen Browsern. Die Community-Unterstützung ist stark, und Karma ist gut dokumentiert und weit verbreitet in Angular-Projekten.

## Consequences
Tests können direkt im Entwicklungsprozess integriert und automatisiert in verschiedenen Browserumgebungen ausgeführt werden. Dies fördert die Codequalität und reduziert langfristig Wartungsaufwand und Fehleranfälligkeit.

## Compliance
Notes
Autor:innen: Sebastian Buresch; Angenommen am: 20.05.2025; Letzte Änderung am: 20.05.2025