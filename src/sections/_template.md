# CV Section Template

This template documents the available formatting options, classes, and structure
for writing CV content sections.

---

## Page Breaks

Insert a page break using any of these formats:

```
\page
```

```
<!-- PAGE_BREAK -->
```

```
---PAGE---
```

---

## Section Headers

### Basic Section Header with Icon

Section headers use `<h2>` with an optional inline SVG icon:

```html
<h2>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- SVG path data here -->
  </svg>
  Section Title
</h2>
```

---

## Experience/Education Entries

### Standard Entry Format

```markdown
### Job Title _- Company Name_

_Start Date - End Date_

Description paragraph with [links](https://example.com).

- Bullet point with **bold** and _italic_ text
- Another achievement or responsibility
```

### Compact Entry (for older/less relevant items)

```markdown
- Role _- [Company](https://example.com), Date Range_
```

---

## Available CSS Classes

### Layout Classes

| Class | Usage | Description |
|-------|-------|-------------|
| `full-width` | `<h1 class="full-width">` | Makes element span full width |
| `page` | Auto-generated | Wraps each page (don't use manually) |
| `download-link` | Links | Styled download button (web only) |

---

## Text Formatting

| Markdown | Renders As | Use For |
|----------|-----------|---------|
| `**text**` | **bold** | Strong emphasis |
| `_text_` | _italic_ | Dates, organization names, subtle emphasis |
| `[text](url)` | link | External references |
| `> quote` | blockquote | Testimonials, quotes |

---

## Header Hierarchy

| Level | Usage | Styling |
|-------|-------|---------|
| `<h1>` or `#` | Name/title at top | Large, prominent |
| `<h2>` or `##` | Section headers | Colored background, icon support |
| `### text` | Entry titles | Accent colored, role/degree name |
| `#### text` | Sub-entries | Secondary information |

---

## Example: Complete Section

```markdown
<h2>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="..."/>
  </svg>
  Experience
</h2>

### Senior Developer _- Tech Company_

_January 2022 - Present_

[Company](https://example.com) builds innovative products. Key achievements:

- Led development of core platform features
- Mentored junior developers
- Improved build times by 50%

### Junior Developer _- Startup Inc_

_June 2020 - December 2021_

Early-stage startup focused on fintech solutions.

- Built REST APIs using Node.js
- Implemented CI/CD pipeline

\page

### Other Experience

- Intern _- [Previous Company](https://example.com), 2019_
- Freelance Developer _- Self-employed, 2018_
```

---

## Example: Header Section

```html
<h1 class="full-width">Your Name</h1>

<p class="full-width">
  <a href="mailto:email@example.com">email@example.com</a> ·
  <a href="https://yourwebsite.com">yourwebsite.com</a> ·
  <a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
</p>
```

---

## Tips

1. **Dates**: Use `_Date Range_` format for consistent italic styling
2. **Company names**: Include in the h3 as `_- Company Name_`
3. **Links**: Use URL shorteners (e.g., bit.ly) for tracking
4. **Bullets**: Start with action verbs, include metrics where possible
5. **Page breaks**: Place before sections that should start on a new page
6. **HTML in Markdown**: You can embed HTML when markdown isn't sufficient
7. **Icons**: Find SVG icons at sites like iconmonstr.com or heroicons.com

---

## File Naming Conventions

- `main.md` - Primary version of a section
- `main-markdown.md` - Alternative markdown-only version
- `experience-full.md` - Extended version with more detail
- Prefix with `_` (like this file) for templates/non-content files
