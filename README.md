# JGU M.Sc. Design Thinking Landing Page

Pixel-perfect HTML/CSS/JS landing page for **M.Sc. in Design Thinking, Innovation & Strategy** — O.P. Jindal Global University Online.

## Project Structure

```
jgu-msc-design-thinking-landing/
├── index.html          # Main page (all sections)
├── css/
│   └── style.css       # All styles + responsive breakpoints
├── js/
│   └── script.js       # FAQ accordion + form handlers
├── images/
│   ├── ASSETS.md       # Full asset list with filenames
│   ├── logos/
│   ├── hero/
│   ├── benefits/
│   ├── program/
│   ├── fee/
│   ├── highlights/
│   ├── skills/
│   ├── cta/
│   ├── career/
│   ├── faculty/
│   ├── accreditations/
│   └── icons/
└── README.md
```

## Setup

All **53 image assets** are included as placeholders (labeled images + SVG icons). Replace them with final Figma/SharePoint exports using the same filenames — see `images/ASSETS.md`.

1. Open `index.html` in a browser, or run a local server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

4. Visit `http://localhost:8080`

## Sections

1. Hero + Enquiry Form + Info Bar
2. What's in it for you (8 cards + programme info)
3. Fee Structure
4. Highlights
5. Skills You'll Acquire + Download Brochure CTA
6. Comparison Table
7. Career Outcomes
8. Meet Our Faculty
9. Recognitions and Accreditations
10. FAQs
11. Enquire Now + Footer

## Tech

- HTML5
- CSS3 (Flexbox + Grid, no frameworks)
- Vanilla JavaScript
