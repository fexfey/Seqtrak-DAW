const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace switchTrack body to remove any SysEx or CC solo command when switching tracks
const oldSwitchTrack = /function switchTrack\(trackId, e\) \{[\s\S]*?\n        \}/;
const newSwitchTrack = `function switchTrack(trackId, e) {
            if (e && (e.ctrlKey || e.metaKey)) {
                if (selectedTrackIds.has(trackId)) {
                    if (selectedTrackIds.size > 1) { selectedTrackIds.delete(trackId); currentTrackId = Array.from(selectedTrackIds).pop(); }
                } else { selectedTrackIds.add(trackId); currentTrackId = trackId; }
            } else {
                selectedTrackIds.clear(); selectedTrackIds.add(trackId); currentTrackId = trackId;
            }
            
            document.querySelectorAll('.track-tab').forEach((tab, i) => {
                tab.className = \`track-tab \${selectedTrackIds.has(i) ? (currentTrackId === i ? 'active' : 'selected') : ''}\`;
            });
            for(let i=0; i<11; i++) updateDashboardPanel(i);
            selectedNoteIds.clear();
            
            rebuildGridLines(); 
            renderNotes();
            logMessage("Track Switched -> CH " + (currentTrackId + 1));
        }`;

html = html.replace(oldSwitchTrack, newSwitchTrack);
fs.writeFileSync('index.html', html);
console.log('Fixed switchTrack successfully!');
