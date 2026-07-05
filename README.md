# 🎡 Inba Sagar · Portfolio Park

An interactive 3D portfolio: walk a little character around a theme park and
visit the attractions — each one opens a section of the portfolio.

| Attraction | Section |
| --- | --- |
| 👋 Info kiosk | About me |
| 🧪 Tech Lab dome | Tech stack (with orbiting icons) |
| 🎪 Carnival midway (3 booths) | Projects — one booth per project |
| ✉️ Post office | Contact form |

## Controls

- **Desktop:** the mouse is captured automatically (pointer lock, like a third-person game) and steers the camera · `WASD` / arrows walk camera-relative · scroll zooms · `E` opens an attraction · `Esc` frees the mouse / closes · `M` map · `H` help · `R` reset camera · click the floating `?` badges too
- **Mobile:** left side of the screen = floating joystick to walk · right side = drag to look around (both work at once) · tap the button to open
- **Map 🗺️** (top-right): fast-travel to any section
- Progress (⭐) tracks which sections you've explored

## Tech

React 18 · Vite · @react-three/fiber + drei · Tailwind CSS · EmailJS

The park sits on an island in a teal ocean. The world (booths, ferris wheel,
trees, carts) is procedural geometry so it renders instantly; the playable
knight is the only downloaded model and streams in behind a procedural
stand-in. The cartoon look comes from cel-shaded toon materials with a shared
3-step gradient, canvas-painted grass/path textures, a gradient sky dome and
outlined paths. Music and UI sounds are synthesized with WebAudio — no audio
files. Shadows are enabled on desktop only; touch devices get capped DPR and
blob shadows.

## Credits

- Character: "Knight" from the [KayKit Adventurers pack](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0)
  by Kay Lousberg — CC0 (see `public/models/CREDITS.txt`)

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```
