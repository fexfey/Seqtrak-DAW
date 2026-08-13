const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    /midiOutput\.send\(\[0xF0, 0x43, 0x10, 0x7F, 0x1C, 0x03, 0x00, 0x00, 0x00, currentTrackId, 0xF7\]\);/,
    `midiOutput.send([0xF0, 0x43, 0x10, 0x7F, 0x1C, 0x03, 0x00, 0x00, 0x00, currentTrackId, 0xF7]);
                logMessage("SysEx Track Change -> " + currentTrackId);`
);

fs.writeFileSync('index.html', content);
