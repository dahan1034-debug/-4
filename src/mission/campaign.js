import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class CampaignSystem {
  constructor(stage = 0) {
    this.missions = [
      {
        id: 'mountain-shield',
        name: 'MOUNTAIN SHIELD',
        briefing: 'Destroy the SAM radar site, then return to the forward runway.',
        requiresSAM: true,
        requiredInterceptors: 0,
        reward: 30
      },
      {
        id: 'falcon-hunt',
        name: 'FALCON HUNT',
        briefing: 'Eliminate both hostile interceptors, then return to base.',
        requiresSAM: false,
        requiredInterceptors: 2,
        reward: 40
      },
      {
        id: 'storm-breaker',
        name: 'STORM BREAKER',
        briefing: 'Destroy the SAM site and both interceptors, then return to base.',
        requiresSAM: true,
        requiredInterceptors: 2,
        reward: 60
      }
    ];
    this.stage = THREE.MathUtils.clamp(Math.floor(stage || 0), 0, this.missions.length - 1);
  }

  current() {
    return this.missions[this.stage];
  }

  objectiveComplete(samAlive, interceptorKills) {
    const mission = this.current();
    return (!mission.requiresSAM || !samAlive) && interceptorKills >= mission.requiredInterceptors;
  }

  advance() {
    if (this.stage < this.missions.length - 1) {
      this.stage += 1;
      return this.current();
    }
    return null;
  }

  restartCampaign() {
    this.stage = 0;
    return this.current();
  }
}
