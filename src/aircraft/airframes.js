export const AIRFRAMES = {
  interceptor: {
    name: 'PEAK INTERCEPTOR',
    maxSpeed: 560,
    acceleration: 3.0,
    turnAuthority: 1.18,
    hull: 90,
    missileCount: 10,
    color: 0x527b91,
    description: 'Fast response and strong climb; lighter protection.'
  },
  strike: {
    name: 'RIDGE STRIKER',
    maxSpeed: 470,
    acceleration: 2.45,
    turnAuthority: 0.88,
    hull: 135,
    missileCount: 8,
    color: 0x77785f,
    description: 'Balanced strike aircraft with reinforced airframe.'
  },
  scout: {
    name: 'VALLEY SCOUT',
    maxSpeed: 430,
    acceleration: 2.7,
    turnAuthority: 1.38,
    hull: 105,
    missileCount: 6,
    color: 0x66866b,
    description: 'Highly agile at low altitude; limited payload.'
  }
};

export function getAirframe(id) {
  return AIRFRAMES[id] ? { id, ...AIRFRAMES[id] } : { id: 'strike', ...AIRFRAMES.strike };
}
