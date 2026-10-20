import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, viewChild } from '@angular/core';
import * as THREE from 'three';

import { prefersReducedMotion } from '../../shared/motion';

const GREEN = new THREE.Color('#18d26e');
const TEAL = new THREE.Color('#12b3d6');
const RADIUS = 1.9;

/**
 * Interactive 3D globe for the hero: a sphere of glowing points, arcs between
 * "connected" points with pulses travelling along them, a wireframe core and
 * orbit rings. It leans towards the pointer. Loaded with @defer on the home
 * page only, because three.js is large.
 */
@Component({
  selector: 'app-hero-scene',
  template: `
    <canvas #canvas aria-hidden="true"></canvas>
    <ul class="tags" aria-label="Key skills">
      @for (tag of tags(); track tag; let i = $index) {
        <li [style.--i]="i">{{ tag }}</li>
      }
    </ul>
  `,
  styleUrl: './hero-scene.component.scss',
})
export class HeroSceneComponent {
  /** Short skill names shown as floating chips around the globe. */
  readonly tags = input<string[]>([]);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private cleanup: (() => void)[] = [];

  constructor() {
    afterNextRender(() => this.start());
    inject(DestroyRef).onDestroy(() => this.cleanup.forEach((fn) => fn()));
  }

  private start(): void {
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: this.canvas().nativeElement, antialias: true, alpha: true });
    } catch {
      return; // No WebGL: the chips still show, the globe is simply skipped.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.cleanup.push(() => renderer.dispose());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const world = new THREE.Group();
    world.rotation.set(0.35, 0, 0.12);
    scene.add(world);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(item: T) => (disposables.push(item), item);
    this.cleanup.push(() => disposables.forEach((d) => d.dispose()));

    // --- Sphere of points (evenly spread with a Fibonacci lattice) --------------------
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const points: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const p = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS);
      points.push(p);
      p.toArray(positions, i * 3);
      GREEN.clone()
        .lerp(TEAL, (y + 1) / 2)
        .toArray(colors, i * 3);
    }
    const dotsGeometry = track(new THREE.BufferGeometry());
    dotsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dotsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const dots = new THREE.Points(
      dotsGeometry,
      track(
        new THREE.PointsMaterial({
          size: 0.034,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    world.add(dots);

    // --- Wireframe core ----------------------------------------------------------------
    const core = new THREE.LineSegments(
      track(new THREE.EdgesGeometry(track(new THREE.IcosahedronGeometry(1.15, 1)))),
      track(new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.35 })),
    );
    world.add(core);

    // --- Arcs between random points, each with a travelling pulse --------------------
    const pulseGeometry = track(new THREE.SphereGeometry(0.035, 12, 12));
    const pulseMaterial = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const arcMaterial = track(
      new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }),
    );
    const arcs: { curve: THREE.QuadraticBezierCurve3; pulse: THREE.Mesh; offset: number; speed: number }[] = [];
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; // repeatable layout
    while (arcs.length < 16) {
      const a = points[Math.floor(random() * count)];
      const b = points[Math.floor(random() * count)];
      const distance = a.distanceTo(b);
      if (distance < 1.2 || distance > 3.2) continue;
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + distance * 0.45);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      world.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))), arcMaterial));
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      world.add(pulse);
      arcs.push({ curve, pulse, offset: random(), speed: 0.12 + random() * 0.18 });
    }

    // --- Orbit rings with satellites ------------------------------------------------------
    const satellites: { mesh: THREE.Mesh; ring: THREE.Object3D; radius: number; speed: number; phase: number }[] = [];
    const ringSpecs = [
      { radius: 2.55, tilt: [1.2, 0.2, 0], color: GREEN, speed: 0.35 },
      { radius: 2.85, tilt: [1.9, -0.5, 0.3], color: TEAL, speed: -0.25 },
    ];
    for (const spec of ringSpecs) {
      const ring = new THREE.Group();
      ring.rotation.set(spec.tilt[0], spec.tilt[1], spec.tilt[2]);
      const circle = new THREE.EllipseCurve(0, 0, spec.radius, spec.radius).getPoints(128);
      ring.add(
        new THREE.LineLoop(
          track(new THREE.BufferGeometry().setFromPoints(circle.map((p) => new THREE.Vector3(p.x, p.y, 0)))),
          track(new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: 0.22 })),
        ),
      );
      const mesh = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.07, 16, 16)),
        track(new THREE.MeshBasicMaterial({ color: spec.color })),
      );
      ring.add(mesh);
      scene.add(ring);
      satellites.push({ mesh, ring, radius: spec.radius, speed: spec.speed, phase: satellites.length * 2 });
    }

    // --- Soft halo behind the globe -----------------------------------------------------
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    // Fully transparent well before the sprite edge, so the glow never shows a hard edge
    // where the canvas cuts it off.
    gradient.addColorStop(0, 'rgba(24, 210, 110, 0.35)');
    gradient.addColorStop(0.4, 'rgba(18, 179, 214, 0.12)');
    gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const halo = new THREE.Sprite(
      track(new THREE.SpriteMaterial({ map: track(new THREE.CanvasTexture(glowCanvas)), depthWrite: false })),
    );
    halo.scale.setScalar(6);
    halo.position.z = -1;
    scene.add(halo);

    // --- Sizing --------------------------------------------------------------------------
    const resize = () => {
      const { width, height } = this.host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Keep the whole globe visible on narrow (portrait) containers.
      camera.position.z = camera.aspect < 1 ? 6.4 / camera.aspect : 6.4;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(this.host);
    this.cleanup.push(() => observer.disconnect());
    resize();

    // --- Pointer: the globe leans towards the cursor --------------------------------------
    const target = { x: 0, y: 0 };
    const lean = { x: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    this.cleanup.push(() => window.removeEventListener('pointermove', onPointer));

    const render = (time: number) => {
      const t = time / 1000;
      lean.x += (target.x - lean.x) * 0.05;
      world.rotation.y = t * 0.12 + lean.x;
      world.rotation.x += (0.35 + target.y - world.rotation.x) * 0.05;
      core.rotation.y = -t * 0.25;
      core.rotation.z = t * 0.1;
      for (const arc of arcs) arc.curve.getPoint((t * arc.speed + arc.offset) % 1, arc.pulse.position);
      for (const s of satellites) {
        const angle = t * s.speed + s.phase;
        s.mesh.position.set(Math.cos(angle) * s.radius, Math.sin(angle) * s.radius, 0);
      }
      renderer.render(scene, camera);
    };

    if (prefersReducedMotion()) {
      render(4000);
      return;
    }
    renderer.setAnimationLoop(render);
    this.cleanup.push(() => renderer.setAnimationLoop(null));

    // Don't burn GPU while the tab is in the background.
    const onVisibility = () => renderer.setAnimationLoop(document.hidden ? null : render);
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanup.push(() => document.removeEventListener('visibilitychange', onVisibility));
  }
}
