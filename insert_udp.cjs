const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const funcToAdd = `
        function updateDashboardPanel(tIndex) {
            const bState = trackBanks[tIndex]; const msState = trackStates[tIndex];
            const nameEl = document.getElementById(\`dash-name-\${tIndex}\`);
            if (nameEl) nameEl.textContent = getSoundCategoryName(bState.msb, bState.lsb, bState.pc, tIndex);
            
            const btnMute = document.getElementById(\`btn-mute-\${tIndex}\`);
            const btnSolo = document.getElementById(\`btn-solo-\${tIndex}\`);
            if (btnMute) btnMute.className = \`btn-ms mute \${msState.mute ? 'active' : ''}\`;
            if (btnSolo) btnSolo.className = \`btn-ms solo \${msState.solo ? 'active' : ''}\`;

            updateKnobVisual(tIndex);

            const panel = document.getElementById(\`dash-panel-\${tIndex}\`);
            if(panel) {
                panel.className = \`dash-panel \${selectedTrackIds.has(tIndex) ? (currentTrackId === tIndex ? 'primary active' : 'active') : ''}\`;
                setTrackColor(panel, tIndex);
            }
        }
`;

html = html.replace('function startKnobDrag', funcToAdd + '\n        function startKnobDrag');
fs.writeFileSync('index.html', html);
console.log('Inserted updateDashboardPanel successfully!');
