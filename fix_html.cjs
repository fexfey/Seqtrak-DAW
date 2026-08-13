const fs = require('fs');
let content = fs.readFileSync('src/original_ui.html', 'utf8');

// Fix 1: Add missing variable `lastHardwareNotes`
content = content.replace('let dawTriggeredNotes = {};', 'let dawTriggeredNotes = {};\n        let lastHardwareNotes = {};');

// Fix 2: Fix bug with showInspector call (was incorrectly called as renderInspector({note:...}))
content = content.replace('renderInspector({note: lockedNoteForPLock, track: currentTrackId});', 'showInspector(lockedNoteForPLock, currentTrackId);');

// Fix 3: Safe toFixed calls to prevent "Cannot read properties of undefined (reading 'toFixed')"
content = content.replace(/\$\{noteObj\.startBeat\.toFixed\(2\)\}/g, '${(noteObj.startBeat || 0).toFixed(2)}');
content = content.replace(/\$\{noteObj\.durationBeat\.toFixed\(2\)\}/g, '${(noteObj.durationBeat || 0).toFixed(2)}');

fs.writeFileSync('index.html', content);
