import { useEffect, useRef } from 'react';
import { input, rotateCam } from '../game/input';

const RADIUS = 52; // px travel of the knob
const JOY_ZONE = 0.55; // left fraction of the screen that spawns the joystick

// Touch controls, mobile-game style: a floating joystick appears where you
// touch on the LEFT side of the screen; dragging on the RIGHT side orbits
// the camera. Both can be used at the same time (two fingers). Everything
// writes straight into the shared input object and moves the knob via style
// transforms — no per-frame React renders.
export default function TouchControls() {
  const layer = useRef();
  const base = useRef();
  const knob = useRef();
  const state = useRef({ joyId: null, camId: null, ox: 0, oy: 0, cx: 0, cy: 0 });

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    const s = state.current;

    const resetJoy = () => {
      s.joyId = null;
      input.joystick.active = false;
      input.joystick.x = 0;
      input.joystick.y = 0;
      if (base.current) base.current.style.opacity = '0';
      if (knob.current) knob.current.style.transform = 'translate(-50%, -50%)';
    };

    const down = (e) => {
      if (e.clientX < window.innerWidth * JOY_ZONE && s.joyId === null) {
        s.joyId = e.pointerId;
        s.ox = e.clientX;
        s.oy = e.clientY;
        el.setPointerCapture(e.pointerId);
        if (base.current) {
          base.current.style.left = `${e.clientX}px`;
          base.current.style.top = `${e.clientY}px`;
          base.current.style.opacity = '1';
        }
        input.joystick.active = true;
      } else if (s.camId === null) {
        s.camId = e.pointerId;
        s.cx = e.clientX;
        s.cy = e.clientY;
        el.setPointerCapture(e.pointerId);
      }
    };

    const move = (e) => {
      if (e.pointerId === s.joyId) {
        let dx = e.clientX - s.ox;
        let dy = e.clientY - s.oy;
        const len = Math.hypot(dx, dy);
        if (len > RADIUS) {
          dx = (dx / len) * RADIUS;
          dy = (dy / len) * RADIUS;
        }
        input.joystick.x = dx / RADIUS;
        input.joystick.y = dy / RADIUS;
        if (knob.current) {
          knob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        }
      } else if (e.pointerId === s.camId) {
        rotateCam((e.clientX - s.cx) * 0.008, -(e.clientY - s.cy) * 0.006);
        s.cx = e.clientX;
        s.cy = e.clientY;
      }
    };

    const up = (e) => {
      if (e.pointerId === s.joyId) resetJoy();
      else if (e.pointerId === s.camId) s.camId = null;
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      resetJoy();
      s.camId = null;
    };
  }, []);

  return (
    <div ref={layer} className="joy-layer">
      <div ref={base} className="joy-base">
        <div ref={knob} className="joy-knob" />
      </div>
    </div>
  );
}
