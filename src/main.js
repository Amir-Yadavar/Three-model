import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { loadModel, setupModel } from "./modelLoader";
import { createRoadMarkings } from "./roadLines";
import { createFloor } from "./environment";
import { updateTraffic } from "./trafficManager";

// GUI & Setup
const gui = new GUI();
const scene = new THREE.Scene();

const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera & Renderer
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 20, 25);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.3;

// Lights & Environment
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

createFloor(scene, renderer);
createRoadMarkings(scene);

// Models State
let saratogaModel, mercedesModel;
let house_1Model, house_2Model, house_3Model, house_4Model;

const initCars = async () => {
  try {
    const [saratogaScene, mercedesScene] = await Promise.all([
      loadModel("./models/car/chrysler_saratoga_1960.glb"),
      loadModel("./models/car/mercedes-benz_slr_mclaren_2005.glb"),
    ]);

    saratogaModel = setupModel(scene, saratogaScene, 0.01, { x: -20, y: 0, z: 3 }, Math.PI / 2);
    mercedesModel = setupModel(scene, mercedesScene, 0.01, { x: -3, y: 0, z: -14 }, 0);
  } catch (error) {
    console.error("error in load cars :", error);
  }
};

const initHouse = async () => {
  try {
    const [h1Base, h2Base] = await Promise.all([
      loadModel("./models/house/house_1.glb"),
      loadModel("./models/house/house_2.glb"),
    ]);

    house_1Model = setupModel(scene, h1Base, 8.5, { x: 11, y: 0, z: -12 }, 0);
    house_2Model = setupModel(scene, h2Base, 8.5, { x: -11, y: 0, z: -12 }, 0);
    house_3Model = setupModel(scene, h2Base.clone(), 8.5, { x: 11, y: 0, z: 12 }, Math.PI);
    house_4Model = setupModel(scene, h1Base.clone(), 8.5, { x: -11, y: 0, z: 12 }, Math.PI);
  } catch (error) {
    console.error("error in load house :", error);
  }
};

initCars();
initHouse();

// Resize Event
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  updateTraffic(mercedesModel, saratogaModel);

  controls.update();
  renderer.render(scene, camera);
}

animate();