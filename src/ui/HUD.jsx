import { useEffect, useState } from 'react';
import { fastTravel, sectionsForProgress, profile } from '../data/content';
import { queueJump } from '../game/input';

// ---------------------------------------------------------------------------
// DOM overlay: brand chip, sound toggles, progress + map, interact prompt,
// mobile FAB, fast-travel map, help modal and the pointer-lock crosshair.
// ---------------------------------------------------------------------------

export default function HUD({
  started,
  isTouch,
  locked,
  activeZone,
  visited,
  panelOpen,
  mapOpen,
  helpOpen,
  soundState,
  onToggleMusic,
  onToggleSfx,
  onSetMap,
  onSetHelp,
  onInteract,
  onTeleport,
  onResetCam,
}) {
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setHintVisible(false), 9000);
    return () => clearTimeout(t);
  }, [started]);

  if (!started) return null;

  const modalOpen = panelOpen || mapOpen || helpOpen;
  const showPrompt = activeZone && !modalOpen;

  return (
    <>
      {/* Brand */}
      <div className="hud-chip fixed top-3 left-3 z-30">
        <span className="text-lg leading-none">🎡</span>
        <span className="font-semibold tracking-wide">{profile.name}</span>
      </div>

      {/* Sound toggles + progress + map */}
      <div className="fixed top-3 right-3 z-30 flex items-center gap-2">
        <button
          className="hud-chip hud-btn hud-icon"
          onClick={onToggleSfx}
          aria-label={soundState.sfx ? 'Mute sounds' : 'Unmute sounds'}
          title="Sound effects"
        >
          {soundState.sfx ? '🔊' : '🔇'}
        </button>
        <button
          className="hud-chip hud-btn hud-icon"
          onClick={onToggleMusic}
          aria-label={soundState.music ? 'Mute music' : 'Play music'}
          title="Music"
        >
          {soundState.music ? '🎵' : '🔕'}
        </button>
        <div className="hud-chip" title="Sections explored">
          <span>⭐</span>
          <span className="font-semibold">
            {visited.size}/{sectionsForProgress.length}
          </span>
        </div>
        <button className="hud-chip hud-btn" onClick={() => onSetMap(true)} aria-label="Open park map">
          <span>🗺️</span>
          <span className="font-semibold max-[420px]:hidden">Map</span>
        </button>
      </div>

      {/* Bottom-left: reset camera + help (like the reference player bar) */}
      <div className="fixed bottom-3 left-3 z-30 flex items-center gap-2">
        <button className="hud-chip hud-btn" onClick={onResetCam} aria-label="Reset camera" title="Reset camera (R)">
          <span>🎥</span>
          <span className="font-semibold max-[520px]:hidden">Reset camera</span>
        </button>
        <button className="hud-chip hud-btn" onClick={() => onSetHelp(true)} aria-label="Help" title="Help (H)">
          <span>❓</span>
          <span className="font-semibold max-[520px]:hidden">Help</span>
        </button>
      </div>

      {/* Crosshair while the mouse is captured */}
      {locked && !modalOpen && <div className="crosshair" />}

      {/* Mouse-capture hint */}
      {!isTouch && !locked && !modalOpen && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 hud-hint" style={{ animation: 'none' }}>
          Click the world to capture the mouse
        </div>
      )}

      {/* Controls hint */}
      {hintVisible && !modalOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 hud-hint">
          {isTouch ? 'Left: drag to walk · Right: drag to look' : 'WASD to walk · mouse to look · scroll to zoom'}
        </div>
      )}

      {/* Interact prompt */}
      {showPrompt && !isTouch && (
        <button className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 hud-prompt" onClick={onInteract}>
          <span className="hud-key">E</span>
          <span>
            Open <b>{activeZone.label}</b>
          </span>
        </button>
      )}
      {showPrompt && isTouch && (
        <button
          className="fixed bottom-28 right-4 z-30 hud-fab"
          onClick={onInteract}
          aria-label={`Open ${activeZone.label}`}
        >
          <span className="text-3xl leading-none">{activeZone.emoji}</span>
          <span className="text-[11px] font-bold tracking-wider mt-0.5">OPEN</span>
        </button>
      )}

      {/* Mobile jump button */}
      {isTouch && !modalOpen && (
        <button
          className="fixed bottom-7 right-5 z-30 jump-fab"
          onPointerDown={(e) => {
            e.preventDefault();
            queueJump();
          }}
          aria-label="Jump"
        >
          ⤴
        </button>
      )}

      {/* Fast travel map */}
      {mapOpen && (
        <div className="panel-backdrop z-40" onClick={() => onSetMap(false)}>
          <div className="panel-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Park Map</h2>
              <button className="panel-close" onClick={() => onSetMap(false)} aria-label="Close map">
                ✕
              </button>
            </div>
            <p className="text-sm text-white-600 mb-4">Jump straight to any spot in the park.</p>
            <div className="grid grid-cols-2 gap-3">
              {fastTravel.map((f) => (
                <button
                  key={f.id}
                  className="ft-btn"
                  onClick={() => {
                    onTeleport(f);
                    onSetMap(false);
                  }}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-semibold text-sm">{f.label}</span>
                  {visited.has(f.id) && <span className="ft-tick">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help modal */}
      {helpOpen && (
        <div className="panel-backdrop z-40" onClick={() => onSetHelp(false)}>
          <div className="panel-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Help</h2>
              <button className="panel-close" onClick={() => onSetHelp(false)} aria-label="Close help">
                ✕
              </button>
            </div>
            {isTouch ? (
              <ul className="space-y-2.5 text-white-600 text-sm">
                <li>👆 <b className="text-white">Left side:</b> drag to walk (floating joystick)</li>
                <li>🔄 <b className="text-white">Right side:</b> drag to look around</li>
                <li>⤴ <b className="text-white">Jump button</b> — bottom right</li>
                <li>🎪 Walk up to an attraction and tap <b className="text-white">OPEN</b></li>
                <li>🕹️ Visit the ferris wheel for the arcade mini-games</li>
                <li>🗺️ Use the map to fast-travel between sections</li>
              </ul>
            ) : (
              <ul className="space-y-2.5 text-white-600 text-sm">
                <li>⌨️ <span className="hud-key">W</span> <span className="hud-key">A</span> <span className="hud-key">S</span> <span className="hud-key">D</span> or arrows — walk · <span className="hud-key">Space</span> — jump</li>
                <li>🖱️ Mouse steers the camera (click the world to capture it, <span className="hud-key">Esc</span> to free it)</li>
                <li>🖲️ Scroll — zoom in/out</li>
                <li><span className="hud-key">E</span> — open the attraction you are near</li>
                <li><span className="hud-key">M</span> — park map · <span className="hud-key">H</span> — help · <span className="hud-key">R</span> — reset camera</li>
                <li>🕹️ The ferris wheel hides an arcade with 4 mini-games</li>
                <li>❔ You can also click the floating ? badges</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
