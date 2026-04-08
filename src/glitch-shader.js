/**
 * VHS-style glitch transition shader.
 * Chromatic aberration + vertical banding + scan lines + noise.
 */
export const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.0 },
    time: { value: 0.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float time;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      if (intensity < 0.01) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      float i = intensity;

      // Chromatic aberration — split RGB channels
      float aberration = i * 0.02;
      float r = texture2D(tDiffuse, vUv + vec2(aberration, 0.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(aberration, 0.0)).b;

      vec3 color = vec3(r, g, b);

      // Vertical banding — tall strips of offset
      float band = step(0.5, random(vec2(floor(vUv.x * 20.0), floor(time * 8.0))));
      float bandOffset = band * i * 0.03;
      color = mix(color, texture2D(tDiffuse, vUv + vec2(bandOffset, 0.0)).rgb, band * i * 0.5);

      // Scan lines
      float scanline = sin(vUv.y * 800.0 + time * 10.0) * 0.5 + 0.5;
      color -= scanline * i * 0.08;

      // Random noise
      float noise = random(vUv + time) * i * 0.15;
      color += noise;

      // Slight green tint during glitch (VHS characteristic)
      color.g += i * 0.03;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
}
