import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useMediaQuery } from 'react-responsive';

import World from './game/World';
import FerrisWheel from './game/FerrisWheel';
import Booths from './game/Booths';
import Player from './game/Player';
import { input, installKeyboard, installMouseCam, lockPointer, unlockPointer, resetCam } from './game/input';
import { audio } from './game/audio';

import Intro from './ui/Intro';
import HUD from './ui/HUD';
import TouchControls from './ui/TouchControls';
import Panel from './ui/Panels';
import { sectionsForProgress } from './data/content';

const HORIZON = '#f3ecd8'; // matches the sky-dome horizon stop

export default function App() {
  const isTouch = useMediaQuery({ query: '(pointer: coarse)' });

  const [started, setStarted] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [panel, setPanel] = useState(null); // { type, projectIndex }
  const [mapOpen, setMapOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [soundState, setSoundState] = useState({ music: audio.music, sfx: audio.sfx });
  const [visited, setVisited] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('park-visited') || '[]'));
    } catch {
      return new Set();
    }
  });

  const teleportRef = useRef(null);
  const zoneRef = useRef(null);
  const panelRef = useRef(null);
  const modalRef = useRef(false);
  const isTouchRef = useRef(isTouch);
  zoneRef.current = activeZone;
  panelRef.current = panel;
  modalRef.current = !!panel || mapOpen || helpOpen;
  isTouchRef.current = isTouch;

  // Player input is paused while the intro or any modal is up.
  useEffect(() => {
    input.enabled = started && !panel && !mapOpen && !helpOpen;
  }, [started, panel, mapOpen, helpOpen]);

  const openZone = (zone) => {
    if (!zone) return;
    unlockPointer(); // give the cursor back for the panel
    audio.pop();
    setPanel({ type: zone.panel, projectIndex: zone.projectIndex ?? 0 });
    setVisited((prev) => {
      if (prev.has(zone.panel)) return prev;
      const next = new Set(prev);
      next.add(zone.panel);
      localStorage.setItem('park-visited', JSON.stringify([...next]));
      if (next.size === sectionsForProgress.length && prev.size < sectionsForProgress.length) {
        audio.tada();
        setToast("🎉 You've explored the whole park — let's build something together!");
        setTimeout(() => setToast(null), 5000);
      }
      return next;
    });
  };

  const closePanel = () => {
    audio.close();
    setPanel(null);
    if (!isTouchRef.current) lockPointer();
  };

  const start = () => {
    setStarted(true);
    audio.init();
    if (!isTouch) lockPointer();
  };

  useEffect(() => {
    const removeKeys = installKeyboard((action) => {
      if (action === 'interact' && !modalRef.current && zoneRef.current) {
        openZone(zoneRef.current);
      } else if (action === 'close') {
        if (panelRef.current) closePanel();
        setMapOpen(false);
        setHelpOpen(false);
      } else if (action === 'map' && !panelRef.current) {
        unlockPointer();
        setHelpOpen(false);
        setMapOpen((v) => !v);
      } else if (action === 'help' && !panelRef.current) {
        unlockPointer();
        setMapOpen(false);
        setHelpOpen((v) => !v);
      } else if (action === 'resetcam') {
        resetCam(isTouchRef.current);
      }
    });
    const removeMouseCam = installMouseCam(setLocked);
    return () => {
      removeKeys();
      removeMouseCam();
    };
  }, []);

  return (
    <div className="game-root">
      <Canvas
        flat
        shadows={!isTouch}
        dpr={isTouch ? [1, 1.5] : [1, 2]}
        camera={{ fov: 50, near: 0.5, far: 140, position: [0, 17, 34] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[HORIZON]} />
        <fog attach="fog" args={[HORIZON, 55, 120]} />

        {/* flat (no tone mapping) keeps cartoon colors punchy, so lights are
            dialled down to avoid blowing out the whites */}
        <hemisphereLight args={['#cde9ff', '#8fbf6a', 0.75]} />
        <directionalLight
          position={[18, 30, 14]}
          intensity={1.15}
          color="#fff2d9"
          castShadow={!isTouch}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
          shadow-camera-far={90}
          shadow-bias={-0.0004}
        />

        <World />
        <FerrisWheel />
        <Player started={started} isTouch={isTouch} onZoneChange={setActiveZone} teleportRef={teleportRef} />
        {/* Only the booths suspend (tech-icon textures) — the rest of the
            park renders instantly. */}
        <Suspense fallback={null}>
          <Booths onZoneOpen={(zone) => !modalRef.current && openZone(zone)} visited={visited} />
        </Suspense>
      </Canvas>

      {/* Subtle vignette for that game-screen feel */}
      <div className="vignette" />

      {/* Touch layer (joystick + camera drag) sits above the canvas, below the HUD */}
      {started && isTouch && !panel && !mapOpen && !helpOpen && <TouchControls />}

      <HUD
        started={started}
        isTouch={isTouch}
        locked={locked}
        activeZone={activeZone}
        visited={visited}
        panelOpen={!!panel}
        mapOpen={mapOpen}
        helpOpen={helpOpen}
        soundState={soundState}
        onToggleMusic={() => {
          audio.setMusic(!audio.music);
          setSoundState({ music: audio.music, sfx: audio.sfx });
        }}
        onToggleSfx={() => {
          audio.setSfx(!audio.sfx);
          setSoundState({ music: audio.music, sfx: audio.sfx });
        }}
        onSetMap={(v) => {
          if (v) unlockPointer();
          else if (!isTouch) lockPointer();
          setMapOpen(v);
        }}
        onSetHelp={(v) => {
          if (v) unlockPointer();
          else if (!isTouch) lockPointer();
          setHelpOpen(v);
        }}
        onInteract={() => openZone(zoneRef.current)}
        onTeleport={(spot) => {
          audio.whoosh();
          teleportRef.current = { x: spot.x, z: spot.z };
          setPanel(null);
        }}
        onResetCam={() => resetCam(isTouch)}
      />

      <Panel panel={panel} onClose={closePanel} />

      {toast && <div className="toast">{toast}</div>}

      {!started && <Intro isTouch={isTouch} onStart={start} />}
    </div>
  );
}
