// server.js – wrapper for Render to load the ESM server
// This file runs in CommonJS mode and dynamically imports the actual server written in ESM.
import('./server.mjs').catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});