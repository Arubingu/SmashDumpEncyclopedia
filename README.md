# SmashDump Encyclopedia

[Open the Encyclopedia](https://arubingu.github.io/SmashDumpEncyclopedia/)

This repository contains the latest privacy-sanitized static export of the accepted SmashDump Encyclopedia. Historical builds are not published here.

## Current release

- Content: `1.5.1`
- Encyclopedia: `0.1.15`
- Release date: `2026-09-26`
- Added entities: `0`
- Modified entities: `0`

## Encyclopedia changes

- **Mobile Tools scroll behavior** — Changed the mobile Tools drawer to reopen automatically only after returning to the top of the results. Manual hiding now remains stable while scrolling, without brief unintended reopen-and-close movement.
- **Gauntlette total-point rewards** — Added the cumulative total-point reward ladders to the Golem, Blinkster and Firebird Gauntlette stage details, kept separate from each stage's single-run score rewards.
- **Gacha rarity labels** — Corrected Gacha rate labels to use the player-facing 1★, 2★ and 3★ rarity scale.
- **Mobile drawers and detail motion** — Made the mobile Tools area retract as a single compact drawer, accelerated its motion, prevented bottom-of-list layout changes from retriggering the drawer, and added matching snappy slide-in and slide-out transitions for fully rendered detail pages. Desktop detail changes remain immediate and no longer inherit mobile animation behavior.
- **Vocation skill restrictions** — Restored Ranger-, Sage- and Paladin-only labels throughout skill details and permanent vocation-tree states, including Fenrir's Hunt upgrades.
- **Enemy families** — Added source-backed family names and family filtering across the active Enemy catalogue, while enemies without a resolved source family remain explicitly marked Unknown.
- **Memory presentation** — Removed the leaked internal description key from A Memory, added clear Story or Event labels to Memory cards, and added a Memory type filter for browsing Story and Event entries independently.
