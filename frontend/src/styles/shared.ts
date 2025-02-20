export const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#161616',
    padding: '20px',
    zIndex: 1000,
    border: '1px solid black',
  },
  // ... other shared styles
} as const;
