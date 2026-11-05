import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { FlightModel } from './flightModel.js';

export class PlayerAircraft {
  constructor() {
    this.group = new THREE.Group();
    this.flight = new FlightModel();
    this.health = 100;
    this.maxHealth = 100;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d667a,
      metalness: 0.65,
      roughness: 0.45
    });

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 7.4, 38, 12), bodyMaterial);
    fuselage.rotation.z = Math.PI / 2;
    this.group.add(fuselage);

    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(5, 18, 16),
      new THREE.MeshStandardMaterial({ color: 0x9fd2e6, metalness: 0.7, roughness: 0.15, transparent: true, opacity: 0.8 })
    );
    cockpit.scale.set(1.2, 0.7, 1.6);
    cockpit.position.set(0, 5, 3);
    this.group.add(cockpit);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(-6, 0);
    wingShape.lineTo(-30, 8);
    wingShape.lineTo(-20, 14);
    wingShape.lineTo(-4, 10);
    wingShape.lineTo(4, 10);
    wingShape.lineTo(20, 14);
    wingShape.lineTo(30, 8);
    wingShape.lineTo(6, 0);
    wingShape.closePath();

    const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), bodyMaterial);
    wing.rotation.x = -Math.PI / 2;
    wing.position.set(0, -2, 0);
    this.group.add(wing);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(18, 2.8, 10), bodyMaterial);
    tail.position.set(0, 4, -16);
    this.group.add(tail);

    const engineLeft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 8, 12), new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.8, roughness: 0.72 }));
    engineLeft.rotation.x = Math.PI / 2;
    engineLeft.position.set(-12, -2, 2);
    this.group.add(engineLeft);

    const engineRight = engineLeft.clone();
    engineRight.position.x = 12;
    this.group.add(engineRight);

    this.group.position.set(0, 850, -900);
    this.group.rotation.order = 'YXZ';
  }

  update(dt, input) {
    this.flight.update(dt, input, this.group);
  }
}
