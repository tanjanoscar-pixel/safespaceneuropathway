# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**safespaceneuropathway** is a child-facing mood tracking app. It is in early-stage development — no application code exists yet. The repository currently contains only a devcontainer configuration.

## Development Environment

The project is configured to use a [VS Code Dev Container](https://containers.dev/) based on `mcr.microsoft.com/devcontainers/universal:2`, which provides a broad set of language runtimes and tools out of the box (Node.js, Python, Java, Go, etc.).

To start developing inside the container:
- Open the repository in VS Code and accept the "Reopen in Container" prompt, or
- Use `gh codespace create` / GitHub Codespaces from the repository page.

## Architecture Notes

No application stack has been chosen yet. When the stack is decided, update this file with:
- Build, lint, and test commands
- Framework and library choices
- Directory structure conventions
- Any child-safety or data-privacy requirements specific to this app's audience
