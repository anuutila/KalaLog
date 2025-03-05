export default function ConfettiEffect() {
  return (
    <>
      <div
        id="tsparticles1"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 500,
        }}
      />
      <div
        id="tsparticles2"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 300,
        }}
      />
    </>
  );
};