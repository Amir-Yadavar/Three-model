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
camera.position.set(-2, 15, -30);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// gltf
const gltfLoader = new GLTFLoader();

const loadModel = (url) => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
};

const saratogaGLTF = async () => {
  const saratogaModel = await loadModel(
    "./models/car/chrysler_saratoga_1960.glb"
  );
  saratogaModel.scale.set(0.01, 0.01, 0.01);
  saratogaModel.position.set(3, 0, 0);
  saratogaModel.rotation.y = Math.PI;

  scene.add(saratogaModel);
};
const mercedesGLTF = async () => {
  const mercedesModel = await loadModel(
    "./models/car/mercedes-benz_slr_mclaren_2005.glb"
  );
  mercedesModel.scale.set(0.01, 0.01, 0.01);
  mercedesModel.position.set(0, 0, 0);
  mercedesModel.rotation.y = Math.PI / 2;

  scene.add(mercedesModel);
};

mercedesGLTF();
saratogaGLTF();

// orbit controlls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// move camera

const speed = 0.2;

window.addEventListener("keydown", (e) => {
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  camera.getWorldDirection(forward);
  // forward.y = 0
  forward.normalize();

  right.crossVectors(forward, camera.up).normalize();

  let moveVector = new THREE.Vector3();

  switch (e.key.toLowerCase()) {
    case "w":
      moveVector.copy(forward).multiplyScalar(speed);
      break;
    case "s":
      moveVector.copy(forward).multiplyScalar(-speed);
      break;
    case "d":
      moveVector.copy(right).multiplyScalar(speed);
      break;
    case "a":
      moveVector.copy(right).multiplyScalar(-speed);
      break;
    case "q":
      moveVector.copy(camera.up).multiplyScalar(-speed);
      break;
    case "e":
      moveVector.copy(camera.up).multiplyScalar(speed);
      break;
    default:
      return;
  }

  camera.position.add(moveVector);
});

// click on model

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector3();

window.addEventListener("click", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children, true);
  console.log(hits);
});

// texture

const textureLoader = new THREE.TextureLoader();
const asphaltTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_Color.jpg"
);
const asphaltRoughTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_Roughness.jpg"
);
const asphaltNormalTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_NormalDX.jpg"
);

// access texture for repeat
asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
asphaltRoughTexture.wrapS = asphaltRoughTexture.wrapT = THREE.RepeatWrapping;
asphaltNormalTexture.wrapS = asphaltNormalTexture.wrapT = THREE.RepeatWrapping;
// repeat texture
asphaltTexture.repeat.set(6, 6); // تعداد تکرار رنگ
asphaltRoughTexture.repeat.set(6, 6); // باید با map هم‌تراز باشه
asphaltNormalTexture.repeat.set(6, 6);

asphaltTexture.colorSpace = THREE.SRGBColorSpace;

const maxAniso = renderer.capabilities.getMaxAnisotropy();
asphaltTexture.anisotropy = maxAniso;
asphaltNormalTexture.anisotropy = maxAniso;
asphaltRoughTexture.anisotropy = maxAniso;

// create floor or planeGeometry
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  map: asphaltTexture,
  roughness: asphaltRoughTexture,
  normalMap: asphaltNormalTexture,

  side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// func for create solid line for avenue
function createSolidLine(width, height, color) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const materil = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  const solidLine = new THREE.Mesh(geometry, materil);
  return solidLine;
}

const solidLine = createSolidLine(10, 0.2, 0xffffff);
solidLine.rotation.x = Math.PI / 2;
solidLine.position.y = 0.08;

const bottomRightLine = solidLine.clone();
bottomRightLine.rotation.z = Math.PI / 2;
bottomRightLine.position.z = -10;
bottomRightLine.position.x = -5;

const bottomleftLine = solidLine.clone();
bottomleftLine.rotation.z = Math.PI / 2;
bottomleftLine.position.z = -10;
bottomleftLine.position.x = 5;

const upRightLine = solidLine.clone();
upRightLine.rotation.z = Math.PI / 2;
upRightLine.position.z = 10;
upRightLine.position.x = -5;

const upleftLine = solidLine.clone();
upleftLine.rotation.z = Math.PI / 2;
upleftLine.position.z = 10;
upleftLine.position.x = 5;

const rightUpLine = solidLine.clone();
rightUpLine.position.x = -10;
rightUpLine.position.z = 5;

const rightBottomLine = solidLine.clone();
rightBottomLine.position.x = -10;
rightBottomLine.position.z = -5;

const leftUpLine = solidLine.clone();
leftUpLine.position.x = 10;
leftUpLine.position.z = 5;

const leftBottomLine = solidLine.clone();
leftBottomLine.position.x = 10;
leftBottomLine.position.z = -5;

scene.add(
  bottomRightLine,
  bottomleftLine,
  rightUpLine,
  rightBottomLine,
  upRightLine,
  upleftLine,
  leftBottomLine,
  leftUpLine
);

function createDasheLine(width, height, color) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const materil = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });

  const line = new THREE.Mesh(geometry, materil);
  line.rotation.x = -Math.PI / 2; // بخوابه روی زمین
  line.position.y = 0.01; // کمی بالاتر از زمین
  return line;
}
// dash for bottom
for (let z = -14.5; z < -5; z += 2) {
  const dashBottom = createDasheLine(1, 0.4, 0xffffff);
  dashBottom.rotation.z = Math.PI / 2;
  dashBottom.position.z = z;
  scene.add(dashBottom);
}
// dash for up
for (let z = 14.5; z > 5; z -= 2) {
  const dashUp = createDasheLine(1, 0.4, 0xffffff);
  dashUp.rotation.z = Math.PI / 2;
  dashUp.position.z = z;
  scene.add(dashUp);
}
// dash for right
for (let x = -14.5; x < -5; x += 2) {
  const dashRight = createDasheLine(1, 0.4, 0xffffff);
  dashRight.position.x = x;
  scene.add(dashRight);
}
// dash for left
for (let x = 14.5; x > 5; x -= 2) {
  const dashleft = createDasheLine(1, 0.4, 0xffffff);
  dashleft.position.x = x;
  scene.add(dashleft);
}

// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// pointLight
const pointLight = new THREE.PointLight(0xffffff, 5);
pointLight.position.set(2, 5, 2);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
// scene.add(pointLight,pointLightHelper)

// animate func

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
