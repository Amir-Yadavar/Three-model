import GUI from "lil-gui";
import * as THREE from "three";
// GUI & Setup
const gui = new GUI();
export function createFloor(scene, renderer) {
  const textureLoader = new THREE.TextureLoader();

  //   asphalt texture
  const asphaltTexture = textureLoader.load(
    "./img/texture/Asphalt/Asphalt026C_1K-JPG_Color.jpg",
  );
  const asphaltRoughTexture = textureLoader.load(
    "./img/texture/Asphalt/Asphalt026C_1K-JPG_Roughness.jpg",
  );
  const asphaltNormalTexture = textureLoader.load(
    "./img/texture/Asphalt/Asphalt026C_1K-JPG_NormalDX.jpg",
  );

  //  grass texture
  const grassTexture = textureLoader.load(
    "./img/texture/grass/Grass007_1K-JPG_Color.jpg",
  );
  const grassTextureRoughness = textureLoader.load(
    "./img/texture/grass/Grass007_1K-JPG_Roughness.jpg",
  );
  const grassTextureNormal = textureLoader.load(
    "./img/texture/grass/Grass007_1K-JPG_NormalGL.jpg",
  );

  [(asphaltTexture, asphaltRoughTexture, asphaltNormalTexture)].forEach(
    (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      if (renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    },
  );

  asphaltTexture.colorSpace = THREE.SRGBColorSpace;

  //   create asphalt plane
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: asphaltTexture,
    roughnessMap: asphaltRoughTexture,
    normalMap: asphaltNormalTexture,
    side: THREE.DoubleSide,
  });

  const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  //   create grass palne
  const grassPlaneGeometry = new THREE.PlaneGeometry(9.5, 9.5);
  const grassPlaneMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    normalMap: grassTextureNormal,
    roughnessMap: grassTextureRoughness,
  });

  const housePositions = [
    { x: 10, z: -10 },
    { x: -10, z: -10 },
    { x: 10, z: 10 },
    { x: -10, z: 10 },
  ];

  housePositions.forEach((pos) => {
    const grassMesh = new THREE.Mesh(grassPlaneGeometry, grassPlaneMaterial);
    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.position.set(pos.x, 0.01, pos.z);
    scene.add(grassMesh);
  });


  return floor;
}
