# Solar Traffic System — Navigation Atlas

**Reference epoch:** 2120  
**Live:** https://usermzwpislfrth33e0t.github.io/sts-atlas/

Interactive atlas and engineering archive for the fictional Solar Traffic System.

## Current architecture

- `index.html`: original self-contained STS V4 website, including the 79-facility / 128-link network, atlas, facility registry, and navigation simulator.
- `shipyard-v5.js`: interactive procedural engineering models for four vessels (sail freighter, sail clipper, fusion transport, orbital tug). Includes a matching map vessel visual update.
- `shipyard-v5.css`: responsive shipyard interface and technical inspection layout.
- `.github/workflows/deploy-pages.yml`: GitHub Pages builder. It injects the Shipyard V5 stylesheet and script into a **copy of** `index.html` during deployment, preserving the original large source file.

## Shipyard controls

Drag to rotate; use wheel or pinch to zoom. Select different vessels from the model tabs. Use **EXPLODED** to separate major structural systems, **WIREFRAME** for an engineering view, or choose a component from the inspection panel.

The vessel models and labels are **non-canonical concept studies**. No class history, registry, or exact dimensions are implied by their geometry. The visual implementation does not claim physically accurate thermal performance, beam optics, or orbital ephemerides.

## Notes

The procedural viewer is dependency-free and draws only while the shipyard page is active. The original STS canvas renderer remains responsible for the solar-system atlas.

If deploying without GitHub Actions, include `shipyard-v5.css` in the document head and `shipyard-v5.js` at the end of the document body, after the original STS app script.

The ongoing priority is improved vessel and station model quality, route dynamics, and mobile graphics performance.
