import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
    setupCarModel(saratogaModel, 0.01, { x: -11, y: 0, z: 3 }, Math.PI / 2);

    mercedesModel = mercedesScene;
    setupCarModel(mercedesModel, 0.01, { x: -3, y: 0, z: -14 }, 0);
  } catch (error) {
    console.error("خطا در بارگذاری مدل‌های سه بعدی:", error);
  }
};

initCars();
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
// مسیر یکپارچه مرسدس (از شمال به شرق)
// ==========================================

const mercedesPath = new THREE.CurvePath();

// ۱. خط مستقیم از شمال تا ورودی چهارراه
const lineStraight = new THREE.LineCurve3(
  new THREE.Vector3(-3, 0, -14),
  new THREE.Vector3(-3, 0, -2)
);

// ۲. منحنی دور زدن به سمت خیابان شرقی (راست)
const curveTurn = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-3, 0, -2), // شروع پیچ
  new THREE.Vector3(-3, 0, 3),  // نقطه اهرم و کنترل پیچ (هندل)
  new THREE.Vector3(6, 0, 3)    // پایان پیچ در خیابان شرقی
);

// ۳. حرکت مستقیم تا انتهای خیابان شرقی (اصلاحیه جدید)
const lineEast = new THREE.LineCurve3(
  new THREE.Vector3(6, 0, 3),
  new THREE.Vector3(15, 0, 3)   // تا انتها خیابان شرقی
);

// اتصال دو مسیر به یک ریل یکپارچه
mercedesPath.add(lineStraight);
mercedesPath.add(curveTurn);
mercedesPath.add(lineEast);

// ------------------------------------------
// خط دیباگ (نمایش مسیر قرمز رنگ)
// ------------------------------------------
const pathPoints = mercedesPath.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const debugPath = new THREE.Line(pathGeometry, pathMaterial);
scene.add(debugPath);

// ------------------------------------------
// انیمیشن حرکت مرسدس
// ------------------------------------------
let progressMercedes = 0;
const speed = 0.0010; // سرعت حرکت روی مسیر (قابل تنظیم)

function animate() {
  requestAnimationFrame(animate);

  if (mercedesModel) {
    // ۱. پیشروی روی مسیر (Loop شدن حرکت)
    progressMercedes += speed;
    if (progressMercedes > 1) progressMercedes = 0; // وقتی رسید تهش، دوباره از اول بیاد

    // ۲. محاسبه نقطه فعلی و نقطه یک قدم بعد
    const currentPoint = mercedesPath.getPointAt(progressMercedes);
    // point کمی جلوتر برای این که ماشین بفهمه رو به کجاست
    const nextPointIndex = Math.min(progressMercedes + 0.005, 1);
    const targetPoint = mercedesPath.getPointAt(nextPointIndex);

    // ۳. تغییر موقعیت ماشین
    mercedesModel.position.copy(currentPoint);

    // ۴. نگاه کردن ماشین به نقطه بعدی مسیر
    mercedesModel.lookAt(targetPoint);
    mercedesModel.rotateY(-Math.PI / 2);
    // اگر محور جلو مدل ماشین شما اشتباه بود، اصلاح زاویه فقط با این خط انجام میشه:
    // mercedesModel.rotateY(Math.PI / 2); 
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
