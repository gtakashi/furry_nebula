import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Color,
  Raycaster,
  Vector2
} from "three";

import gsap from "gsap";
import NiceColorPalette from "nice-color-palettes/200";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Furry from "./Furry";
import Floor from "./Floor";

const debug = false;

const pal = NiceColorPalette[57];

const BG = new Color(pal[0]);

export default class Stage {
  constructor() {
    this.$canvas = document.getElementById("stage");

    this.setup();
  }

  setup() {
    this.initVariables();

    this.createScene();
    this.setupDebug();
    this.setupMeshes();
    gsap.ticker.add(() => this.render());

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
    document.addEventListener("mousemove", (e) => this.onPointerMove(e));
    document.addEventListener("touchmove", (e) => this.onPointerMove(e));

    document.addEventListener("mousedown", (e) => this.onPointerDown(e));
    document.addEventListener("touchstart", (e) => this.onPointerDown(e));

    document.addEventListener("mouseup", (e) => this.onPointerUp(e));
    document.addEventListener("touchend", (e) => this.onPointerUp(e));
  }

  createScene() {
    const { W, H, PR } = window.layout;
    const fov = 50;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(fov, W / H, 0.1, 100);

    this.camera.position.set(0, 30, 0);
    this.camera.lookAt(new Vector3());

    this.renderer = new WebGLRenderer({
      canvas: this.$canvas,
      antialias: false
    });

    this.renderer.setClearColor(BG);
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(PR);
    this.renderer.autoClear = false;
  }

  setupDebug() {
    if (!debug || window.layout.isMobile) return;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.maxPolarAngle = Math.PI / 2.3;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 40;
    this.controls.update();
  }

  initVariables() {
    this.elapsedTime = 0;

    this.mouse = new Vector2();
    this.Ray = new Raycaster();
  }

  setupMeshes() {
    const s = 30;
    this.floor = new Floor({
      bg: BG,
      ball: this.ball,
      size: s,
      renderer: this.renderer,
      camera: this.camera
    });

    this.swamp = new Furry({
      bg: BG,
      size: s,
      camera: this.camera,
      tex: this.floor.bufferB.texture
    });

    this.scene.add(this.floor.mesh);
    this.scene.add(this.swamp.mesh);
  }

  /* Handelrs
    --------------------------------------------------------- */

  onResize() {
    const { W, H } = window.layout;

    this.renderer.setSize(W, H);

    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
  }

  onPointerMove(e) {
    //
  }

  onPointerDown(e) {
    //
  }

  onPointerUp(e) {
    //
  }

  /* Actions
    --------------------------------------------------------- */

  render() {
    const { renderer: R } = this;

    this.update();
    R.clear();

    R.render(this.scene, this.camera);
  }

  /* Values
    --------------------------------------------------------- */

  update() {
    this.floor.update();
    this.swamp.update();
  }
}
