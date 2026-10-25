const viewer = document.getElementById('model-viewer');
// Expand the task viewer without leaving the research page where supported.
viewer.addEventListener('load', () => { viewer.dataset.loaded = 'true'; });
