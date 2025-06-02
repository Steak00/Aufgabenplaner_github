# Teststrategie für das Softwareprojekt (Angular & Spring Boot)

## 1. Ziel der Teststrategie

Diese Teststrategie beschreibt die Vorgehensweise zur Qualitätssicherung unseres Softwareprojekts mit Angular-Frontend und Spring Boot-Backend. Ziel ist es, durch systematische Tests eine hohe Softwarequalität, Wartbarkeit und Fehlertoleranz zu gewährleisten.

## 2. Testebenen

Unsere Teststrategie umfasst drei zentrale Testebenen:

- **Unit-Tests (Frontend & Backend)**
- **Integrationstests (optional ergänzbar)**
- **End-to-End-Tests (E2E)**

---

## 3. Unit-Tests

### 3.1 Frontend (Angular)

- **Framework**: [Karma](https://karma-runner.github.io/) + [Jasmine](https://jasmine.github.io/)
- **Ziel**: Test einzelner Komponenten, Services und Pipes isoliert vom Rest der Anwendung.
- **Umsetzung**:
  - Jede Komponente besitzt zugehörige Unit-Tests.
  - Services werden über Dependency Injection mit gemockten Abhängigkeiten getestet.
  - Pipes und Hilfsmethoden werden einzeln getestet.
- **Werkzeuge**:
  - Angular CLI (`ng test`)
  - Coverage-Auswertung mit `karma-coverage`

### 3.2 Backend (Spring Boot)

- **Framework**: Spring Boot Test (`spring-boot-starter-test`), JUnit 5, Mockito
- **Ziel**: Isoliertes Testen von Business-Logik, Services, Repositories und Hilfsklassen.
- **Umsetzung**:
  - Unit-Tests für Services mit gemockten Repositories (Mockito).
  - Repositories mit In-Memory-Datenbank (z. B. H2) testbar.
  - Helper-Methoden und DTO-Mapper separat testbar.
- **Werkzeuge**:
  - Maven/Gradle (`mvn test` / `gradle test`)
  - Testabdeckung z. B. mit JaCoCo

---

## 4. End-to-End-Tests (E2E)

- **Ziel**: Sicherstellung, dass das System aus Benutzersicht korrekt funktioniert – über alle Schichten hinweg (Frontend ↔ Backend ↔ Datenbank).
- **Tool**: [Cypress](https://www.cypress.io/)
- **Szenarien**:
  - Login und Authentifizierung
  - Benutzerinteraktionen mit Formularen
  - Navigation zwischen Views
  - Backend-Kommunikation über REST-APIs
- **Integration**:
  - Ausführung in einer Staging-Umgebung oder mit Mock-Backend
  - Integration in CI/CD-Pipeline

---

## 5. Testabdeckung und Qualitätssicherung

- **Zielwerte**:
  - Frontend Unit-Test Coverage: ≥ 60 %
  - Backend Unit-Test Coverage: ≥ 60 %
  - E2E: Abdeckung des Hauptpfades zum Abrufen von Nutzerdaten
- **Überwachung**:
  - (Code Coverage Tools (Karma Coverage, JaCoCo))
  - Regelmäßige Reviews von Tests
  - Tests als Teil von Merge- und Deployment-Prozessen

---

## 6. Automatisierung und CI/CD

- Tests werden automatisch ausgeführt bei:
  - Pull Requests (PRs) / Commits
  - Merge in Haupt-Branch
- Integration in CI/CD-Toolchain (GitLab CI/CD-Pipeline)
- Automatischer Abbruch bei fehlgeschlagenen Tests

---

## 7. Verantwortlichkeiten

- **Gesamtes Team** 
  - schreiben und pflegen Unit-Tests zu ihrem Code.
  - überwachen E2E-Tests und Coverage-Ziele.
  - prüfen, ob Tests ausreichend sind und eingehalten werden.

---

## 8. Fazit

Diese Teststrategie unterstützt uns dabei, qualitativ hochwertige Software zu liefern. Durch eine Kombination aus Unit-Tests, End-to-End-Tests und Automatisierung können Fehler frühzeitig erkannt und behoben werden, was langfristig Zeit und Kosten spart.
