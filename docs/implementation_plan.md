# Implementation Plan - Migrate Tax Simulator to Angular 21

Migrate the existing tax simulator from a single `index.html` file to a modern Angular 21 application using `pnpm`, `@ngrx/signals`, and **Signal Forms**.

## Proposed Changes

### Project Setup

- [NEW] Backup existing `src/index.html` to `legacy/index.html` to prepare for `ng new`.
- [NEW] Initialize Angular 21 project using `pnpm` in the current directory with SSR and full AI config:
  ```shell
  ng new simulador-autonomos --ssr --ai-config=agents,gemini,cursor,windsurf,copilot,jetbrains --directory ./
  ```
- [NEW] Configure **Static Rendering (SSG)** to ensure the simulator is pre-rendered at build time.
- [NEW] Configure **Zoneless change detection** using `provideZonelessChangeDetection()`.
- [NEW] Create/Update **IDE & AI Configuration Files**:
  - `.editorconfig`: Ensure standard coding style rules.
  - `.vscode/extensions.json`: Recommend verified Angular, Tailwind, and Pnpm extensions.
  - `.vscode/settings.json`: Workspace settings for formatting and linting.
  - `AGENTS.md` / `.cursorrules` / `.windsurfrules`: Context rules for AI assistants (if not covered by `ai-config`).
- [NEW] Setup Tailwind CSS using the automated `ng add` command:
  ```shell
  ng add tailwindcss
  ```
  This command automatically installs packages, configures Tailwind, and adds the necessary `@import` statements to `styles.css`.
- [NEW] Install `@ngrx/signals` (latest version) for global state management.
- [NEW] Install and configure Angular Signal Forms.

### Best Practices & Guidelines

Adhere to `docs/best-practices.md` and Angular 21 standards:

- **Angular MCP**: Use `search_documentation` and `find_examples` to ensure alignment with official documentation.
- **Tailwind CSS MCP**: Use `search_documentation` to access Tailwind CSS v4 documentation (e.g., new zero-config approach) and best practices.
- **NgRx Signals Verification**: Verify usage of latest features (e.g. `signalMethod`, `rxMethod`, `linkedSignal` integration) via `search_web` or official benchmarks.
- **Standalone Components**: Use the default standalone behavior (v21+).
- **Control Flow**: Use `@if`, `@for`, `@switch`.
- **Signals**: Use `input()`, `output()`, `computed()`, and `effect()`.
- **Dependency Injection**: Use `inject()`.
- **Change Detection**: Use `ChangeDetectionStrategy.OnPush`.
- **Host Bindings**: Use the `host` property in decorators.

### Core Logic

- [NEW] `src/app/core/models/simulation.model.ts`: Define interfaces for inputs, results, and tax brackets.
- [NEW] `src/app/core/services/tax-calculator.service.ts`: Port logic for IRPF, social security, and deductions (functional approach).
- [NEW] `src/app/core/store/simulator.store.ts`: Signal Store to manage global state and derive results.
- [NEW] `src/app/core/data/tax-brackets.ts`: Static data for state and regional tax brackets.

### Components

- [NEW] `src/app/features/simulator/simulator.component.ts`: Parent component managed by `SimulatorStore`.
- [NEW] `src/app/features/simulator/components/input-form/input-form.component.ts`: **Signal-based Reactive Form** for simulation data.
- [NEW] `src/app/features/simulator/components/results-view/results-view.component.ts`: Summary view using derived signals from the store.
- [NEW] `src/app/shared/components/header/header.component.ts`: Navigation and summary top bar.

### Style and Assets

- [MODIFY] `src/styles.css`: Official Tailwind imports and specific utility classes migrated from `index.html`.

## Verification Plan

### Manual Verification

- Run the original `index.html` and the new Angular app side-by-side.
- Compare calculations for various revenue, expenses, and regional profiles.
- Verify accessibility (AXE checks) and responsive design.

### Automated Tests

- [NEW] `tax-calculator.service.spec.ts`: Unit tests for tax logic scenarios.
- [NEW] `simulator.store.spec.ts`: Test state transitions and derived results.
