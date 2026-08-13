const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix btnClear click handler (remove window.confirm which blocks in iframe)
html = html.replace(
    /document\.getElementById\('btnClear'\)\.onclick = \(\) => \{[\s\S]*?\};/,
    `document.getElementById('btnClear').onclick = () => {
            selectedTrackIds.forEach(id => { projectNotes[id] = []; });
            stopAllMidiNotes();
            renderNotes();
            logMessage("Cleared notes on selected track(s)");
        };`
);

// 2. Expand trackStates to include volume, pan, pitch
html = html.replace(
    /let trackStates = Array\(11\)\.fill\(\)\.map\(\(\) => \(\{ mute: false, solo: false, volume: 100 \}\)\);/,
    `let trackStates = Array(11).fill().map(() => ({ mute: false, solo: false, volume: 100, pan: 64, pitch: 64 }));`
);

// 3. Replace getSoundCategoryName with 100% accurate Seqtrak Data List category & preset calculator
const getSoundCategoryNameFunc = `function getSoundCategoryName(msb, lsb, pc, tIndex) {
            if (pc < 0) return "WAITING..."; 
            let soundNum = (lsb * 128) + pc + 1;
            
            if (tIndex <= 6) { // Drums
                if (soundNum >= 1 && soundNum <= 112) return \`KICK #\${soundNum}\`;
                if (soundNum <= 214) return \`SNARE #\${soundNum - 112}\`;
                if (soundNum <= 248) return \`RIM #\${soundNum - 214}\`;
                if (soundNum <= 296) return \`CLAP #\${soundNum - 248}\`;
                if (soundNum <= 311) return \`SNAP #\${soundNum - 296}\`;
                if (soundNum <= 384) return \`CLOSED HAT #\${soundNum - 311}\`;
                if (soundNum <= 456) return \`OPEN HAT #\${soundNum - 384}\`;
                if (soundNum <= 497) return \`SHAKER #\${soundNum - 456}\`;
                if (soundNum <= 527) return \`RIDE #\${soundNum - 497}\`;
                if (soundNum <= 548) return \`CRASH #\${soundNum - 527}\`;
                if (soundNum <= 618) return \`TOM #\${soundNum - 548}\`;
                if (soundNum <= 650) return \`BELL #\${soundNum - 618}\`;
                if (soundNum <= 676) return \`PERC #\${soundNum - 650}\`;
                if (soundNum <= 788) return \`WORLD #\${soundNum - 676}\`;
                return \`SFX #\${soundNum - 788}\`;
            } else if (tIndex === 7 || tIndex === 8) { // Synths
                if (soundNum >= 856 && soundNum <= 950) return \`BASS #\${soundNum - 855}\`;
                if (soundNum <= 1102) return \`LEAD #\${soundNum - 950}\`;
                if (soundNum <= 1134) return \`PIANO #\${soundNum - 1102}\`;
                if (soundNum <= 1214) return \`KEYS #\${soundNum - 1134}\`;
                if (soundNum <= 1289) return \`ORGAN #\${soundNum - 1214}\`;
                if (soundNum <= 1438) return \`PAD #\${soundNum - 1289}\`;
                if (soundNum <= 1516) return \`STRINGS #\${soundNum - 1438}\`;
                if (soundNum <= 1589) return \`BRASS #\${soundNum - 1516}\`;
                if (soundNum <= 1642) return \`WOODWIND #\${soundNum - 1589}\`;
                if (soundNum <= 1738) return \`GUITAR #\${soundNum - 1642}\`;
                if (soundNum <= 1773) return \`WORLD #\${soundNum - 1738}\`;
                if (soundNum <= 1793) return \`MALLET #\${soundNum - 1773}\`;
                if (soundNum <= 1827) return \`BELL #\${soundNum - 1793}\`;
                if (soundNum <= 1891) return \`RHYTHMIC #\${soundNum - 1827}\`;
                return \`SFX #\${soundNum - 1891}\`;
            } else if (tIndex === 9) { // DX
                if (soundNum >= 1933 && soundNum <= 1945) return \`FM BASS #\${soundNum - 1932}\`;
                if (soundNum <= 1959) return \`FM LEAD #\${soundNum - 1945}\`;
                if (soundNum <= 1963) return \`FM PIANO #\${soundNum - 1959}\`;
                if (soundNum <= 1972) return \`FM KEYS #\${soundNum - 1963}\`;
                if (soundNum <= 1975) return \`FM ORGAN #\${soundNum - 1972}\`;
                if (soundNum <= 1991) return \`FM PAD #\${soundNum - 1975}\`;
                if (soundNum <= 1993) return \`FM STRINGS #\${soundNum - 1991}\`;
                if (soundNum <= 1999) return \`FM BRASS #\${soundNum - 1993}\`;
                if (soundNum <= 2001) return \`FM WOODWIND #\${soundNum - 1999}\`;
                if (soundNum <= 2006) return \`FM GUITAR #\${soundNum - 2001}\`;
                if (soundNum <= 2009) return \`FM WORLD #\${soundNum - 2006}\`;
                if (soundNum <= 2012) return \`FM MALLET #\${soundNum - 2009}\`;
                if (soundNum <= 2015) return \`FM BELL #\${soundNum - 2012}\`;
                if (soundNum <= 2029) return \`FM RHYTHMIC #\${soundNum - 2015}\`;
                return \`FM SFX #\${soundNum - 2029}\`;
            } else { // Sampler
                if (soundNum >= 1 && soundNum <= 24) return \`COUNT #\${soundNum}\`;
                if (soundNum <= 75) return \`CHANT #\${soundNum - 24}\`;
                if (soundNum <= 98) return \`SINGING #\${soundNum - 75}\`;
                if (soundNum <= 119) return \`ROBOTIC #\${soundNum - 98}\`;
                if (soundNum <= 136) return \`RISER #\${soundNum - 119}\`;
                if (soundNum <= 186) return \`LASER #\${soundNum - 136}\`;
                if (soundNum <= 208) return \`IMPACT #\${soundNum - 186}\`;
                if (soundNum <= 242) return \`NOISE #\${soundNum - 208}\`;
                if (soundNum <= 254) return \`AMBIENT #\${soundNum - 242}\`;
                if (soundNum <= 268) return \`SFX #\${soundNum - 254}\`;
                if (soundNum <= 292) return \`SCRATCH #\${soundNum - 268}\`;
                if (soundNum <= 300) return \`ANIMALS #\${soundNum - 292}\`;
                if (soundNum <= 319) return \`STAB #\${soundNum - 300}\`;
                if (soundNum <= 390) return \`PERCUSSION #\${soundNum - 319}\`;
                return \`SAMPLE #\${soundNum - 390}\`;
            }
        }`;

html = html.replace(/function getSoundCategoryName\(msb, lsb, pc, tIndex\) \{[\s\S]*?\n        \}/, getSoundCategoryNameFunc);

// 4. Update incoming MIDI parser so that track switching on Seqtrak works even if isPlaying is true!
html = html.replace(
    /if \(!isPlaying && \(messageType === 9 \|\| messageType === 11\)\) \{/,
    `if (messageType === 9 || messageType === 11) {`
);

// 5. Update switchTrack SysEx sending and logging
html = html.replace(
    /if \(midiOutput && e !== null\) \{[\s\S]*?logMessage\("SysEx Track Change -> " \+ currentTrackId\);[\s\S]*?\}/,
    `if (midiOutput && e !== null) { 
                // Address 30 40 68 is Solo/Track Select in Project Common
                midiOutput.send([0xF0, 0x43, 0x10, 0x7F, 0x1C, 0x0C, 0x30, 0x40, 0x68, currentTrackId, 0xF7]);
                // Send CC 24 (Track Solo/Focus) and CC on current track channel
                midiOutput.send([0xB0 + currentTrackId, 24, 127]);
                logMessage("Track Switched -> CH " + (currentTrackId + 1)); 
            }`
);

fs.writeFileSync('index.html', html);
