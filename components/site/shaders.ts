/**
 * Custom GLSL shaders for the 3D Systems Cyber-Workbench scene.
 * Pure WebGL / Three.js ShaderMaterial shaders with zero external shader loader dependencies.
 */

export const GRID_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Subtle spatial horizon curvature + traveling telemetry wave
    float dist = length(pos.xz);
    float wave = sin(pos.x * 0.45 - uTime * 1.4) * cos(pos.z * 0.45 - uTime * 1.1) * 0.14;
    pos.y += wave - (dist * dist) * 0.008;
    vElevation = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const GRID_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPrimaryColor;
  uniform vec3 uAccentColor;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec2 gridUv = vUv * 32.0;
    vec2 cell = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
    float line = min(cell.x, cell.y);
    float gridMask = 1.0 - min(line, 1.0);

    // Radial fade to dark background
    float radial = smoothstep(0.52, 0.08, length(vUv - 0.5));

    // Traveling pulse ring from workstation center
    float ringDist = length(vUv - 0.5) * 14.0 - mod(uTime * 1.8, 8.0);
    float pulse = exp(-ringDist * ringDist * 3.5) * 0.85;

    vec3 color = mix(uPrimaryColor, uAccentColor, clamp(vElevation * 3.0 + pulse, 0.0, 1.0));
    float alpha = (gridMask * 0.34 + pulse * 0.25) * radial;

    gl_FragColor = vec4(color, alpha);
  }
`

export const CORE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 displaced = position + normal * (sin(position.y * 5.0 + uTime * 2.5) * 0.025);
    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`

export const CORE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.4);
    float scan = 0.5 + 0.5 * sin(vViewPos.y * 16.0 - uTime * 4.0);
    vec3 col = mix(uColorA, uColorB, fresnel) + uColorB * scan * 0.12;
    gl_FragColor = vec4(col, 0.35 + fresnel * 0.6);
  }
`
