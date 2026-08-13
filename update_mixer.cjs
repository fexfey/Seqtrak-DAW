const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update CSS for 2-column Dashboard & Knob Layout
const newCSS = `
        .right-sidebar { 
            width: 440px; background: rgba(255,255,255,0.95); border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; 
            display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; box-shadow: 0 8px 30px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
        }
        .sidebar-title { margin: 0 0 10px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; text-align: center; display: flex; flex-direction: column; align-items: center;}
        
        .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        
        .dash-panel { 
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; 
            border-left: 5px solid var(--track-color); position: relative; cursor: pointer; transition: 0.15s;
            display: flex; flex-direction: column; gap: 6px;
        }
        .dash-panel:hover { background: #f1f5f9; }
        .dash-panel.active { background: #ffffff; box-shadow: 0 0 0 2px var(--track-color), 0 4px 12px rgba(0,0,0,0.06); border-color: transparent; }
        
        .dash-info { display: flex; flex-direction: column; gap: 4px;}
        .dash-header { display: flex; justify-content: space-between; align-items: center;}
        .dash-title-box { display: flex; flex-direction: column;}
        .dash-title-box .jp-lg { font-size: 0.75rem;}
        
        .dash-sound { background: #1e293b; color: #10b981; padding: 3px 6px; border-radius: 4px; font-family: 'Inter', monospace; font-size: 0.6rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; letter-spacing: 0.3px;}
        
        .ms-controls { display: flex; gap: 4px;}
        .btn-ms { width: 22px; height: 22px; border: 1px solid #cbd5e1; background: #f1f5f9; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; transition: 0.1s;}
        .btn-ms:hover { background: #e2e8f0; }
        .btn-ms.mute.active { background: #ef4444; border-color: #ef4444; }
        .btn-ms.solo.active { background: #f59e0b; border-color: #f59e0b; }
        .btn-ms.active .en-sm { color: #fff;}
        .btn-ms .en-sm { font-size: 0.5rem; margin: 0; }

        .knobs-row { display: flex; justify-content: space-around; border-top: 1px dashed #e2e8f0; padding-top: 6px; gap: 2px; }
        .knob-unit { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .knob-lbl { font-size: 0.5rem; font-weight: 700; color: #64748b; }
        .knob-val { font-size: 0.55rem; font-weight: bold; font-family: monospace; color: #0f172a; background: #e2e8f0; padding: 1px 3px; border-radius: 3px; min-width: 24px; text-align: center; }
        .knob { width: 28px; height: 28px; border-radius: 50%; background: #334155; position: relative; border: 2px solid #94a3b8; cursor: ns-resize; }
        .knob-ptr { width: 2px; height: 10px; background: #f36822; position: absolute; top: 2px; left: 11px; transform-origin: bottom center; border-radius: 1px; }
`;

html = html.replace(/\.right-sidebar[\s\S]*?\.knob-ptr[\s\S]*?\}/, newCSS.trim());

// 2. Update initUI() to render 3 knobs: VOL, PAN, PITCH
const newPanelHTML = `p.innerHTML = \`
                    <div class="dash-info">
                        <div class="dash-header">
                            <div class="dash-title-box"><span class="jp-lg">\${t.jp}</span><span class="en-sm">CH \${t.ch} | \${t.name}</span></div>
                            <div class="ms-controls">
                                <button class="btn-ms mute" id="btn-mute-\${t.id}" onclick="event.stopPropagation(); toggleMuteUI(\${t.id})"><span class="en-sm">M</span></button>
                                <button class="btn-ms solo" id="btn-solo-\${t.id}" onclick="event.stopPropagation(); toggleSoloUI(\${t.id})"><span class="en-sm">S</span></button>
                            </div>
                        </div>
                        <div class="dash-sound" id="dash-name-\${t.id}">...</div>
                    </div>
                    <div class="knobs-row">
                        <div class="knob-unit">
                            <span class="knob-lbl">VOL</span>
                            <div class="knob" onmousedown="startKnobDrag(event, \${t.id}, 'volume')">
                                <div class="knob-ptr" id="knob-vol-\${t.id}"></div>
                            </div>
                            <span class="knob-val" id="val-vol-\${t.id}">100</span>
                        </div>
                        <div class="knob-unit">
                            <span class="knob-lbl">PAN</span>
                            <div class="knob" onmousedown="startKnobDrag(event, \${t.id}, 'pan')">
                                <div class="knob-ptr" id="knob-pan-\${t.id}"></div>
                            </div>
                            <span class="knob-val" id="val-pan-\${t.id}">C</span>
                        </div>
                        <div class="knob-unit">
                            <span class="knob-lbl">PITCH</span>
                            <div class="knob" onmousedown="startKnobDrag(event, \${t.id}, 'pitch')">
                                <div class="knob-ptr" id="knob-pitch-\${t.id}"></div>
                            </div>
                            <span class="knob-val" id="val-pitch-\${t.id}">0</span>
                        </div>
                    </div>
                \`;`;

html = html.replace(/p\.innerHTML = `[\s\S]*?`;\s*dashboard\.appendChild\(p\);/, newPanelHTML + "\n                dashboard.appendChild(p);");

// 3. Update updateKnobVisual & handlers for VOL, PAN, PITCH
const newKnobHandlers = `
        function updateKnobVisual(tIndex) {
            let st = trackStates[tIndex];
            
            let volPtr = document.getElementById(\`knob-vol-\${tIndex}\`);
            let volVal = document.getElementById(\`val-vol-\${tIndex}\`);
            if (volPtr) volPtr.style.transform = \`rotate(\${-135 + (st.volume / 127) * 270}deg)\`;
            if (volVal) volVal.textContent = st.volume;

            let panPtr = document.getElementById(\`knob-pan-\${tIndex}\`);
            let panVal = document.getElementById(\`val-pan-\${tIndex}\`);
            if (panPtr) panPtr.style.transform = \`rotate(\${-135 + (st.pan / 127) * 270}deg)\`;
            if (panVal) {
                let p = st.pan - 64;
                panVal.textContent = p === 0 ? 'C' : (p < 0 ? 'L' + Math.abs(p) : 'R' + p);
            }

            let pitchPtr = document.getElementById(\`knob-pitch-\${tIndex}\`);
            let pitchVal = document.getElementById(\`val-pitch-\${tIndex}\`);
            if (pitchPtr) pitchPtr.style.transform = \`rotate(\${-135 + (st.pitch / 127) * 270}deg)\`;
            if (pitchVal) {
                let pit = st.pitch - 64;
                pitchVal.textContent = pit > 0 ? '+' + pit : pit;
            }
        }

        let activeKnob = null;
        function startKnobDrag(e, tIndex, param) {
            e.stopPropagation();
            activeKnob = { id: tIndex, param: param, startY: e.clientY, startVal: trackStates[tIndex][param] };
            window.addEventListener('mousemove', onKnobDrag);
            window.addEventListener('mouseup', onKnobRelease);
        }
        function onKnobDrag(e) {
            if(!activeKnob) return;
            let deltaY = activeKnob.startY - e.clientY;
            let newVal = Math.max(0, Math.min(127, activeKnob.startVal + deltaY));
            
            let targetTracks = selectedTrackIds.has(activeKnob.id) ? Array.from(selectedTrackIds) : [activeKnob.id];
            
            targetTracks.forEach(id => {
                trackStates[id][activeKnob.param] = newVal;
                if (midiOutput) {
                    if (activeKnob.param === 'volume') midiOutput.send([0xB0 + id, 7, newVal]);
                    if (activeKnob.param === 'pan') midiOutput.send([0xB0 + id, 10, newVal]);
                    if (activeKnob.param === 'pitch') midiOutput.send([0xB0 + id, 25, newVal]); // CC 25: Drum/Synth Pitch
                }
                updateDashboardPanel(id);
            });
        }
        function onKnobRelease() {
            window.removeEventListener('mousemove', onKnobDrag);
            window.removeEventListener('mouseup', onKnobRelease);
            activeKnob = null;
        }
`;

html = html.replace(/function updateKnobVisual[\s\S]*?function onKnobRelease\(\) \{[\s\S]*?\}/, newKnobHandlers.trim());

fs.writeFileSync('index.html', html);
