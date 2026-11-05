import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { FlightModel } from './flightModel.js';
import { getAirframe } from './airframes.js';

export class PlayerAircraft {
  constructor(airframe = 'strike') {
    this.group = new THREE.Group();
    this.flight = new FlightModel(airframe);
    this.health = 100;
    this.baseMaterial = new THREE.MeshStandardMaterial({ color: 0x77785f, metalness: 0.58, roughness: 0.44 });
    this.buildBody();
    this.group.rotation.order = 'YXZ';
    this.setAirframe(airframe);
    this.group.position.set(0, 850, -900);
  }

  buildBody() {
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 7.4, 38, 12), this.baseMaterial);
    fuselage.rotation.z = Math.PI / 2;
    this.group.add(fuselage);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(5, 18, 16), new THREE.MeshStandardMaterial({ color: 0x9fd2e6, metalness: 0.7, roughness: 0.15, transparent: true, opacity: 0.8 }));
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
    const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), this.baseMaterial);
    wing.rotation.x = -Math.PI / 2;
    wing.position.y = -2;
    this.group.add(wing);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(18, 2.8, 10), this.baseMaterial);
    tail.position.set(0, 4, -16);
    this.group.add(tail);

    for (const x of [-12, 12]) {
      const engine = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 8, 12), new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.8, roughness: 0.72 }));
      engine.rotation.x = Math.PI / 2;
      engine.position.set(x, -2, 2);
      this.group.add(engine);
    }
  }

  setAirframe(id) {
    const airframe = getAirframe(id);
    this.airframe = airframe;
    this.flight.setAirframe(airframe.id);
    this.baseMaterial.color.setHex(airframe.color);
    return airframe;
  }

  update(dt, input) {
    this.flight.update(dt, input, this.group);
  }
}
