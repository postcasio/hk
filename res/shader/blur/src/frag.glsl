// texturing parameters courtesy of Allegro
uniform sampler2D al_tex;
uniform bool al_use_tex;

// input from vertex shader
varying vec4 varying_color;
varying vec2 varying_texcoord;

uniform bool flip;

uniform vec2 resolution;

#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')
#pragma glslify: noise = require('glsl-noise/simplex/2d');

vec4 desaturate(vec3 color, float Desaturation)
{
	vec3 grayXfer = vec3(0.3, 0.59, 0.11);
	vec3 gray = vec3(dot(grayXfer, color));
	return vec4(mix(color, gray, Desaturation), 1.0);
}

void main() {
  // if (flip) {
  //   uv.y = 1.0 - uv.y;
  // }
  vec2 uv = vec2(gl_FragCoord.xy / resolution.xy);
  float dist = distance(uv, vec2(0.5, 0.5));
  float n = min(noise(uv * 1000.0), 0.6 - dist);
  gl_FragColor = desaturate(vec3(mix(mix(mix(
    blur(al_tex, uv, resolution.xy, vec2(0, 1)),
    blur(al_tex, uv, resolution.xy, vec2(1, 0)),
    0.5
  ), vec4(n, n, n, 1), dist * 0.5), vec4(0, 0, 0, 1), 0.2 + dist).xyz), 1.0 - dist);

  // gl_FragColor = vec4(0.5, 0.2, 0.6, 1);
  // gl_FragColor = al_use_tex
	// 	? varying_color * texture2D(al_tex, varying_texcoord)
  //       : varying_color;
}