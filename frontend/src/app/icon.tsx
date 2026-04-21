import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(to bottom right, #facc15, #f59e0b)', // yellow-400 to amber-500
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a', // slate-900
          borderRadius: '8px',
          fontWeight: 900,
        }}
      >
        U
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
