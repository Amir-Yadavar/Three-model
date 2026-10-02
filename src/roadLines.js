import * as THREE from "three";

// func for create solid line for avenue

function createSolidLineSegment(width, length) {
  const geometry = new THREE.PlaneGeometry(width, length);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const line = new THREE.Mesh(geometry, material);
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.02;
  return line;
}

// func for create dashed line for avenue
function createDashSegment(width, length) {
  const geometry = new THREE.PlaneGeometry(width, length);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const dash = new THREE.Mesh(geometry, material);
  dash.rotation.x = -Math.PI / 2;
  dash.position.y = 0.01;
  return dash;
}

export function createRoadMarkings(scene) {
  [-10, 10].forEach((zPos) => {
    const leftLine = createSolidLineSegment(0.2, 10);
    leftLine.position.set(-5, 0.02, zPos);

    const rightLine = createSolidLineSegment(0.2, 10);
    rightLine.position.set(5, 0.02, zPos);

    scene.add(leftLine, rightLine);
  });

  [-10, 10].forEach((xPos) => {
    const bottomLine = createSolidLineSegment(10, 0.2);
    bottomLine.position.set(xPos, 0.02, -5);

    const topLine = createSolidLineSegment(10, 0.2);
    topLine.position.set(xPos, 0.02, 5);

    scene.add(bottomLine, topLine);
  });

  for (let z = 5.5; z <= 14.5; z += 2) {
    const dashNorth = createDashSegment(0.4, 1);
    dashNorth.position.z = z;

    const dashSouth = createDashSegment(0.4, 1);
    dashSouth.position.z = -z;

    scene.add(dashNorth, dashSouth);
  }

  for (let x = 5.5; x <= 14.5; x += 2) {
    const dashEast = createDashSegment(1, 0.4);
    dashEast.position.x = x;

    const dashWest = createDashSegment(1, 0.4);
    dashWest.position.x = -x;

    scene.add(dashEast, dashWest);
  }
}
