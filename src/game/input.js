// ---------------------------------------------------------------------------
// Shared input state. The keyboard listeners and the touch joystick both
// write into this plain object; the Player reads it every frame. Keeping it
// outside React avoids re-renders on every keypress / joystick move.
// ---------------------------------------------------------------------------

export const input = {
  keys: { up: false, down: false, left: false, right: false },
  // Joystick vector, already normalised to length <= 1. x: right, y: down(screen) -> south(+Z)
  joystick: { active: false, x: 0, y: 0 },
  enabled: true, // false while a panel / intro is open
  jumpQueued: false, // set by Space / the mobile jump button, consumed by Player
  // Orbit camera target state (the Player damps the real camera toward it).
  // yaw 0 = camera south of the player looking north.
  cam: { yaw: 0, elev: 0.72, dist: 16 },
};

export function queueJump() {
  if (input.enabled) input.jumpQueued = true;
}

export const CAM_LIMITS = { elevMin: 0.25, elevMax: 1.2, distMin: 9, distMax: 26 };

// Default framing per device — also used by the "Reset camera" button.
export function resetCam(isTouch) {
  input.cam.yaw = 0;
  input.cam.elev = isTouch ? 0.78 : 0.72;
  input.cam.dist = isTouch ? 18.5 : 16;
}

export function rotateCam(dx, dy) {
  if (!input.enabled) return;
  const c = input.cam;
  c.yaw += dx;
  c.elev = Math.min(CAM_LIMITS.elevMax, Math.max(CAM_LIMITS.elevMin, c.elev + dy));
}

export function zoomCam(delta) {
  const c = input.cam;
  c.dist = Math.min(CAM_LIMITS.distMax, Math.max(CAM_LIMITS.distMin, c.dist + delta));
}

// --- Desktop mouse camera -------------------------------------------------
// Game-style: the pointer locks to the canvas and the mouse steers the view
// directly (mouse right = look right), like PUBG/Fortnite third person.
// When the pointer is NOT locked (user pressed Esc, or the browser refused),
// dragging on the canvas still orbits as a fallback, and clicking the canvas
// re-captures the mouse.

export function isPointerLocked() {
  return !!document.pointerLockElement;
}

// Request pointer lock on the game canvas. Must be called from a user
// gesture; failures are fine — the drag fallback keeps working.
export function lockPointer() {
  const canvas = document.querySelector('.game-root canvas');
  if (!canvas || document.pointerLockElement === canvas) return;
  try {
    const p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(() => {});
  } catch {
    /* unsupported — drag fallback remains */
  }
}

export function unlockPointer() {
  if (document.pointerLockElement) document.exitPointerLock();
}

export function installMouseCam(onLockChange) {
  const isCanvas = (e) => e.target?.tagName === 'CANVAS';
  let dragging = false;

  const lockChange = () => onLockChange?.(isPointerLocked());

  const down = (e) => {
    if (!isCanvas(e) || (e.button !== 0 && e.button !== 2)) return;
    if (!isPointerLocked()) {
      // Clicking the world re-captures the mouse (game convention)…
      if (input.enabled) lockPointer();
      // …and still allows drag-orbiting until the lock engages.
      dragging = true;
    }
  };
  const move = (e) => {
    if (isPointerLocked()) {
      // Steer-the-view mode: mouse right = turn right, mouse down = camera up.
      rotateCam(-e.movementX * 0.0032, e.movementY * 0.0026);
      return;
    }
    if (!dragging) return;
    if (e.buttons === 0) {
      dragging = false; // button released outside the window
      return;
    }
    rotateCam(e.movementX * 0.005, -e.movementY * 0.004);
  };
  const up = () => {
    dragging = false;
  };
  const wheel = (e) => {
    if (!isCanvas(e) && !isPointerLocked()) return;
    zoomCam(e.deltaY * 0.012);
  };
  const ctx = (e) => {
    if (isCanvas(e)) e.preventDefault();
  };

  window.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('wheel', wheel, { passive: true });
  window.addEventListener('contextmenu', ctx);
  document.addEventListener('pointerlockchange', lockChange);
  return () => {
    window.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('contextmenu', ctx);
    document.removeEventListener('pointerlockchange', lockChange);
  };
}

// Returns the current movement vector { x, z } with length <= 1.
export function readMoveVector(out) {
  if (!input.enabled) {
    out.x = 0;
    out.z = 0;
    return out;
  }
  if (input.joystick.active) {
    out.x = input.joystick.x;
    out.z = input.joystick.y;
    return out;
  }
  const k = input.keys;
  let x = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  let z = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (x !== 0 && z !== 0) {
    const inv = 1 / Math.sqrt(2);
    x *= inv;
    z *= inv;
  }
  out.x = x;
  out.z = z;
  return out;
}

const KEYMAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

// Installs global keyboard listeners. `onAction(action)` receives
// 'interact' (E / Enter / Space) and 'close' (Escape).
export function installKeyboard(onAction) {
  const down = (e) => {
    // Don't steal keys while the user types in the contact form.
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const dir = KEYMAP[e.code];
    if (dir) {
      input.keys[dir] = true;
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyE' || e.code === 'Enter') {
      onAction('interact');
      e.preventDefault();
    } else if (e.code === 'Space') {
      queueJump();
      e.preventDefault();
    } else if (e.code === 'Escape') {
      onAction('close');
    } else if (e.code === 'KeyM') {
      onAction('map');
    } else if (e.code === 'KeyH') {
      onAction('help');
    } else if (e.code === 'KeyR') {
      onAction('resetcam');
    }
  };
  const up = (e) => {
    const dir = KEYMAP[e.code];
    if (dir) input.keys[dir] = false;
  };
  const blur = () => {
    input.keys.up = input.keys.down = input.keys.left = input.keys.right = false;
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', blur);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', blur);
  };
}
