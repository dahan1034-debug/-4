import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class RadarScope {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const size = Math.min(window.innerWidth * 0.22, 220);
    this.canvas.width = size;
    this.canvas.height = size;
  }

  draw(player, targets) {
    const ctx = this.ctx;
    const c = this.canvas.width / 2;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = 'rgba(8, 18, 24, 0.85)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.beginPath();
    ctx.arc(c, c, c - 8, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(120, 210, 255, 0.8)';
    ctx.stroke();

    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      ctx.arc(c, c, (c - 10) * (ring / 4), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 210, 255, 0.22)';
      ctx.stroke();
    }

    const toPixels = (x, y) => {
      const dx = x - player.x;
      const dy = y - player.y;
      const angle = player.heading + Math.PI / 2;
      const localX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const localY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
      const rangeFactor = 0.18;
      const px = c + localX * rangeFactor;
      const py = c + localY * rangeFactor;
      return { x: px, y: py };
    };

    const drawBlip = (x, y, color, radius = 3) => {
      const p = toPixels(x, y);
      if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) return;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    if (targets.sam) drawBlip(targets.sam.x, targets.sam.y, '#ff8b6c', 5);
    for (const enemy of targets.enemies || []) drawBlip(enemy.x, enemy.y, '#ff5c7a', 4);
    for (const missile of targets.missiles || []) drawBlip(missile.x, missile.y, '#ffca5a', 3);
    for (const contact of targets.contacts || []) {
      const angle = THREE.MathUtils.degToRad(contact.bearing);
      const dist = Math.min(contact.range / 2000, 0.9) * (c - 12);
      const x = c + Math.sin(angle) * dist;
      const y = c - Math.cos(angle) * dist;
      ctx.beginPath();
      ctx.fillStyle = contact.inbound ? '#ff6d76' : '#82e6ff';
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(c, 0);
    ctx.lineTo(c, this.canvas.height);
    ctx.moveTo(0, c);
    ctx.lineTo(this.canvas.width, c);
    ctx.strokeStyle = 'rgba(125, 220, 255, 0.18)';
    ctx.stroke();
  }
}
