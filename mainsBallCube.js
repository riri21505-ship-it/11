import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ==============================
// シーン・カメラ・レンダラー
// ==============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 4, 7);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==============================
// OrbitControls
// ==============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ==============================
// ライト・座標軸
// ==============================
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const light = new THREE.PointLight(0xffffff, 80);
light.position.set(4, 6, 5);
scene.add(light);

scene.add(new THREE.AxesHelper(5));



// ==============================
// 円形レールの作成
// ==============================

// レールの寸法
const centerRadius = 9.5;
const railWidth = 1.5;
const innerRadius = centerRadius - railWidth / 2;
const outerRadius = centerRadius + railWidth / 2;

// レールの太さ
const railThickness = 0.06;

// レールをまとめるGroup
const RailGroup = new THREE.Group();

// ==============================
// レールのマテリアル
// ==============================

const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777,
    metalness: 0.7,
    roughness: 0.4
});

// ==============================
// 内側のレール
// ==============================

const innerRailGeometry = new THREE.TorusGeometry(
    innerRadius,
    railThickness,
    12,
    100
);

const innerRail = new THREE.Mesh(
    innerRailGeometry,
    railMaterial
);

innerRail.rotation.x = Math.PI / 2;
innerRail.position.y = 0.26;

RailGroup.add(innerRail);

// ==============================
// 外側のレール
// ==============================

const outerRailGeometry = new THREE.TorusGeometry(
    outerRadius,
    railThickness,
    12,
    100
);

const outerRail = new THREE.Mesh(
    outerRailGeometry,
    railMaterial
);

outerRail.rotation.x = Math.PI / 2;
outerRail.position.y = 0.26;

RailGroup.add(outerRail);

// ==============================
// 枕木の作成
// ==============================

// 枕木の形状
const sleeperGeometry = new THREE.BoxGeometry(
    0.3,
    0.2,
    1.5
);

// 枕木の材質
const sleeperMaterial = new THREE.MeshStandardMaterial({
    color: 0x79502b
});

// 枕木の原型
const sleeperTemplate = new THREE.Mesh(
    sleeperGeometry,
    sleeperMaterial
);

// 枕木をまとめるGroup
const sleepersGroup = new THREE.Group();

// 30本の枕木を配置
for (let i = 0; i < 30; i++) {

    // 回転の中心となるGroup
    const pivot = new THREE.Group();

    // 枕木を複製
    const sleeper = sleeperTemplate.clone();

    // 円の中心から9.5離れた位置に置く
    sleeper.position.set(0, 0.1, 9.5);

    pivot.add(sleeper);

    // 12度ずつ回転
    pivot.rotation.y = i * Math.PI * 2 / 30;

    sleepersGroup.add(pivot);
}

// 枕木をレールのGroupに追加
RailGroup.add(sleepersGroup);

// シーンに追加
scene.add(RailGroup);


 // ==============================
 // Wheelクラス
 // ==============================
class Wheel extends THREE.Object3D {
    constructor(radius, width, segments, color, x, y, z) {
        super();

        const geometry = new THREE.CylinderGeometry(
            radius,
            radius,
            width,
            segments
        );

        const material = new THREE.MeshStandardMaterial({
            color: color,
            wireframe: true
        });

        const mesh = new THREE.Mesh(geometry, material);

        this.position.set(x, y, z);

        // 車輪を横向きにする
        mesh.rotation.x = Math.PI / 2;

        this.add(mesh);
    }

    // 車輪の自転
    rotateWheel(speed) {
        this.rotation.z += speed;
    }
}


// ==============================
// ToyTrainクラス
// ==============================
class ToyTrain extends THREE.Group {
    constructor() {
        super();

        // 車体
        const bodyGeometry = new THREE.BoxGeometry(3, 0.8, 1.2);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x159447
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1, 0);
        this.add(body);

        // 運転席
        const cabinGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.1);
        const cabinMaterial = new THREE.MeshPhongMaterial({
            color: 0x2030cc
        });

        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(-0.65, 2, 0);
        this.add(cabin);

        // 煙突
        const chimneyGeometry = new THREE.CylinderGeometry(
            0.18, 0.25, 0.7, 32
        );

        const chimneyMaterial = new THREE.MeshPhongMaterial({
            color: 0x493333
        });

        const chimney = new THREE.Mesh(
            chimneyGeometry,
            chimneyMaterial
        );

        chimney.position.set(0.9, 1.75, 0);
        this.add(chimney);

        // 大車輪2つ
        this.wheelBig1 = new Wheel(
            0.48, 0.18, 32, 0xff0000,
            1.0, 0.48, 0.68
        );

        this.wheelBig2 = new Wheel(
            0.48, 0.18, 32, 0xff0000,
            1.0, 0.48, -0.68
        );

        this.add(this.wheelBig1);
        this.add(this.wheelBig2);

        // 小車輪4つ
        this.wheelSmall1 = new Wheel(
            0.22, 0.14, 32, 0xff0000,
            -1.2, 0.35, 0.68
        );

        this.wheelSmall2 = new Wheel(
            0.22, 0.14, 32, 0xff0000,
            -1.2, 0.35, -0.68
        );

        this.wheelSmall3 = new Wheel(
            0.22, 0.14, 32, 0xff0000,
            -0.5, 0.35, 0.68
        );

        this.wheelSmall4 = new Wheel(
            0.22, 0.14, 32, 0xff0000,
            -0.5, 0.35, -0.68
        );

        this.add(this.wheelSmall1);
        this.add(this.wheelSmall2);
        this.add(this.wheelSmall3);
        this.add(this.wheelSmall4);
    }

    // 6つの車輪を回転させる
    rotateWheels(speed) {
        this.wheelBig1.rotateWheel(speed);
        this.wheelBig2.rotateWheel(speed);

        this.wheelSmall1.rotateWheel(speed);
        this.wheelSmall2.rotateWheel(speed);
        this.wheelSmall3.rotateWheel(speed);
        this.wheelSmall4.rotateWheel(speed);
    }
}


// ==============================
// ToyTrainを1台インスタンス化
// ==============================
const toytrain = new ToyTrain();

// ==============================
// 公転グループ
// ==============================

const orbitGroup = new THREE.Group();

// ToyTrainを公転グループに入れる
orbitGroup.add(toytrain);

// 円の中心から10だけ離す
toytrain.position.set(9.5, 0, 0);

// ★ 列車の向きを進行方向に合わせる
toytrain.rotation.y = Math.PI / 2;

// シーンに追加
scene.add(orbitGroup);
// ==============================
// アニメーション
// ==============================

function animate() {
    requestAnimationFrame(animate);

    // 公転
    orbitGroup.rotation.y += 0.01;

    // 車輪の自転
    toytrain.rotateWheels(0.1);

    controls.update();
    renderer.render(scene, camera);
}

animate();


// ==============================
// ウィンドウサイズ変更
// ==============================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});