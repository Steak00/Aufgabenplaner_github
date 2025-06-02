## Title
ADR 07. Verwendung des integrierten Testframeworks in Spring Boot

## Status
Accepted.

## Context
Für das Backend auf Basis von Spring Boot sollen automatisierte Tests erstellt werden, um die Funktionsfähigkeit, Qualität und Wartbarkeit der Anwendung sicherzustellen. Die Testumgebung soll gut in das Framework integriert sein und die typischen Anforderungen wie Unit-Tests, Integrationstests und Testkontextunterstützung abdecken.

## Decision
Das integrierte Testframework von Spring Boot wird verwendet.

Begründung: Spring Boot bietet mit spring-boot-starter-test ein umfassendes, sofort einsatzbereites Testframework, das JUnit, Mockito, AssertJ und Spring TestContext unterstützt. Es erlaubt einfache Konfiguration, schnellen Zugriff auf den Anwendungskontext sowie realistische Tests von Komponenten, Services und Webschnittstellen. Die enge Verzahnung mit Spring Boot reduziert Konfigurationsaufwand und erhöht die Testgeschwindigkeit und -qualität.

## Consequences
Die Tests sind tief in das Framework integriert, wodurch konsistente, wartbare und leicht verständliche Testfälle entstehen. Die Nutzung des Standard-Testframeworks erleichtert Einarbeitung, Wartung und Integration in CI/CD-Pipelines.

## Compliance
Notes
Autor:innen: Sebastian Buresch; Angenommen am: 20.05.2025; Letzte Änderung am: 20.05.2025