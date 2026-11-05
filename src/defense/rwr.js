import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// A simple game-style receiver: active radars and nearby inbound missiles are reported.
export class RadarWarningReceiver {
  update(player, radarSources, incomingMissiles) {
    const contacts = [];
    const inverseRotation = player.quaternion.clone().invert();

    for (const source of radarSources) {
      if (!source.active) continue;
      const delta = source.position.clone().sub(player.position);
      if (delta.length() > source.range) continue;
      contacts.push(this.contact(player, delta, inverseRotation, source.type, false));
    }

    for (const missile of incomingMissiles) {
      const delta = missile.position.clone().sub(player.position);
      if (delta.length() > 3200) continue;
      contacts.push(this.contact(player, delta, inverseRotation, 'MISSILE', true));
    }

    contacts.sort((a, b) => Number(b.inbound) - Number(a.inbound) || a.range - b.range);
    return {
      contacts,
      alert: contacts.some(contact => contact.inbound),
      primary: contacts[0] ?? null
    };
  }

  contact(player, delta, inverseRotation, type, inbound) {
    const local = delta.clone().applyQuaternion(inverseRotation);
    const bearing = ((THREE.MathUtils.radToDeg(Math.atan2(local.x, -local.z)) + 540) % 360) - 180;
    return {
      type,
      inbound,
      bearing: Math.round(bearing),
      range: Math.round(delta.length()),
      strength: THREE.MathUtils.clamp(1 - delta.length() / (inbound ? 3200 : 2400), 0, 1)
    };
  }
}
