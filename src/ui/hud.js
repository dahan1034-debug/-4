export class HUD {
  constructor(el) {
    this.el = el;
    this.visible = true;
  }

  update(data) {
    if (!this.visible) {
      this.el.style.display = 'none';
      return;
    }

    this.el.style.display = 'block';
    const line = [
      `SPD ${Math.round(data.speed)} kt`,
      `ALT ${Math.round(data.altitude)} m`,
      `HDG ${Math.round(data.heading)}°`,
      `THR ${Math.round(data.throttle * 100)}%`,
      `AB ${data.afterburner ? 'ON' : 'OFF'}`,
      `HEALTH ${Math.round(data.health)}%`,
      `TARGET ${data.targetStatus}`,
      `SCORE ${Math.round(data.score)}`,
      `MISSION ${data.mission}`
    ].join('\n');

    this.el.innerHTML = line;
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
  }
}
