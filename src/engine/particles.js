import * as THREE from 'three';

// One swarm of particles that re-forms into a new shape for every scene.
// Each scene's DOM has a .shape-anchor box; the swarm fills that box, so CSS
// decides where the shape sits at every breakpoint.

const vertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uScatter;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.6 + aSeed * 12.0 + p.y * 1.5) * 0.02;
    p.y += cos(uTime * 0.5 + aSeed * 9.0 + p.x * 1.2) * 0.02;
    p += normalize(vec3(sin(aSeed * 91.0), cos(aSeed * 47.0), sin(aSeed * 13.0) + 0.01)) * uScatter * aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed) * (10.0 / -mv.z);
    vAlpha = 0.5 + 0.5 * aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

// Full-screen backdrop drawn in the same WebGL pass: accent glows, animated film grain.
// Doing this here instead of as stacked page layers keeps scrolling smooth.
const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const backdropFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uShift;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 a = vec2(-0.42 * aspect, 0.46) + uShift * 0.04;
    vec2 b = vec2(0.44 * aspect, -0.5) - uShift * 0.03;
    float glow = 0.16 * smoothstep(1.0, 0.0, length(p - a)) + 0.11 * smoothstep(0.95, 0.0, length(p - b));
    vec3 col = vec3(0.0235, 0.0235, 0.031) + uAccent * glow * 0.5;
    col += (hash(floor(vUv * uRes) + floor(uTime * 24.0)) - 0.5) * 0.03;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const vignetteFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float v = smoothstep(0.42, 0.95, length((vUv - 0.5) * vec2(1.1, 1.0)) * 1.25);
    gl_FragColor = vec4(0.0, 0.0, 0.0, v * 0.7);
  }
`;

// A few large, soft out-of-focus lights close to the camera: they drift with the scroll
const bokehFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.15, d) * vAlpha);
  }
`;

const bokehVertex = /* glsl */ `
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (10.0 / -mv.z);
    vAlpha = 0.16;
  }
`;

const rand = (a, b) => a + Math.random() * (b - a);

// Scale and centre raw points so their x/y extent fits inside w × h
function fit(raw, w, h) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let j = 0; j < raw.length; j += 3) {
    minX = Math.min(minX, raw[j]);
    maxX = Math.max(maxX, raw[j]);
    minY = Math.min(minY, raw[j + 1]);
    maxY = Math.max(maxY, raw[j + 1]);
  }
  const s = Math.min(w / (maxX - minX || 1), h / (maxY - minY || 1));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  for (let j = 0; j < raw.length; j += 3) {
    raw[j] = (raw[j] - cx) * s;
    raw[j + 1] = (raw[j + 1] - cy) * s;
    raw[j + 2] *= s;
  }
  return raw;
}

const text = (label) => (count) => {
  const size = 160;
  const font = `700 ${size}px Geist, "Segoe UI", system-ui, sans-serif`;
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(label).width + size * 0.2);
  const h = Math.ceil(size * 1.4);
  canvas.width = w;
  canvas.height = h;
  ctx = canvas.getContext('2d');
  ctx.font = font;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2);

  const data = ctx.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 140) pts.push(x, y);
    }
  }
  if (!pts.length) return sphere(count);

  const out = new Float32Array(count * 3);
  const n = pts.length / 2;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(Math.random() * n) * 2;
    out[i * 3] = pts[k] + rand(-0.8, 0.8);
    out[i * 3 + 1] = -(pts[k + 1] + rand(-0.8, 0.8));
    out[i * 3 + 2] = rand(-3, 3);
  }
  return out;
};

// A planet with a tilted orbit ring
function sphere(count) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const ringStart = Math.floor(count * 0.75);
  for (let i = 0; i < ringStart; i++) {
    const y = 1 - (i / (ringStart - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const len = 1 + rand(-0.025, 0.025);
    out[i * 3] = Math.cos(theta) * r * len;
    out[i * 3 + 1] = y * len;
    out[i * 3 + 2] = Math.sin(theta) * r * len;
  }
  const tilt = 1.2;
  for (let i = ringStart; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rand(1.45, 1.75);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    out[i * 3] = x;
    out[i * 3 + 1] = -z * Math.cos(tilt) + rand(-0.02, 0.02);
    out[i * 3 + 2] = z * Math.sin(tilt);
  }
  return out;
}

// Isometric wireframe bar chart: stock levels for Billlion
function bars(count) {
  const cols = 5;
  const gap = 1.6;
  const size = 1;
  const boxes = [];
  for (let gx = 0; gx < cols; gx++) {
    for (let gz = 0; gz < cols; gz++) {
      boxes.push({
        x: (gx - (cols - 1) / 2) * gap - size / 2,
        z: (gz - (cols - 1) / 2) * gap - size / 2,
        h: rand(0.6, 4.2),
      });
    }
  }
  const out = new Float32Array(count * 3);
  const ry = Math.PI / 4;
  const rx = 0.55;
  for (let i = 0; i < count; i++) {
    const b = boxes[Math.floor(Math.random() * boxes.length)];
    let x;
    let y;
    let z;
    if (Math.random() < 0.8) {
      // A random point on one of the 12 edges
      const t = Math.random();
      const e = Math.floor(Math.random() * 12);
      const xs = [b.x, b.x + size];
      const zs = [b.z, b.z + size];
      const ys = [0, b.h];
      if (e < 4) {
        x = b.x + t * size;
        y = ys[e & 1];
        z = zs[e >> 1];
      } else if (e < 8) {
        x = xs[e & 1];
        y = ys[(e >> 1) & 1];
        z = b.z + t * size;
      } else {
        x = xs[e & 1];
        y = t * b.h;
        z = zs[(e >> 1) & 1];
      }
    } else {
      // Fill the lid so tops read as solid
      x = b.x + Math.random() * size;
      y = b.h;
      z = b.z + Math.random() * size;
    }
    y -= 2;
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = x * Math.sin(ry) + z * Math.cos(ry);
    out[i * 3] = x1;
    out[i * 3 + 1] = y * Math.cos(rx) - z1 * Math.sin(rx);
    out[i * 3 + 2] = y * Math.sin(rx) + z1 * Math.cos(rx);
  }
  return out;
}

// A film reel seen face-on
function reel(count) {
  const holes = Array.from({ length: 6 }, (_, k) => [Math.cos((k * Math.PI) / 3) * 0.56, Math.sin((k * Math.PI) / 3) * 0.56]);
  const out = new Float32Array(count * 3);
  let i = 0;
  while (i < count) {
    let x;
    let y;
    if (Math.random() < 0.2) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(0.98, 1.04);
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
    } else {
      x = rand(-1, 1);
      y = rand(-1, 1);
      const r = Math.hypot(x, y);
      if (r > 1 || r < 0.12) continue;
      if (holes.some(([hx, hy]) => Math.hypot(x - hx, y - hy) < 0.22)) continue;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = rand(-0.04, 0.04);
    i++;
  }
  return out;
}

function galaxy(count) {
  const out = new Float32Array(count * 3);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    const core = Math.random() < 0.12;
    const t = core ? Math.random() * 0.18 : Math.pow(Math.random(), 0.7);
    const angle = (i % arms) * ((Math.PI * 2) / arms) + t * 5.2;
    const spread = (1 - t * 0.6) * (core ? 0.08 : 0.14);
    out[i * 3] = Math.cos(angle) * t + rand(-spread, spread);
    out[i * 3 + 1] = Math.sin(angle) * t + rand(-spread, spread);
    out[i * 3 + 2] = rand(-0.08, 0.08) * (1 - t);
  }
  return out;
}

// Scene index → generator and idle motion. Index 7 is the opening gate.
const SHAPES = [
  { make: text('DEVANSH'), motion: 'sway' },
  { make: sphere, motion: 'spin' },
  { make: bars, motion: 'sway' },
  { make: text('</>'), motion: 'sway' },
  { make: reel, motion: 'roll' },
  { make: text('2027'), motion: 'sway' },
  { make: galaxy, motion: 'roll' },
  { make: galaxy, motion: 'roll' },
];

export const GATE_SHAPE = 7;

export class ParticleStage {
  constructor(canvas, { colors, reducedMotion }) {
    this.reduced = reducedMotion;
    this.colors = colors.map((c) => new THREE.Color(c));
    this.count = window.innerWidth < 760 ? 4000 : 9000;
    this.drawCount = this.count;
    this.frameAvg = 16;
    this.frames = 0;
    this.active = GATE_SHAPE;
    this.shapes = [];
    this.rects = null;
    this.mouse = { x: 0, y: 0 };
    this.velocity = 0;
    this.dim = 1;
    this.disposed = false;

    // Throws when WebGL is unavailable; the caller falls back to plain DOM
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.z = 10;

    this.positions = new Float32Array(this.count * 3);
    this.speeds = new Float32Array(this.count);
    const seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      seeds[i] = Math.random();
      this.speeds[i] = 0.018 + Math.random() * 0.05;
      // Start far and wide so the first formation flies in
      this.positions[i * 3] = rand(-15, 15);
      this.positions[i * 3 + 1] = rand(-10, 10);
      this.positions[i * 3 + 2] = rand(-10, 10);
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uSize: { value: 3 },
      uScatter: { value: 0 },
      uPixelRatio: { value: this.renderer.getPixelRatio() },
      uColor: { value: this.colors[GATE_SHAPE].clone() },
      uOpacity: { value: 0 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    // Backdrop (drawn first), bokeh and vignette (drawn last), all in the same render
    const quad = new THREE.PlaneGeometry(2, 2);
    const overlay = (fragmentShader, order, uniforms = {}, transparent = false) => {
      const mesh = new THREE.Mesh(
        quad,
        new THREE.ShaderMaterial({ vertexShader: quadVertex, fragmentShader, uniforms, transparent, depthTest: false, depthWrite: false })
      );
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      this.scene.add(mesh);
      return mesh;
    };
    this.backdropUniforms = { uAccent: { value: this.colors[GATE_SHAPE].clone() }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uShift: { value: new THREE.Vector2() } };
    this.backdrop = overlay(backdropFragment, -1, this.backdropUniforms);
    this.vignette = overlay(vignetteFragment, 3, {}, true);
    this.quad = quad;

    const bokehCount = 24;
    const bokehPos = new Float32Array(bokehCount * 3);
    const bokehSize = new Float32Array(bokehCount);
    for (let i = 0; i < bokehCount; i++) {
      bokehPos[i * 3] = rand(-3.6, 3.6);
      bokehPos[i * 3 + 1] = rand(-15, 3);
      bokehPos[i * 3 + 2] = rand(2, 6);
      bokehSize[i] = rand(30, 110);
    }
    this.bokehGeometry = new THREE.BufferGeometry();
    this.bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    this.bokehGeometry.setAttribute('aSize', new THREE.BufferAttribute(bokehSize, 1));
    this.bokehMaterial = new THREE.ShaderMaterial({
      vertexShader: bokehVertex,
      fragmentShader: bokehFragment,
      uniforms: { uColor: this.uniforms.uColor, uPixelRatio: this.uniforms.uPixelRatio },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.bokeh = new THREE.Points(this.bokehGeometry, this.bokehMaterial);
    this.bokeh.frustumCulled = false;
    this.bokeh.renderOrder = 2;
    this.scene.add(this.bokeh);
    this.progress = 0;

    this.fontsReady = document.fonts ? document.fonts.load('700 160px Geist').catch(() => {}) : Promise.resolve();

    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    this.onResize();
    this.clock = new THREE.Clock();
    this.raf = requestAnimationFrame(this.tick);
  }

  // rects: viewport-pixel boxes { x, y (centre), w, h, opacity }, one per shape
  setLayouts(rects) {
    this.rects = rects;
    this.fontsReady.then(() => {
      if (!this.disposed) this.build();
    });
  }

  setShape(index) {
    this.active = index;
  }

  setVelocity(v) {
    this.velocity = v;
  }

  // 0..1 through the whole page; the bokeh lights rise as the film plays
  setProgress(p) {
    this.progress = p;
  }

  // Fade the swarm back while dense content (cards, grids) is on screen
  setDim(dim) {
    this.dim = dim;
  }

  build() {
    const worldH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const worldW = worldH * this.camera.aspect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.shapes = this.rects.map((r, i) => ({
      base: fit(SHAPES[i].make(this.count), (r.w / vw) * worldW, (r.h / vh) * worldH),
      cx: (r.x / vw - 0.5) * worldW,
      cy: -(r.y / vh - 0.5) * worldH,
      opacity: r.opacity,
      motion: SHAPES[i].motion,
      color: this.colors[i],
    }));
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    if (this.backdropUniforms) this.backdropUniforms.uRes.value.set(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  onPointer(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  tick() {
    this.raf = requestAnimationFrame(this.tick);
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const t = this.clock.elapsedTime;
    this.adapt(rawDt);
    this.uniforms.uTime.value = this.reduced ? 0 : t;

    const shape = this.shapes[this.active];
    if (shape) {
      let a = 0;
      if (!this.reduced) {
        if (shape.motion === 'spin') a = t * 0.22;
        else if (shape.motion === 'roll') a = t * 0.06;
        else if (shape.motion === 'sway') a = Math.sin(t * 0.35) * 0.22;
      }
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const roll = shape.motion === 'roll';
      const { base, cx, cy } = shape;
      const pos = this.positions;
      const frames = dt * 60;
      for (let i = 0, j = 0; i < this.drawCount; i++, j += 3) {
        const bx = base[j];
        const by = base[j + 1];
        const bz = base[j + 2];
        let tx;
        let ty;
        let tz;
        if (roll) {
          tx = bx * cos - by * sin;
          ty = bx * sin + by * cos;
          tz = bz;
        } else {
          tx = bx * cos + bz * sin;
          ty = by;
          tz = -bx * sin + bz * cos;
        }
        const k = this.reduced ? 1 : 1 - Math.pow(1 - this.speeds[i], frames);
        pos[j] += (tx + cx - pos[j]) * k;
        pos[j + 1] += (ty + cy - pos[j + 1]) * k;
        pos[j + 2] += (tz - pos[j + 2]) * k;
      }
      this.geometry.attributes.position.needsUpdate = true;
      this.uniforms.uColor.value.lerp(shape.color, 0.04);
      this.backdropUniforms.uAccent.value.lerp(shape.color, 0.04);
      this.uniforms.uOpacity.value += (shape.opacity * this.dim - this.uniforms.uOpacity.value) * 0.05;
    }

    // Fast scrolling briefly blows the swarm apart
    this.velocity *= 0.92;
    const scatter = this.reduced ? 0 : Math.min(Math.abs(this.velocity) * 0.012, 0.9);
    this.uniforms.uScatter.value += (scatter - this.uniforms.uScatter.value) * 0.1;

    this.backdropUniforms.uTime.value = this.reduced ? 0 : t;
    this.backdropUniforms.uShift.value.set(this.mouse.x, this.mouse.y);
    this.bokeh.position.y += (this.progress * 14 - this.bokeh.position.y) * 0.08;

    this.camera.position.x += (this.mouse.x * 0.35 - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.mouse.y * 0.2 - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }

  // Slow machine? Draw fewer particles at a lower resolution until frames come back under ~22ms
  adapt(dt) {
    if (dt > 0.2) return; // tab switch or breakpoint pause, not a real frame
    this.frameAvg += (dt * 1000 - this.frameAvg) * 0.05;
    this.frames += 1;
    if (this.frames < 90 || this.frameAvg < 22 || this.drawCount <= this.count * 0.3) return;
    this.frames = 0;
    this.drawCount = Math.floor(this.drawCount * 0.7);
    this.geometry.setDrawRange(0, this.drawCount);
    if (this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(1);
      this.uniforms.uPixelRatio.value = 1;
      this.onResize();
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    this.geometry.dispose();
    this.material.dispose();
    this.bokehGeometry.dispose();
    this.bokehMaterial.dispose();
    this.quad.dispose();
    this.backdrop.material.dispose();
    this.vignette.material.dispose();
    this.renderer.dispose();
  }
}
