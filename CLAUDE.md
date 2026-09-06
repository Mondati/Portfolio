# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio website for a backend developer. No build tooling — vanilla HTML, CSS, and JavaScript served statically via GitHub Pages.

**Deployment:** `git push origin gh-pages` (the `gh-pages` branch is the live site)

## Project Goal

This is a backend-focused portfolio.  
Clarity, usability, and technical communication are more important than visual complexity.

Avoid overengineering or unnecessary features.

## Tech Stack

- Vanilla HTML5 / CSS3 / JavaScript (no framework, no bundler)
- Font Awesome 6.4.0 and Google Fonts loaded from CDN
- Hosted on GitHub Pages — no build step required

## Constraints

- Do NOT introduce frameworks (React, Vue, etc.) unless explicitly requested
- Do NOT add build tools or dependencies
- Keep the project lightweight and fast
- Prefer vanilla JS over complex abstractions

## File Structure

- `index.html` — single page with all sections
- `assets/css/style.css` — all styling, including theme definitions
- `assets/js/main.js` — theme switching, mobile nav, scroll effects
- `assets/images/` — static images and favicon variants
- `assets/docs/` — downloadable assets (e.g., CV PDF)

## UI / UX Guidelines

- Keep a clean and professional design
- Avoid unnecessary visual complexity
- Use subtle animations and transitions
- Maintain consistency across themes
- Prioritize readability and spacing

## Theme System

Six CSS color themes (`marino`, `dark`, `bowser`, `choco`, `light`, `default`) are defined as `[data-theme="..."]` blocks in `style.css`.

Each theme overrides shared CSS variables:
`--bg`, `--bg2`, `--bg3`, `--text`, `--text2`, `--text3`, `--primary`, `--primary2`, `--border`, `--card`, `--shadow`, `--primary-rgb`.

- Selected theme is stored in `localStorage` under `portfolio-theme`
- Applied via `data-theme` on `<body>`
- Validate theme values before applying (whitelist)

When modifying themes, update all theme blocks for consistency.

## Responsive Design

- Breakpoints:
  - Mobile: ≤ 768px
  - Tablet: 769px–1024px
  - Desktop: ≥ 1025px

- Layout uses CSS Grid and Flexbox
- Fixed sidebars are hidden on mobile
- Ensure layouts adapt cleanly across all breakpoints

## JavaScript Patterns

`main.js` uses:

- `Intersection Observer` for scroll animations (`.visible`)
- DOM class toggling (`.open`, `.active`, `.scrolled`)
- `localStorage` for persistence

Performance & behavior guidelines:

- Use `requestAnimationFrame` for scroll-related updates
- Use passive event listeners where possible
- Avoid unnecessary reflows or heavy listeners

Accessibility:

- Ensure keyboard navigation works
- Maintain focus management (focus trap in mobile menu)
- Support closing interactions with `Escape`
- Use appropriate ARIA attributes

## Content Guidelines

- All UI text must be in **Spanish**
- Keep tone professional and concise
- Avoid phrases that reduce perceived seniority (e.g., "primeras oportunidades")
- Highlight technical skills and backend focus clearly

## Improvement Guidelines

- Suggest improvements when relevant, but keep them realistic and incremental
- Prefer small, high-impact changes over large rewrites
- Explain decisions briefly before implementing
