const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Web Audio Synth Engine implementation so sound ALWAYS plays in browser
const webAudioCode = `
        let audioCtx = null;
        function getAudioContext() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playWebAudioNote(tIndex, noteMidi, velocity = 100) {
            try {
                let ctx = getAudioContext();
                let osc = ctx.createOscillator();
                let gain = ctx.createGain();
                let panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

                // Pitch calculation
                let pitchShift = (trackStates[tIndex].pitch - 64) / 12; // Pitch knob shift in semitones
                let freq = 440 * Math.pow(2, (noteMidi + pitchShift - 69) / 12);
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                // Waveform selection
                if (tIndex <= 6) { // Drums
                    osc.type = tIndex === 0 ? 'sine' : (tIndex <= 2 ? 'triangle' : 'square');
                } else if (tIndex === 9) { // DX
                    osc.type = 'sawtooth';
                } else {
                    osc.type = 'sawtooth';
                }

                // Volume calculation
                let vol = ((trackStates[tIndex].volume / 127) * (velocity / 127) * 0.25);
                gain.gain.setValueAtTime(vol, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (tIndex <= 6 ? 0.2 : 0.4));

                // Pan calculation
                if (panner) {
                    let panVal = (trackStates[tIndex].pan - 64) / 64; // -1.0 to +1.0
                    panner.pan.setValueAtTime(panVal, ctx.currentTime);
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(ctx.destination);
                } else {
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                }

                osc.start();
                osc.stop(ctx.currentTime + (tIndex <= 6 ? 0.2 : 0.4));
            } catch(e) { console.error(e); }
        }
`;

// Insert webAudioCode before sendMidiOut
html = html.replace('function sendMidiOut(msg) {', webAudioCode + '\n        function sendMidiOut(msg) {');

// Update sendMidiOut to call playWebAudioNote on Note On (0x90)
html = html.replace(
    /function sendMidiOut\(msg\) \{[\s\S]*?midiOutput\.send\(msg\);\s*\}/,
    `function sendMidiOut(msg) {
            let type = msg[0] >> 4;
            let ch = msg[0] & 0x0F;
            if (type === 9 && msg[2] > 0) {
                playWebAudioNote(ch, msg[1], msg[2]);
            }
            if (!midiOutput) return;
            if (type === 9 || type === 8) dawTriggeredNotes[\`\${ch}-\${msg[1]}\`] = performance.now();
            midiOutput.send(msg);
        }`
);

// 2. Fix switchTrack (REMOVE the line that sends CC 24 = 127 on track switch)
html = html.replace(
    /midiOutput\.send\(\[0xB0 \+ currentTrackId, 24, 127\]\);/g,
    `// removed CC 24 sending on track switch to prevent accidental solo`
);

// 3. Fix getSoundCategoryName to provide accurate Category & Preset labels and default names when pc < 0
const newGetSoundCategoryName = `function getSoundCategoryName(msb, lsb, pc, tIndex) {
            const defaultNames = ["KICK", "SNARE", "CLAP", "HAT 1", "HAT 2", "PERC 1", "PERC 2", "SYNTH 1", "SYNTH 2", "DX", "SAMPLER"];
            if (pc < 0) return defaultNames[tIndex] || "TRACK " + (tIndex + 1); 
            let soundNum = (lsb * 128) + pc + 1;
            
            if (tIndex <= 6) { // Drums
                if (soundNum >= 1 && soundNum <= 112) return \`KICK: Kick \${soundNum}\`;
                if (soundNum <= 214) return \`SNARE: Snare \${soundNum - 112}\`;
                if (soundNum <= 248) return \`RIM: Rim \${soundNum - 214}\`;
                if (soundNum <= 296) return \`CLAP: Clap \${soundNum - 248}\`;
                if (soundNum <= 311) return \`SNAP: Snap \${soundNum - 296}\`;
                if (soundNum <= 384) return \`CLOSED HAT: Hat \${soundNum - 311}\`;
                if (soundNum <= 456) return \`OPEN HAT: Hat \${soundNum - 384}\`;
                if (soundNum <= 497) return \`SHAKER: Shaker \${soundNum - 456}\`;
                if (soundNum <= 527) return \`RIDE: Ride \${soundNum - 497}\`;
                if (soundNum <= 548) return \`CRASH: Crash \${soundNum - 527}\`;
                if (soundNum <= 618) return \`TOM: Tom \${soundNum - 548}\`;
                if (soundNum <= 650) return \`BELL: Bell \${soundNum - 618}\`;
                if (soundNum <= 676) return \`CONGA: Conga \${soundNum - 650}\`;
                if (soundNum <= 787) return \`WORLD: World \${soundNum - 676}\`;
                return \`SFX: SFX \${soundNum - 787}\`;
            } else if (tIndex === 7 || tIndex === 8) { // Synths
                if (soundNum >= 856 && soundNum <= 950) return \`BASS: Bass \${soundNum - 855}\`;
                if (soundNum <= 1102) return \`LEAD: Lead \${soundNum - 950}\`;
                if (soundNum <= 1134) return \`PIANO: Piano \${soundNum - 1102}\`;
                if (soundNum <= 1205) return \`KEYS: Keys \${soundNum - 1134}\`;
                if (soundNum <= 1289) return \`ORGAN: Organ \${soundNum - 1205}\`;
                if (soundNum <= 1438) return \`PAD: Pad \${soundNum - 1289}\`;
                if (soundNum <= 1516) return \`STRINGS: Strings \${soundNum - 1438}\`;
                if (soundNum <= 1589) return \`BRASS: Brass \${soundNum - 1516}\`;
                if (soundNum <= 1642) return \`WOODWIND: Woodwind \${soundNum - 1589}\`;
                if (soundNum <= 1738) return \`GUITAR: Guitar \${soundNum - 1642}\`;
                if (soundNum <= 1773) return \`WORLD: World \${soundNum - 1738}\`;
                if (soundNum <= 1793) return \`MALLET: Mallet \${soundNum - 1773}\`;
                if (soundNum <= 1827) return \`BELL: Bell \${soundNum - 1793}\`;
                if (soundNum <= 1891) return \`RHYTHMIC: Rhythmic \${soundNum - 1827}\`;
                return \`SFX: SFX \${soundNum - 1891}\`;
            } else if (tIndex === 9) { // DX
                if (soundNum >= 1933 && soundNum <= 1945) return \`FM BASS: Bass \${soundNum - 1932}\`;
                if (soundNum <= 1959) return \`FM LEAD: Lead \${soundNum - 1945}\`;
                if (soundNum <= 1963) return \`FM PIANO: Piano \${soundNum - 1959}\`;
                if (soundNum <= 1972) return \`FM KEYS: Keys \${soundNum - 1963}\`;
                if (soundNum <= 1975) return \`FM ORGAN: Organ \${soundNum - 1972}\`;
                if (soundNum <= 1991) return \`FM PAD: Pad \${soundNum - 1975}\`;
                if (soundNum <= 1993) return \`FM STRINGS: Strings \${soundNum - 1991}\`;
                if (soundNum <= 1999) return \`FM BRASS: Brass \${soundNum - 1993}\`;
                if (soundNum <= 2001) return \`FM WOODWIND: Woodwind \${soundNum - 1999}\`;
                if (soundNum <= 2006) return \`FM GUITAR: Guitar \${soundNum - 2001}\`;
                if (soundNum <= 2009) return \`FM WORLD: World \${soundNum - 2006}\`;
                if (soundNum <= 2012) return \`FM MALLET: Mallet \${soundNum - 2009}\`;
                if (soundNum <= 2015) return \`FM BELL: Bell \${soundNum - 2012}\`;
                if (soundNum <= 2029) return \`FM RHYTHMIC: Rhythmic \${soundNum - 2015}\`;
                return \`FM SFX: SFX \${soundNum - 2029}\`;
            } else { // Sampler
                if (soundNum >= 1 && soundNum <= 24) return \`COUNT: Voice \${soundNum}\`;
                if (soundNum <= 75) return \`CHANT: Chant \${soundNum - 24}\`;
                if (soundNum <= 98) return \`SINGING: Vocal \${soundNum - 75}\`;
                if (soundNum <= 119) return \`ROBOTIC: Robot \${soundNum - 98}\`;
                if (soundNum <= 136) return \`RISER: Riser \${soundNum - 119}\`;
                if (soundNum <= 186) return \`LASER: Laser \${soundNum - 136}\`;
                if (soundNum <= 208) return \`IMPACT: Impact \${soundNum - 186}\`;
                if (soundNum <= 242) return \`NOISE: Noise \${soundNum - 208}\`;
                if (soundNum <= 254) return \`AMBIENT: Ambient \${soundNum - 242}\`;
                if (soundNum <= 268) return \`SFX: SFX \${soundNum - 254}\`;
                if (soundNum <= 292) return \`SCRATCH: Scratch \${soundNum - 268}\`;
                if (soundNum <= 300) return \`ANIMALS: Animal \${soundNum - 292}\`;
                if (soundNum <= 319) return \`STAB: Hit/Stab \${soundNum - 300}\`;
                if (soundNum <= 390) return \`PERCUSSION: Perc \${soundNum - 319}\`;
                return \`SAMPLE: Rec \${soundNum - 390}\`;
            }
        }`;

html = html.replace(/function getSoundCategoryName\(msb, lsb, pc, tIndex\) \{[\s\S]*?\n        \}/, newGetSoundCategoryName);

// 4. Update handleMIDI to properly handle Pan (CC 10), Pitch (CC 25, 20, PitchBend), MSB (CC 0), LSB (CC 32), and remove spurious track switching on Note On / CC
const newHandleMIDI = `function handleMIDI(message) {
            const data = message.data; const command = data[0];
            
            if (command === 250 || command === 251) { startPlayback(true); return; } 
            if (command === 252) { stopPlayback(true); return; } 
            if (command === 248 || command === 254) return; 

            let bpm = parseInt(bpmInput.value) || 120;
            let currentAbsoluteBeat = (((performance.now() - playStartTime) / 60000) * bpm);

            const messageType = command >> 4;
            let channel = -1;
            if (messageType >= 8 && messageType <= 14) channel = command & 0x0F;
            
            if (messageType === 9 || messageType === 8) {
                let noteKey = \`\${channel}-\${data[1]}\`;
                if (dawTriggeredNotes[noteKey] && (performance.now() - dawTriggeredNotes[noteKey] < 200)) return; 
            }

            // SysEx смены каналов
            if (command === 240 && data[1] === 0x43 && data.length >= 11) {
                if (data[3] === 0x7F && data[4] === 0x1C && data[5] === 0x03 && data[6] === 0x00 && data[7] === 0x00 && data[8] === 0x00) {
                    let part = data[9];
                    if (part >= 0 && part <= 10 && currentTrackId !== part) switchTrack(part, null);
                }
            }

            if (messageType === 11) {
                const ccNumber = data[1];
                if (ccNumber === 23) { 
                    trackStates[channel].mute = (data[2] > 0); 
                    updateDashboardPanel(channel); 
                }
                else if (ccNumber === 24) { 
                    let isSoloOn = (data[2] > 0);
                    if (isSoloOn) trackStates.forEach(s => s.solo = false); 
                    trackStates[channel].solo = isSoloOn; 
                    updateDashboardPanel(channel); 
                }
                else if (ccNumber === 7) { 
                    trackStates[channel].volume = data[2]; 
                    updateDashboardPanel(channel); 
                }
                else if (ccNumber === 10) { // PAN
                    trackStates[channel].pan = data[2]; 
                    updateDashboardPanel(channel); 
                }
                else if (ccNumber === 25 || ccNumber === 20) { // PITCH
                    trackStates[channel].pitch = data[2]; 
                    updateDashboardPanel(channel); 
                }
                else if (ccNumber === 0) {
                    if (lockedNoteForPLock) lockedNoteForPLock.msb = data[2];
                    else trackBanks[channel].msb = data[2];
                    updateDashboardPanel(channel);
                }
                else if (ccNumber === 32) {
                    if (lockedNoteForPLock) lockedNoteForPLock.lsb = data[2];
                    else trackBanks[channel].lsb = data[2];
                    updateDashboardPanel(channel);
                }
            }
            else if (messageType === 14) { // Pitch Bend
                if (channel >= 0 && channel <= 10) {
                    trackStates[channel].pitch = data[2];
                    updateDashboardPanel(channel);
                }
            }
            else if (messageType === 12) { // Program Change
                if (lockedNoteForPLock) {
                    lockedNoteForPLock.pc = data[1];
                    showInspector(lockedNoteForPLock, currentTrackId);
                    renderNotes(); 
                } else {
                    trackBanks[channel].pc = data[1];
                    updateDashboardPanel(channel); 
                }
            }
            else if (messageType === 9 && data[2] > 0) {
                let noteKey = \`\${channel}-\${data[1]}\`;
                let now = performance.now();
                if (lastHardwareNotes[noteKey] && (now - lastHardwareNotes[noteKey] < 50)) return; 
                lastHardwareNotes[noteKey] = now;

                // Play Web Audio note directly when hardware triggers pad
                playWebAudioNote(channel, data[1], data[2]);

                let keyEl = document.getElementById(\`key-\${data[1]}\`);
                if (keyEl) keyEl.classList.add('playing');

                if (isRecording && isPlaying) {
                    let tLen = trackLengths[channel];
                    let tBeat = currentAbsoluteBeat % tLen;
                    const bState = trackBanks[channel];
                    
                    activeRecNotes[noteKey] = { 
                        id: Date.now() + Math.random(), 
                        pitchMidi: data[1], 
                        startBeat: applySnap(tBeat), 
                        durationBeat: 0.25, 
                        velocity: data[2],
                        msb: bState.msb,
                        lsb: bState.lsb,
                        pc: bState.pc
                    };
                }
            }
            else if ((messageType === 8 || (messageType === 9 && data[2] === 0))) {
                let noteKey = \`\${channel}-\${data[1]}\`;
                let keyEl = document.getElementById(\`key-\${data[1]}\`);
                if (keyEl) keyEl.classList.remove('playing');

                if (activeRecNotes[noteKey]) {
                    let recNote = activeRecNotes[noteKey];
                    let tLen = trackLengths[channel];
                    let rawDur = (currentAbsoluteBeat % tLen) - recNote.startBeat;
                    if (rawDur < 0) rawDur += tLen;
                    recNote.durationBeat = Math.max(0.25, applySnap(rawDur));
                    projectNotes[channel].push(recNote);
                    delete activeRecNotes[noteKey];
                    renderNotes();
                }
            }
        }`;

html = html.replace(/function handleMIDI\(message\) \{[\s\S]*?\n        \}/, newHandleMIDI);

// 5. Add Right Click deletion on piano notes
const noteContextMenuCode = `
            noteDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (selectedNoteIds.has(noteObj.id) && selectedNoteIds.size > 1) {
                    selectedNoteIds.forEach(id => {
                        for(let i=0; i<11; i++) {
                            projectNotes[i] = projectNotes[i].filter(n => n.id !== id);
                        }
                    });
                    selectedNoteIds.clear();
                } else {
                    projectNotes[t] = projectNotes[t].filter(n => n.id !== noteObj.id);
                    selectedNoteIds.delete(noteObj.id);
                }
                hideInspector();
                renderNotes();
                logMessage("Deleted note(s) via right click");
            });
`;

html = html.replace("noteDiv.addEventListener('mouseenter'", noteContextMenuCode + "\n            noteDiv.addEventListener('mouseenter'");

// Prevent context menu on timeline
html = html.replace("timeline.addEventListener('mousedown'", "timeline.addEventListener('contextmenu', e => e.preventDefault());\n        timeline.addEventListener('mousedown'");

// 6. Add Ctrl+A shortcut for selecting all notes
const ctrlACode = `
            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) {
                e.preventDefault();
                selectedNoteIds.clear();
                selectedTrackIds.forEach(tId => {
                    projectNotes[tId].forEach(n => selectedNoteIds.add(n.id));
                });
                renderNotes();
                logMessage("Selected all notes (" + selectedNoteIds.size + ")");
            }
`;

html = html.replace("window.addEventListener('keydown', (e) => {", "window.addEventListener('keydown', (e) => {\n" + ctrlACode);

fs.writeFileSync('index.html', html);
console.log('All fixes applied successfully!');
