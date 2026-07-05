import { profile } from '../data/content';

export default function Intro({ isTouch, onStart }) {
  return (
    <div className="intro-backdrop z-50">
      <div className="intro-card">
        <div className="text-6xl mb-2 intro-wheel">🎡</div>
        <p className="text-sm font-bold tracking-[0.3em] text-white-500 uppercase">Welcome to</p>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-1">
          {profile.name}&apos;s <span className="text-park">Park</span>
        </h1>
        <p className="text-white-600 mt-3 max-w-sm mx-auto">
          {profile.tagline}. Take a stroll through my little theme park — each attraction is a part of my
          portfolio.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-5 text-sm text-white-600">
          {isTouch ? (
            <>
              <span className="chip">👆 Left: walk</span>
              <span className="chip">🔄 Right: look</span>
              <span className="chip">⤴ Jump</span>
            </>
          ) : (
            <>
              <span className="chip">⌨️ WASD to walk</span>
              <span className="chip">🖱️ Mouse looks around</span>
              <span className="chip">
                <span className="hud-key mr-1">Space</span> jump
              </span>
              <span className="chip">
                <span className="hud-key mr-1">E</span> open attractions
              </span>
            </>
          )}
        </div>
        <button className="start-btn mt-7" onClick={onStart}>
          Enter the park →
        </button>
      </div>
    </div>
  );
}
