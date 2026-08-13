const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newGetSoundCategoryName = `function getSoundCategoryName(msb, lsb, pc, tIndex) {
            const defaultNames = ["KICK", "SNARE", "CLAP", "HAT 1", "HAT 2", "PERC 1", "PERC 2", "SYNTH 1", "SYNTH 2", "DX SYNTH", "SAMPLER"];
            if (pc < 0) return defaultNames[tIndex] || "TRACK " + (tIndex + 1); 
            
            // Calculate 1-based sound index from Bank LSB & Program Change
            let soundNum = (lsb * 128) + pc + 1;
            
            if (tIndex <= 6) { // Drum Tracks (0 - 6)
                // If LSB is 0, map directly to default track categories
                if (lsb === 0) {
                    if (tIndex === 0) return \`KICK #\${soundNum}\`;
                    if (tIndex === 1) return \`SNARE #\${soundNum}\`;
                    if (tIndex === 2) return \`CLAP #\${soundNum}\`;
                    if (tIndex === 3) return \`CLOSED HAT #\${soundNum}\`;
                    if (tIndex === 4) return \`OPEN HAT #\${soundNum}\`;
                    if (tIndex === 5) return \`PERC #\${soundNum}\`;
                    if (tIndex === 6) return \`PERC #\${soundNum}\`;
                }
                // Global Seqtrak Drum preset list (1 to 788)
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
            } else if (tIndex === 7 || tIndex === 8) { // AWM2 Synth Tracks (7 & 8)
                if (soundNum >= 1 && soundNum <= 95) return \`BASS #\${soundNum}\`;
                if (soundNum <= 247) return \`LEAD #\${soundNum - 95}\`;
                if (soundNum <= 279) return \`PIANO #\${soundNum - 247}\`;
                if (soundNum <= 359) return \`KEYS #\${soundNum - 279}\`;
                if (soundNum <= 434) return \`ORGAN #\${soundNum - 359}\`;
                if (soundNum <= 583) return \`PAD #\${soundNum - 434}\`;
                if (soundNum <= 661) return \`STRINGS #\${soundNum - 583}\`;
                if (soundNum <= 734) return \`BRASS #\${soundNum - 661}\`;
                if (soundNum <= 787) return \`WOODWIND #\${soundNum - 734}\`;
                if (soundNum <= 883) return \`GUITAR #\${soundNum - 787}\`;
                if (soundNum <= 918) return \`WORLD #\${soundNum - 883}\`;
                if (soundNum <= 938) return \`MALLET #\${soundNum - 918}\`;
                if (soundNum <= 972) return \`BELL #\${soundNum - 938}\`;
                if (soundNum <= 1036) return \`RHYTHMIC #\${soundNum - 972}\`;
                return \`SFX #\${soundNum - 1036}\`;
            } else if (tIndex === 9) { // DX FM Synth Track (9)
                if (soundNum >= 1 && soundNum <= 13) return \`FM BASS #\${soundNum}\`;
                if (soundNum <= 27) return \`FM LEAD #\${soundNum - 13}\`;
                if (soundNum <= 31) return \`FM PIANO #\${soundNum - 27}\`;
                if (soundNum <= 40) return \`FM KEYS #\${soundNum - 31}\`;
                if (soundNum <= 43) return \`FM ORGAN #\${soundNum - 40}\`;
                if (soundNum <= 59) return \`FM PAD #\${soundNum - 43}\`;
                if (soundNum <= 61) return \`FM STRINGS #\${soundNum - 59}\`;
                if (soundNum <= 67) return \`FM BRASS #\${soundNum - 61}\`;
                if (soundNum <= 69) return \`FM WOODWIND #\${soundNum - 67}\`;
                if (soundNum <= 74) return \`FM GUITAR #\${soundNum - 69}\`;
                if (soundNum <= 77) return \`FM WORLD #\${soundNum - 74}\`;
                if (soundNum <= 80) return \`FM MALLET #\${soundNum - 77}\`;
                if (soundNum <= 83) return \`FM BELL #\${soundNum - 80}\`;
                if (soundNum <= 97) return \`FM RHYTHMIC #\${soundNum - 83}\`;
                return \`FM SFX #\${soundNum - 97}\`;
            } else { // Sampler Track (10)
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

html = html.replace(/function getSoundCategoryName\(msb, lsb, pc, tIndex\) \{[\s\S]*?\n        \}/, newGetSoundCategoryName);
fs.writeFileSync('index.html', html);
console.log('Successfully updated getSoundCategoryName!');
