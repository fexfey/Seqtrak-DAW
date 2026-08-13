const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const newFunc = `function getSoundCategoryName(msb, lsb, pc, tIndex) {
            if (pc < 0) return "WAITING..."; 
            let absPc = (lsb * 128) + pc;
            let cat = "PRESET";
            let name = "";
            let isSynth = (tIndex >= 7 && tIndex <= 9);
            
            if (msb === 63) {
                if (absPc < 112) cat = "KICK"; else if (absPc < 296) cat = "SNARE/CLAP"; 
                else if (absPc < 497) cat = "HAT/SHAKER"; else if (absPc < 650) cat = "CYMBAL/TOM";
                else if (absPc < 1102) cat = "BASS/LEAD"; else if (absPc < 1516) cat = "PAD/STRINGS";
                else if (absPc < 1891) cat = "ACOUSTIC"; else cat = "FM SYNTH";
                
                if (isSynth && synthNames[pc]) {
                    name = synthNames[pc];
                } else if (!isSynth && drumNames[pc]) {
                    name = drumNames[pc];
                }
            } else if (msb === 62) {
                cat = "SAMPLE";
            }
            
            if (name) {
                return \`\${name} (\${cat} \${absPc + 1})\`;
            }
            return \`\${cat} #\${absPc + 1} (B\${msb}/\${lsb}/\${pc})\`;
        }`;

content = content.replace(/function getSoundCategoryName\(msb, lsb, pc\) \{[\s\S]*?return \`\$\{cat\} #\$\{pc \+ 1\} \(B\$\{msb\}\/\$\{lsb\}\)\`;\n        \}/, newFunc);

// We need to update the calls to getSoundCategoryName to pass tIndex
content = content.replace(/getSoundCategoryName\(bState\.msb, bState\.lsb, bState\.pc\)/g, 'getSoundCategoryName(bState.msb, bState.lsb, bState.pc, tIndex)');
content = content.replace(/getSoundCategoryName\(noteObj\.msb, noteObj\.lsb, noteObj\.pc\)/g, 'getSoundCategoryName(noteObj.msb, noteObj.lsb, noteObj.pc, tIndex)');
content = content.replace(/getSoundCategoryName\(trackBanks\[tIndex\]\.msb, trackBanks\[tIndex\]\.lsb, trackBanks\[tIndex\]\.pc\)/g, 'getSoundCategoryName(trackBanks[tIndex].msb, trackBanks[tIndex].lsb, trackBanks[tIndex].pc, tIndex)');

fs.writeFileSync('index.html', content);
