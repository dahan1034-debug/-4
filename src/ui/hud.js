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
    const rwr = data.rwr?.primary
      ? `${data.rwr.alert ? '⚠ ' : ''}${data.rwr.primary.type} ${data.rwr.primary.bearing > 0 ? '+' : ''}${data.rwr.primary.bearing}° / ${Math.round(data.rwr.primary.range)}m`
      : 'CLEAR';
    const contacts = data.rwr?.contacts.length ? `CONTACTS ${data.rwr.contacts.length}` : 'CONTACTS 0';
    this.el.textContent = [
      `SPD ${Math.round(data.speed)} kt`,
      `ALT ${Math.round(data.altitude)} m`,
      `HDG ${Math.round(data.heading)}°`,
      `THR ${Math.round(data.throttle * 100)}%   AB ${data.afterburner ? 'ON' : 'OFF'}`,
      `HULL ${Math.round(data.health)}%   MISSILES ${data.missiles}`,
      `RWR ${rwr}`,
      contacts,
      `FLARES ${data.flares}`,
      `TARGET ${data.targetStatus}`,
      `SCORE ${Math.round(data.score)}`,
      `MISSION ${data.mission}`
    ].join('\n');
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
  }
}
