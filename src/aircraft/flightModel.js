import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { getAirframe } from './airframes.js';

export class FlightModel {
  constructor(airframe = 'strike') {
    this.speed = 220;
    this.throttle = 0.62;
    this.pitch = 0;
    this.roll = 0;
    this.yaw = 0;
    this.afterburner = false;
    this.setAirframe(airframe);
  }

  setAirframe(id) {
    this.airframe = getAirframe(id);
  }

  update(dt, input, aircraft) {
    const pitchInput = Number(input.isDown('KeyW')) - Number(input.isDown('KeyS'));
    const rollInput = Number(input.isDown('KeyA')) - Number(input.isDown('KeyD'));
    const yawInput = Number(input.isDown('KeyQ')) - Number(input.isDown('KeyE'));

    if (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) this.throttle = Math.min(1, this.throttle + dt * 0.34);
    if (input.isDown('ControlLeft') || input.isDown('ControlRight')) this.throttle = Math.max(0.1, this.throttle - dt * 0.34);

    this.afterburner = input.isDown('Space') && this.throttle > 0.7;
    const targetSpeed = 100 + this.throttle * (this.airframe.maxSpeed - 100) + (this.afterburner ? 90 : 0);
    this.speed = THREE.MathUtils.damp(this.speed, targetSpeed, this.airframe.acceleration, dt);

    const turnScale = THREE.MathUtils.clamp(this.speed / 260, 0.2, 1.25) * this.airframe.turnAuthority;
    this.pitch = THREE.MathUtils.damp(this.pitch, pitchInput * 0.7 * turnScale, 2.7, dt);
    this.roll = THREE.MathUtils.damp(this.roll, rollInput * 1.1 * turnScale, 3.1, dt);
    this.yaw = THREE.MathUtils.damp(this.yaw, yawInput * 0.45 * turnScale, 2.4, dt);

    aircraft.rotateX(this.pitch * dt);
    aircraft.rotateZ(this.roll * dt);
    aircraft.rotateY(this.yaw * dt);
    const forward = new THREE.Vector3();
    aircraft.getWorldDirection(forward);
    aircraft.position.addScaledVector(forward, this.speed * dt);
    if (this.speed < 135) aircraft.position.y -= (135 - this.speed) * dt * 0.42;
  }
}
