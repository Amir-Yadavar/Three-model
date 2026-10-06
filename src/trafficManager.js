import * as THREE from 'three';

// تعریف مسیر مرسدس
export const mercedesPath = new THREE.CurvePath();
mercedesPath.add(new THREE.LineCurve3(new THREE.Vector3(-3, 0, -20), new THREE.Vector3(-3, 0, -2)));
mercedesPath.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-3, 0, -2), new THREE.Vector3(-3, 0, 3), new THREE.Vector3(6, 0, 3)));
mercedesPath.add(new THREE.LineCurve3(new THREE.Vector3(6, 0, 3), new THREE.Vector3(20, 0, 3)));

// تعریف مسیر ساراتوگا
export const saratogaPath = new THREE.CurvePath();
saratogaPath.add(new THREE.LineCurve3(new THREE.Vector3(-20, 0, 3), new THREE.Vector3(-1, 0, 3)));
saratogaPath.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1, 0, 3), new THREE.Vector3(3, 0, 3), new THREE.Vector3(3, 0, -1)));
saratogaPath.add(new THREE.LineCurve3(new THREE.Vector3(3, 0, -1), new THREE.Vector3(3, 0, -20)));

let progressMercedes = 0;
let progressSaratoga = 0;
const speed = 0.001;
const SARATOGA_STOP_POINT = 0.32;

// تابع اصلی به‌روزرسانی موقعیت ماشین‌ها در هر فریم
export function updateTraffic(mercedesModel, saratogaModel) {
  let isIntersectionBusy = false;

  // ۱. آپدیت مرسدس
  if (mercedesModel) {
    progressMercedes += speed;
    if (progressMercedes > 1) progressMercedes = 0;

    const currentPoint = mercedesPath.getPointAt(progressMercedes);
    const targetPoint = mercedesPath.getPointAt(Math.min(progressMercedes + 0.005, 1));

    mercedesModel.position.copy(currentPoint);
    mercedesModel.lookAt(targetPoint);
    mercedesModel.rotateY(-Math.PI / 2);

    mercedesModel.visible = !(Math.abs(currentPoint.x) > 16.5 || Math.abs(currentPoint.z) > 16.5);

    if (Math.abs(currentPoint.x) < 8 && Math.abs(currentPoint.z) < 8) {
      isIntersectionBusy = true;
    }
  }

  // ۲. آپدیت ساراتوگا
  if (saratogaModel) {
    const isAtStopLine = Math.abs(progressSaratoga - SARATOGA_STOP_POINT) < 0.01;

    if (!isAtStopLine || !isIntersectionBusy) {
      progressSaratoga += speed;
    }

    if (progressSaratoga > 1) progressSaratoga = 0;

    const currentPoint = saratogaPath.getPointAt(progressSaratoga);
    const targetPoint = saratogaPath.getPointAt(Math.min(progressSaratoga + 0.005, 1));

    saratogaModel.position.copy(currentPoint);
    saratogaModel.lookAt(targetPoint);

    saratogaModel.visible = !(Math.abs(currentPoint.x) > 16.5 || Math.abs(currentPoint.z) > 16.5);
  }
}