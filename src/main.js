import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { loadModel, setupModel } from "./modelLoader";
import { createRoadMarkings } from "./roadLines";

// GUI
const gui = new GUI();

// scene --------------------------

const scene = new THREE.Scene();

// sizes ----------------------------

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// camera ----------------------------

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.set(0, 15, 20);

// renderer --------------------------

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// orbit controlls ----------------------

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.maxPolarAngle = Math.PI / 2.3;

// resize browser ---------------------

window.addEventListener("resize", (e) => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
});

//  load model -----------------------

let saratogaModel, mercedesModel;
let house_1Model, house_2Model, house_3Model, house_4Model;

//  load cars
const initCars = async () => {
  try {
    const [saratogaScene, mercedesScene] = await Promise.all([
      loadModel("./models/car/chrysler_saratoga_1960.glb"),
      loadModel("./models/car/mercedes-benz_slr_mclaren_2005.glb"),
    ]);

    saratogaModel = setupModel(
      scene,
      saratogaScene,
      0.01,
      { x: -20, y: 0, z: 3 },
      Math.PI / 2,
    );
    mercedesModel = setupModel(
      scene,
      mercedesScene,
      0.01,
      { x: -3, y: 0, z: -14 },
      0,
    );
  } catch (error) {
    console.error("error in load cars :", error);
  }
};

// load house

const initHouse = async () => {
  try {
    const [h1Base, h2Base] = await Promise.all([
      loadModel("./models/house/house_1.glb"),
      loadModel("./models/house/house_2.glb"),
    ]);

    house_1Model = setupModel(scene, h1Base, 8.5, { x: 11, y: 0, z: -12 }, 0);
    house_2Model = setupModel(scene, h2Base, 8.5, { x: -11, y: 0, z: -12 }, 0);
    house_3Model = setupModel(
      scene,
      h2Base.clone(),
      8.5,
      { x: 11, y: 0, z: 12 },
      Math.PI,
    );
    house_4Model = setupModel(
      scene,
      h1Base.clone(),
      8.5,
      { x: -11, y: 0, z: 12 },
      Math.PI,
    );
  } catch (error) {
    console.error("error in load house :", error);
  }
};

initCars();
initHouse();


// light --------------------------------------

// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// textures ------------------------------------

const textureLoader = new THREE.TextureLoader();
const asphaltTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_Color.jpg",
);
const asphaltRoughTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_Roughness.jpg",
);
const asphaltNormalTexture = textureLoader.load(
  "./img/texture/Asphalt/Asphalt026C_1K-JPG_NormalDX.jpg",
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

// create floor or planeGeometry --------------------

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


// create solid and dashed lines

createRoadMarkings(scene);

// ==========================================
// mercedes path from north to east
// ==========================================

const mercedesPath = new THREE.CurvePath();

// ۱. خط مستقیم از شمال تا ورودی چهارراه
const lineStraight = new THREE.LineCurve3(
  new THREE.Vector3(-3, 0, -20),
  new THREE.Vector3(-3, 0, -2),
);

// ۲. منحنی دور زدن به سمت خیابان شرقی (راست)
const curveTurn = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-3, 0, -2), // شروع پیچ
  new THREE.Vector3(-3, 0, 3), // نقطه اهرم و کنترل پیچ (هندل)
  new THREE.Vector3(6, 0, 3), // پایان پیچ در خیابان شرقی
);

const lineEast = new THREE.LineCurve3(
  new THREE.Vector3(6, 0, 3),
  new THREE.Vector3(20, 0, 3),
);

mercedesPath.add(lineStraight);
mercedesPath.add(curveTurn);
mercedesPath.add(lineEast);

// ==========================================
// saratogaModel path from west to north
// ==========================================

const saratogaPath = new THREE.CurvePath();

// straight path to  center avenu
const lineStraightsaratoga = new THREE.LineCurve3(
  new THREE.Vector3(-20, 0, 3),
  new THREE.Vector3(-1, 0, 3),
);

const curveTurnsaratoga = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-1, 0, 3),
  new THREE.Vector3(3, 0, 3),
  new THREE.Vector3(3, 0, -1),
);

const lineNorthsaratoga = new THREE.LineCurve3(
  new THREE.Vector3(3, 0, -1),
  new THREE.Vector3(3, 0, -20),
);

saratogaPath.add(lineStraightsaratoga);
saratogaPath.add(curveTurnsaratoga);
saratogaPath.add(lineNorthsaratoga);

// ------------------------------------------
// انیمیشن حرکت مرسدس
// ------------------------------------------
let progressMercedes = 0;
let progressSaratoga = 0;
const speed = 0.001;

const SARATOGA_STOP_POINT = 0.32;

function animate() {
  requestAnimationFrame(animate);

  // --------------------------------------------------------
  // ۱. محاسبه موقعیت لحظه‌ای مرسدس
  // --------------------------------------------------------
  let isIntersectionBusy = false;

  if (mercedesModel) {
    progressMercedes += speed;
    if (progressMercedes > 1) progressMercedes = 0;

    const currentPoint = mercedesPath.getPointAt(progressMercedes);
    const targetPoint = mercedesPath.getPointAt(
      Math.min(progressMercedes + 0.005, 1),
    );

    mercedesModel.position.copy(currentPoint);
    mercedesModel.lookAt(targetPoint);
    mercedesModel.rotateY(-Math.PI / 2);

    // کنترل دید
    if (Math.abs(currentPoint.x) > 16.5 || Math.abs(currentPoint.z) > 16.5) {
      mercedesModel.visible = false;
    } else {
      mercedesModel.visible = true;
    }


    if (Math.abs(currentPoint.x) < 8 && Math.abs(currentPoint.z) < 8) {
      isIntersectionBusy = true;
    }
  }


  if (saratogaModel) {
    const isAtStopLine =
      Math.abs(progressSaratoga - SARATOGA_STOP_POINT) < 0.01;

    if (isAtStopLine && isIntersectionBusy) {
      // ساراتوگا متوقف می‌شود (progress زیاد نمی‌شود)
    } else {
      // در غیر این صورت به حرکت خود ادامه می‌دهد
      progressSaratoga += speed;
    }

    if (progressSaratoga > 1) progressSaratoga = 0;

    const currentPoint = saratogaPath.getPointAt(progressSaratoga);
    const targetPoint = saratogaPath.getPointAt(
      Math.min(progressSaratoga + 0.005, 1),
    );

    saratogaModel.position.copy(currentPoint);
    saratogaModel.lookAt(targetPoint);

    if (Math.abs(currentPoint.x) > 16.5 || Math.abs(currentPoint.z) > 16.5) {
      saratogaModel.visible = false;
    } else {
      saratogaModel.visible = true;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
