import { ImageResponse } from 'next/og';

export const alt = 'Olevium — Organizá tus finanzas personales';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const manropeBold = await fetch(
    new URL('https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggqxSuXd.woff2')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: 'rgb(7, 15, 38)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Manrope',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient orb top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Gradient orb bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: '#10b981',
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}
        >
          Olevium
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: 24,
            letterSpacing: '0.01em',
          }}
        >
          Organizá tus finanzas personales
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 16,
          }}
        >
          Sin planillas. Sin complicaciones. Tu asistente financiero.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Manrope',
          data: manropeBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
