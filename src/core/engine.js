import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class Engine {
  constructor(mountEl) {
    this.mount = mountEl;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x90b7cf);
    this.scene.fog = new THREE.Fog(0x90b7cf, 500, 18000);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 40000);
    this.camera.position.set(0, 110, 350);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.mount.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.running = false;
    this.updateCallback = () => {};
    this.frameId = 0;

    this.input = new InputController();
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);

    this.resize();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setUpdate(callback) {
    this.updateCallback = callback;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.tick();
  }

  tick = () => {
    if (!this.running) return;

    const dt = Math.min(this.clock.getDelta(), 0.033);
    this.updateCallback(dt, this.input);
    this.input.consumePressed();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

class InputController {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();

    window.addEventListener('keydown', (event) => {
      if (!this.keys.has(event.code)) this.pressed.add(event.code);
      this.keys.add(event.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  isPressed(code) {
    return this.pressed.has(code);
  }

  consumePressed() {
    this.pressed.clear();
  }
}
