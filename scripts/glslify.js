const fs = require('fs');
const path = require('path');
const glslify = require('glslify');

const shaderDir = path.join(__dirname, '..', 'res', 'shader');

const files = fs.readdirSync(shaderDir);

for (const shaderName of files) {
  console.log(`Compiling ${shaderName}...`);
  const dist = path.join(shaderDir, shaderName, 'dist');

  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  const frag = glslify.file(
    path.join(shaderDir, shaderName, 'src', 'frag.glsl')
  );
  fs.writeFileSync(path.join(dist, 'frag.glsl'), frag);

  const vert = glslify.file(
    path.join(shaderDir, shaderName, 'src', 'vert.glsl')
  );
  fs.writeFileSync(path.join(dist, 'vert.glsl'), vert);
}
