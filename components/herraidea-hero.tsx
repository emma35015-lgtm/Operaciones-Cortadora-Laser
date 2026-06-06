'use client'
import Image from 'next/image'

export default function HerraideaHero() {
  return (
    <>
      <style>{`
        .herr-hero {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(120% 100% at 50% 0%, #20252c 0%, #14171c 50%, #0b0d10 100%);
          overflow: hidden;
          font-family: "Helvetica Neue", Arial, sans-serif;
        }
        .herr-glass {
          position: absolute;
          inset: 0;
          display: flex;
        }
        .herr-glass span {
          flex: 1;
          position: relative;
          background: linear-gradient(115deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.015) 38%, rgba(255,255,255,0) 60%);
          border-right: 1px solid rgba(255,255,255,.10);
          box-shadow: inset 1px 0 0 rgba(255,255,255,.05);
        }
        .herr-glass span::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 2px;
          background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%);
        }
        .herr-glare {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(120deg, transparent 34%, rgba(255,255,255,.08) 50%, transparent 64%);
          background-size: 240% 100%;
          animation: herrSheen 11s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes herrSheen {
          0% { background-position: 140% 0 }
          60%, 100% { background-position: -60% 0 }
        }
        .herr-floor {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 34%;
          z-index: 1;
          background: linear-gradient(180deg, transparent, rgba(0,0,0,.55));
        }
        .herr-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: radial-gradient(72% 64% at 50% 46%, transparent 54%, rgba(0,0,0,.5) 100%);
        }
        .herr-badge {
          position: absolute;
          top: clamp(22px, 4vh, 42px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          color: #aeb4bd;
          font-size: clamp(11px, .92vw, 13px);
          font-weight: 600;
          letter-spacing: .32em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: .9ch;
          opacity: .78;
          animation: herrRiseX 1s ease .5s both;
          white-space: nowrap;
        }
        .herr-badge i {
          width: 6px;
          height: 6px;
          background: #ED2D39;
          transform: rotate(45deg);
          display: inline-block;
        }
        @keyframes herrRiseX {
          from { opacity: 0; transform: translate(-50%, 16px) }
          to   { opacity: .78; transform: translate(-50%, 0) }
        }
        .herr-stage {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6vw;
        }
        .herr-logo-wrap {
          position: relative;
          display: inline-block;
          line-height: 0;
          filter: drop-shadow(0 24px 56px rgba(0,0,0,.6));
          animation: herrRise 1s cubic-bezier(.2,.7,.2,1) both;
        }
        .herr-logo {
          width: clamp(260px, 44vw, 620px);
          height: auto;
          display: block;
        }
        .herr-idot {
          position: absolute;
          left: 61.83%;
          top: 23.85%;
          width: 2.77%;
          aspect-ratio: 17/13;
          background: #ED2D39;
          border-radius: 1px;
          transform: translate(-50%, -50%);
          transform-origin: 50% 100%;
          animation: herrHop 3.2s cubic-bezier(.3,.7,.3,1) 1.2s infinite;
        }
        @keyframes herrHop {
          0%,52%,100% { transform: translate(-50%,-50%) scale(1,1); }
          62%          { transform: translate(-50%,-240%) scale(.94,1.12); }
          72%          { transform: translate(-50%,-50%) scale(1.18,.8); }
          80%          { transform: translate(-50%,-78%) scale(.97,1.05); }
          88%          { transform: translate(-50%,-50%) scale(1,1); }
        }
        .herr-tagline {
          margin-top: clamp(20px, 3.2vh, 38px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .3ch;
          color: #e8eaee;
          font-size: clamp(14px, 1.6vw, 24px);
          font-weight: 300;
          text-align: center;
          animation: herrRise 1s cubic-bezier(.2,.7,.2,1) .25s both;
        }
        @media (min-width: 640px) {
          .herr-tagline {
            flex-direction: row;
            gap: .5ch;
          }
        }
        .herr-tagline .lead { opacity: .85; }
        .herr-rotator {
          position: relative;
          display: inline-block;
          height: 1.3em;
          overflow: hidden;
          vertical-align: bottom;
          min-width: 10ch;
          text-align: left;
        }
        .herr-rotator ul {
          list-style: none;
          animation: herrSpin 9s cubic-bezier(.8,0,.2,1) infinite;
        }
        .herr-rotator li {
          height: 1.3em;
          line-height: 1.3em;
          color: #ED2D39;
          font-weight: 700;
          letter-spacing: .02em;
        }
        @keyframes herrSpin {
          0%,15%  { transform: translateY(0) }
          20%,33% { transform: translateY(-1.3em) }
          38%,51% { transform: translateY(-2.6em) }
          56%,69% { transform: translateY(-3.9em) }
          74%,87% { transform: translateY(-5.2em) }
          92%,100%{ transform: translateY(0) }
        }
        .herr-marquee {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 5;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.3);
          backdrop-filter: blur(2px);
        }
        .herr-track {
          display: flex;
          width: max-content;
          animation: herrMarquee 26s linear infinite;
        }
        .herr-track .cell {
          display: flex;
          align-items: center;
          padding: 16px 0;
          color: #aeb4bd;
          font-size: clamp(11px, .95vw, 14px);
          font-weight: 600;
          letter-spacing: .30em;
          text-transform: uppercase;
        }
        .herr-track .chev {
          color: #ED2D39;
          font-weight: 800;
          margin: 0 2ch;
        }
        @keyframes herrMarquee { to { transform: translateX(-50%); } }
        @keyframes herrRise {
          from { opacity: 0; transform: translateY(16px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          .herr-glare, .herr-track, .herr-rotator ul,
          .herr-logo-wrap, .herr-tagline, .herr-badge, .herr-idot {
            animation: none;
          }
        }
      `}</style>

      <section className="herr-hero">
        <div className="herr-glass" aria-hidden="true">
          <span /><span /><span /><span /><span /><span /><span />
        </div>
        <div className="herr-glare" aria-hidden="true" />
        <div className="herr-floor" aria-hidden="true" />
        <div className="herr-vignette" aria-hidden="true" />

        <div className="herr-badge">
          <i />
          Empresa 100% Mexicana · León, Gto.
        </div>

        <div className="herr-stage">
          <span className="herr-logo-wrap">
            <Image
              className="herr-logo"
              src="/herraidea-logo-nodot.png"
              alt="Herraidea"
              width={613}
              height={109}
              priority
            />
            <span className="herr-idot" aria-hidden="true" />
          </span>
          <div className="herr-tagline">
            <span className="lead">Herrajes en acero inoxidable para</span>
            <span className="herr-rotator">
              <ul>
                <li>cristal templado</li>
                <li>barandales</li>
                <li>fachadas</li>
                <li>construcción</li>
                <li>cristal templado</li>
              </ul>
            </span>
          </div>
        </div>

        <div className="herr-marquee" aria-hidden="true">
          <div className="herr-track">
            <div className="cell">Pipetas<span className="chev">›</span>Postes<span className="chev">›</span>Conectores<span className="chev">›</span>Jaladeras<span className="chev">›</span>Acero Inoxidable</div>
            <div className="cell">Pipetas<span className="chev">›</span>Postes<span className="chev">›</span>Conectores<span className="chev">›</span>Jaladeras<span className="chev">›</span>Acero Inoxidable</div>
          </div>
        </div>
      </section>
    </>
  )
}
