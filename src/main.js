import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui"

// GUI
const gui =new GUI()


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

// gltf loader and load model ---------------

const gltfLoader = new GLTFLoader();

// Promisified load function
const loadModel = (url) => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error),
    );
  });
};

let saratogaModel, mercedesModel;

const setupCarModel = (model, scale, position, rotationY) => {
  model.scale.set(scale, scale, scale);
  model.position.set(position.x, position.y, position.z);
  model.rotation.y = rotationY;

  // فعال‌سازی سایه‌ها برای تمام اجزای ماشین
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(model);
};

const initCars = async () => {
  try {
    const [saratogaScene, mercedesScene] = await Promise.all([
      loadModel("./models/car/chrysler_saratoga_1960.glb"),
      loadModel("./models/car/mercedes-benz_slr_mclaren_2005.glb"),
    ]);

    saratogaModel = saratogaScene;
    setupCarModel(saratogaModel, 0.01, { x: -20, y: 0, z: 3 }, Math.PI / 2);

    mercedesModel = mercedesScene;
    setupCarModel(mercedesModel, 0.01, { x: -3, y: 0, z: -14 }, 0);
  } catch (error) {
    console.error("خطا در بارگذاری مدل‌های سه بعدی:", error);
  }
};

initCars();

// load house

let house_1;

const initHouse = async () => {
  try {
    const [house_scene] = await Promise.all([
      loadModel("./models/house/house_1.glb"),
    ]);

    house_1 = house_scene;
    scene.add(house_1)

    gui.add(house_1.position , "x").min(0).max(10).step(0.01)
    gui.add(house_1.position , "z").min(0).max(10).step(0.01)
  } catch (error) {
    console.log(error);
  }
};

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

// func for create solid line for avenue ----------------------

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

// dashed line ----------------------------------

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

// نقطه خط ایست ساراتوگا قبل از چهارراه (مثلاً ۵۰٪ مسیرش)
// این نقطه دقیقاً جایی است که ماشین پشت خط کشی ایست می‌افتد
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

    // بررسی: آیا مرسدس الان داخل حریم مرکز چهارراه است؟
    // (محدوده بین x:-8 تا 8 و z:-8 تا 8)

    if (Math.abs(currentPoint.x) < 8 && Math.abs(currentPoint.z) < 8) {
      isIntersectionBusy = true;
    }
  }

  //  انیمیشن ساراتوگا (با منطق حق تقدم و خط ایست)

  if (saratogaModel) {
    // اگر ساراتوگا نزدیک ورودی چهارراه رسیده و چهارراه پر است -> بایستد
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
