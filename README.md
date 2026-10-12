# Orbit Studio

A dark 3D creative studio site with a live Three.js hero, smooth scroll and a pinned horizontal work gallery.

## Features

1. Sticky nav with mobile menu, smooth anchor scrolling and scroll progress bar
2. Hero with live Three.js scene (wireframe torus knot plus particle field, mouse parallax) and animated intro
3. Work gallery pinned as horizontal scroll on desktop, stacked on mobile
4. Services grid, animated stat counters and client testimonial
5. Contact form with inline validation plus footer with back to top

## Libraries used

All via CDN with guards so the page stays readable if a CDN fails:

- three https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js
- gsap https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
- ScrollTrigger https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
- lenis https://unpkg.com/lenis@1.1.14/dist/lenis.min.js (global Lenis)
- Font: Space Grotesk (single Google Font)

## Run

One command from this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Customize

- Colors: edit CSS variables in `styles.css` (`--bg`, `--lime`, `--ink`)
- Hero scene: tweak `TorusKnotGeometry`, particle count and rotation speed in `script.js` `hero3D()`
- Work cards: duplicate an `article.card` block in `index.html`
- Contact email: update the address in the contact list section

## Structure

```
index.html   markup for nav, hero, work, services, studio, contact, footer
styles.css   all styling, responsive breakpoints at 1000px, 820px, 480px
script.js    nav, Lenis, Three.js hero, GSAP reveals and counters, form validation
README.md    this file
```

## Notes

- No build step. Static files only, GitHub Pages ready.
- Heavy animation pauses under `prefers-reduced-motion`. Hero renders one static frame on small screens or reduced motion.
