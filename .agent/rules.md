---
description: Custom Context Rules & Guidelines for OpenCode Antigravity Config
---

# Project Guidelines: OpenCode Antigravity Config Installer

This document outlines the standard rules, guidelines, and context learned from building and updating the OpenCode Antigravity Config Installer. AI agents must follow these rules when developing or modifying the project.

## 1. Project Objective and Architecture
- **Objective:** Provide a fast, beautiful, and native application to install OpenCode config payloads into a Windows local directory (`~/.config/opencode/`). 
- **Tech Stack:** Vanilla HTML/CSS/JS bundled inside an Electron GUI application, distributed universally as an NPM global package.
- **Config Storage:** Raw configurations reside in the `/templates` folder. They are dynamically parsed and exported by `config-data.js`.
- **UI Logic:** Native Javascript without frameworks lives inside `renderer.js` and `main.js`. Translations are managed by `i18n.js`.

## 2. Models and Pricing Paradigms
- **Gemini Suite (Google):** 
  - `google/antigravity-gemini-3-1-pro`: The core solid model for standard intelligence tasks (e.g., standard group coders).
  - `google/antigravity-gemini-3-flash`: The rapid prototyping and minimal-context scout for fast execution.
  - *Rule:* Do NOT use "Deep Think" or fictional variants of Gemini models. Sticking exclusively to `3-1-pro` and `3-flash` avoids crashes.
- **Claude Suite (Anthropic):**
  - `google/antigravity-claude-opus-4-6-thinking`: The heavy-lifter (O1 class equivalent) orchestrator model reserved strictly for Max Reasoning presets.
  - `google/antigravity-claude-sonnet-4-6-thinking`: Complex code interpreter (middle-tier thinking model).
  - `google/antigravity-claude-sonnet-4-6`: Fast, smart execution for simpler web components. 

## 3. Deployment Rules (NPM & Git)
- **Immutable Package Strategy**: The package relies on `npx opencode-antigravity-config` and `npm install -g opencode-antigravity-config`. Thus, any logic or metadata change (especially versions) must be globally published to NPM.
- **Bumping Strategy:** When pushing changes, make sure you bump the version sequence *before* deploying to NPM (i.e. via `npm version patch`, creating a Git version tag in the process).
- **Dynamic Versions:** Never hardcode versions or UI badge dates inside HTML or Javascript. Instead, refer to `new Date().toISOString()` and read the imported `package.json` version string directly using logic defined inside `main.js`.

## 4. Workflows Directory Insight
A complete process on how to deploy any changes safely to both Git remote (`origin main`) and the NPM Global Registry acts as a dedicated script in `.agent/workflows/publish-to-npm.md`. Consult it if there is a requirement to `publish` a new update globally.
