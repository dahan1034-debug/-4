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
    const threat = data.rwr?.primary
      ? `${data.rwr.alert ? '⚠ ' : ''}${data.rwr.primary.type} ${data.rwr.primary.bearing > 0 ? '+' : ''}${data.rwr.primary.bearing}° / ${Math.round(data.rwr.primary.range)}m`
      : 'CLEAR';
    this.el.textContent = [
      `SPD ${Math.round(data.speed)} kt   ALT ${Math.round(data.altitude)} m`,
      `HDG ${Math.round(data.heading)}°   THR ${Math.round(data.throttle * 100)}%   AB ${data.afterburner ? 'ON' : 'OFF'}`,
      `HULL ${Math.round(data.health)}%   ${data.targetStatus}`,
      `RWR ${threat}`,
      `WEAPON ${data.weaponMode}   AAM ${data.missiles}   RKT ${data.rockets}   FLR ${data.flares}`,
      `SCORE ${Math.round(data.score)}   ${data.credits} CR`,
      `AIRFRAME ${data.airframe}`,
      `MISSION ${data.mission}`
    ].join('\n');
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
  }
}
