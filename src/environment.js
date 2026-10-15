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

  // stone floor

  const stoneFloorTexture = textureLoader.load(
    "./img/texture/Paving_stones/PavingStones138_1K-JPG_Color.jpg",
  );
  const stoneFloorTextureRoughness = textureLoader.load(
    "./img/texture/Paving_stones/PavingStones138_1K-JPG_Roughness.jpg",
  );
  const stoneFloorTextureNormal = textureLoader.load(
    "./img/texture/Paving_stones/PavingStones138_1K-JPG_NormalGL.jpg",
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

  // create stone floor
  const stoneFloorPlaneGeometry = new THREE.PlaneGeometry(2.5, 4);
  const stoneFloorMaterial = new THREE.MeshStandardMaterial({
    map: stoneFloorTexture,
    normalMap: stoneFloorTextureNormal,
    roughnessMap: stoneFloorTextureRoughness,
  });

  const stoneFloorPositon = [
    { x: 12.5, z: -7.5 },
    { x: 9.5, z: 7.5 },
    { x: -9.5, z: -7.5 },
    { x: -12.5, z: 7.5 },
  ];

  stoneFloorPositon.forEach((pos) => {
    const stoneFloor = new THREE.Mesh(
      stoneFloorPlaneGeometry,
      stoneFloorMaterial,
    );
    stoneFloor.rotation.x = -Math.PI / 2;
    stoneFloor.position.set(pos.x, 0.02, pos.z);
    scene.add(stoneFloor);
  });


  return floor;
}
