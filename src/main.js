import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = -15;
camera.position.y = 8;
camera.position.x = 0;
const gridHelper = new THREE.GridHelper(15, 15, 0xfff);

// cube or object
const geometry = new THREE.BoxGeometry(1, 1, 1);
// meshBasicMaterial
// const material = new THREE.MeshBasicMaterial({color:0x0000ff})

// meshPhongMaterial
// const material = new THREE.MeshPhongMaterial({
//   color: 0x0000ff,
//   specular: 0xffffff,
//   shininess: 200,
// });

// move camera
const speed = 0.1;

document.addEventListener("keydown", (e) => {
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  camera.getWorldDirection(forward);

  right.crossVectors(forward, camera.up);

  switch (e.key) {
    case "w":
      {
        camera.position.addScaledVector(forward, speed);
        controls.target.addScaledVector(forward, speed);
      }
      break;
    case "s":
      {
        camera.position.addScaledVector(forward, -speed);
        controls.target.addScaledVector(forward, -speed);
      }
      break;
    case "d":
      {
        camera.position.addScaledVector(right, speed);
        controls.target.addScaledVector(right, speed);
      }
      break;
    case "a":
      {
        camera.position.addScaledVector(right, -speed);
        controls.target.addScaledVector(right, -speed);
      }
      break;

    default:
      break;
  }
});

// meshStandardMaterial
const material = new THREE.MeshStandardMaterial({
  color: 0x44aa88,
  metalness: 0.8,
  roughness: 0.2,
});
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
// scene.add(cube);

// texture
const textureLoader = new THREE.TextureLoader();
const woodGrayTexture = textureLoader.load(
  "/img/texture/Wood034_1K-JPG_Color.jpg"
);
const woodGrayRoughnessTexture = textureLoader.load(
  "/img/texture/Wood034_1K-JPG_Roughness.jpg"
);
const woodGrayNormalTexture = textureLoader.load(
  "/img/texture/Wood034_1K-JPG_NormalDX.jpg"
);
const meatTexture = textureLoader.load("/img/texture/meat.jpg");

// 3D models
const gltfLoader = new GLTFLoader();
gltfLoader.load("./models/burger.glb", (gltf) => {
  const orginalModel = gltf.scene;

  function createBurger(position, rotation) {
    const model = orginalModel.clone();
    model.position.copy(position);
    model.rotation.y = rotation;

    return model;
  }

  const burger1 = createBurger(new THREE.Vector3(0, 0, 0), Math.PI / 2);
  const burger2 = createBurger(new THREE.Vector3(2.5, 0, -2.2), Math.PI);
  const burger3 = createBurger(new THREE.Vector3(-2.3, 0, -2.2), Math.PI);
  scene.add(burger1, burger2, burger3);

  // model.traverse((child) => {
  //   if (child.name === "Cylinder_3") {
  //     child.material = new THREE.MeshStandardMaterial({
  //       map: meatTexture,
  //       // roughness: woodGrayRoughnessTexture,
  //       normalMap: woodGrayNormalTexture,
  //     });
  //   }
  // });
});

// light switch
gltfLoader.load("./models/light_switch.glb", (gltf) => {
  const model = gltf.scene;
  model.scale.set(4, 4, 4);
  model.rotateY(Math.PI);
  model.position.set(0, 2, 9.9);
  scene.add(model);

  model.traverse((child) => {
    console.log(child)
    if (child.name === "light_switch") {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
    }
  });
});

// create wall
const wallHeight = 3;
const wallGeometry = new THREE.BoxGeometry(20, wallHeight, 0.2);
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 2,
});

const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
frontWall.position.set(0, wallHeight / 2, 10);

const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
backWall.position.set(0, wallHeight / 2, -10);

const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.rotation.y = Math.PI / 2;
rightWall.position.set(10, wallHeight / 2, 0);

const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.s;
leftWall.position.set(-10, wallHeight / 2, 0);

scene.add(frontWall, backWall, rightWall, leftWall);

// create roof

const roofGeometry = new THREE.PlaneGeometry(19.8, 19.8);
// const roofMaterial = new THREE.MeshStandardMaterial({
//   color: 0xcccccc,
//   roughness: 2,
//   side: THREE.DoubleSide,
// });
const roofMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xcccccc,
  metalness: 0,
  roughness: 0,
  transmission: 1,
  thickness: 0.5,
  opacity: 2,
  ior: 1, // ضریب شکست نور شیشه
  clearcoat: 0,
  clearcoatRoughness: 0,
  side: THREE.DoubleSide,
});
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.rotation.x = -Math.PI / 2;
roof.position.y = wallHeight;
scene.add(roof);

// floor geometry
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: woodGrayTexture,
  roughness: woodGrayRoughnessTexture,
  normalMap: woodGrayNormalTexture,
  side: THREE.DoubleSide,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ambientLight
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// pointLight
// const pointLight = new THREE.PointLight(0xffffff,2,0)
// pointLight.position.set(2,2,2)
// const pointLightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(pointLight,pointLightHelper)

// directionalLight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
directionalLight.position.set(0, 5, 0);
scene.add(directionalLight, directionalLightHelper);

// spotLight
// const spotLight = new THREE.SpotLight(0xffffff, 1, 0,Math.PI / 3);
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// spotLight.position.set(10,20,10);
// spotLight.target.position.set(0,0,0)
// scene.add(spotLight,spotLight.target, spotLightHelper);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
// controls.dampingFactor = 0.3

document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();
