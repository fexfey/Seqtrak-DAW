const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix ReferenceError: tIndex is not defined in drawSingleNote
content = content.replace(
    /let pcText = \(noteObj\.pc >= 0\) \? getSoundCategoryName\(noteObj\.msb, noteObj\.lsb, noteObj\.pc, tIndex\)\.split\(' '\)\[0\] : '';/g,
    "let pcText = (noteObj.pc >= 0) ? getSoundCategoryName(noteObj.msb, noteObj.lsb, noteObj.pc, t).split(' ')[0] : '';"
);

// 2. Revert getSoundCategoryName to only use absolute PC and categories, skipping the broken name arrays
const newFunc = `function getSoundCategoryName(msb, lsb, pc, tIndex) {
            if (pc < 0) return "WAITING..."; 
            let absPc = (lsb * 128) + pc;
            let cat = "PRESET";
            
            if (msb === 63) {
                if (absPc < 112) cat = "KICK"; else if (absPc < 296) cat = "SNARE/CLAP"; 
                else if (absPc < 497) cat = "HAT/SHAKER"; else if (absPc < 650) cat = "CYMBAL/TOM";
                else if (absPc < 1102) cat = "BASS/LEAD"; else if (absPc < 1516) cat = "PAD/STRINGS";
                else if (absPc < 1891) cat = "ACOUSTIC"; else cat = "FM SYNTH";
            } else if (msb === 62) {
                cat = "SAMPLE";
            }
            
            return \`\${cat} #\${absPc + 1} (B\${msb}/\${lsb}/\${pc})\`;
        }`;

content = content.replace(/function getSoundCategoryName\(msb, lsb, pc, tIndex\) \{[\s\S]*?return \`\$\{cat\} #\$\{absPc \+ 1\} \(B\$\{msb\}\/\$\{lsb\}\/\$\{pc\}\)\`;\n        \}/, newFunc);

fs.writeFileSync('index.html', content);
