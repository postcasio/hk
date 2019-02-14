const gm = require('gm');
const fs = require('fs');
const load = require('load-bmfont');
const path = require('path');

const sourceFile = process.argv[2];
const outputPath = path.dirname(sourceFile).replace(/\/$/, '') + '.rfn';

console.log(`Processing ${sourceFile}...`);

let rfn = Buffer.alloc(256, 0);

rfn.write('.rfn', 0);
rfn.writeInt16LE(2, 4);
rfn.writeInt16LE(256, 6);

load({ uri: sourceFile, binary: false }, (err, font) => {
  const pages = font.pages.map(pageFile => {
    return path.join(path.dirname(sourceFile), pageFile);
  });
  const emptyCharacter = Buffer.alloc(32, 0);
  console.log(font.chars.length);
  emptyCharacter.writeInt16LE(0, 0);
  emptyCharacter.writeInt16LE(0, 2);
  const characterBuffers = new Array(256).fill(emptyCharacter);
  let currentChar = 0;

  const processNextChar = () => {
    const char = font.chars.find(char => Number(char.id) === currentChar);
    if (!char || char.xadvance === 0 || char.height === 0) {
      currentChar++;
      processNextChar();
      return;
    }

    const im = gm(pages[char.page]);
    console.log(
      `Image ${char.id}: ${char.x},${char.y} ${char.xadvance}x${char.height}`
    );
    im.size((err, size) => {
      if (char.y + char.height >= size.height) {
        console.log('height goes past bottom edge');
        process.exit(1);
      } else if (char.x + char.xadvance >= size.width) {
        char.xadvance = char.width;
        if (char.x + char.xadvance >= size.width) {
          console.log('width goes past right edge');
          process.exit(1);
        }
      }

      im.crop(char.xadvance, char.height, char.x, char.y).toBuffer(
        'RGBA',
        (err, buf) => {
          if (err) {
            console.log('ERROR!', err);
            process.exit(1);
          }
          if (buf.length !== char.xadvance * char.height * 4) {
            console.log(
              'Invalid size for buffer for cxharacter ' +
                char.id +
                '. Got ' +
                buf.length +
                ', expected ' +
                char.xadvance * char.height * 4
            );
            process.exit(1);
          }

          const character = Buffer.alloc(32, 0);
          const padding = Buffer.alloc(
            Math.max(0, char.yoffset) * char.xadvance * 4,
            0
          );

          character.writeInt16LE(char.xadvance, 0);
          character.writeInt16LE(char.height + Math.max(0, char.yoffset), 2);
          characterBuffers[char.id] = Buffer.concat([character, padding, buf]);
          currentChar++;

          if (currentChar === font.chars.length) {
            finish();
          } else {
            processNextChar();
          }
        }
      );
    });
  };

  const finish = () => {
    console.log('Finished processing');
    console.log(characterBuffers.length + ' buffers');

    const all = [rfn].concat(characterBuffers);

    const output = Buffer.concat(all);
    fs.writeFileSync(outputPath, output);
  };
  processNextChar();
});
