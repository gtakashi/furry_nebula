import {
  Mesh,
  PlaneBufferGeometry,
  WebGLRenderTarget,
  NearestFilter,
  RGBFormat,
  Scene,
  Raycaster,
  Vector2,
  OrthographicCamera,
  MeshBasicMaterial
} from "three";

import SpeedBufferMaterial from "./glsl/speed-buffer";
import { getPos } from "./utils";

/* Floor
---------------------------------------------------------------------------------------------------- */

export default class Floor {
  constructor(...options) {
    [this.params] = options;

    const { W, H } = window.layout;
    this.renderer = this.params.renderer;
    this.camera = this.params.camera;

    this.bufferScene = new Scene();
    this.bufferCam = new OrthographicCamera(W / -2, W / 2, H / 2, H / -2, 1, 2);
    this.bufferCam.position.set(0, 0, 1);

    this.Ray = new Raycaster();
    this.mouse = new Vector2();

    this.targetUV = new Vector2();
    this.targetpUV = new Vector2();
    this.speed = new Vector2();

    this.addBuffers();

    this.mesh = new Mesh(
      new PlaneBufferGeometry(this.params.size, this.params.size),
      new MeshBasicMaterial({
        map: this.bufferB.texture,
        transparent: true,
        opacity: 0
      })
    );

    this.mesh.frustumCulled = false;
    this.mesh.rotation.x = Math.PI / -2;

    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener("mousemove", (e) => this.onPointerMove(e));
    document.addEventListener("touchmove", (e) => this.onPointerMove(e));
    window.addEventListener("resize", () => this.onResize());
  }

  addBuffers() {
    const { W, H } = window.layout;
    const renderTargetParams = {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBFormat,
      stencilBuffer: false,
      depthBuffer: false
    };

    this.bufferA = new WebGLRenderTarget(W, H, renderTargetParams);
    this.bufferB = new WebGLRenderTarget(W, H, renderTargetParams);

    this.bufferMesh = new Mesh(
      new PlaneBufferGeometry(W, H),
      new SpeedBufferMaterial({
        map: this.bufferB.texture,
        bg: this.params.bg,
        size: [this.params.size, this.params.size],
        speed: this.speed
      })
    );
    this.bufferMesh.frustumCulled = false;

    this.bufferScene.add(this.bufferMesh);
  }

  /* Handlers
    --------------------------------------------------------- */
  onPointerMove(e) {
    e.preventDefault();
    const { W, H } = window.layout;
    const { x, y } = getPos(e);

    this.mouse.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
    this.Ray.setFromCamera(this.mouse, this.camera);

    const intersect = this.Ray.intersectObject(this.mesh);

    if (intersect.length === 0) return;
    const { uv } = intersect[0];

    this.targetUV.copy(uv);
    this.bufferMesh.material.uniforms.pointer.value = this.targetUV;
  }

  onResize() {
    const { W, H } = window.layout;
    this.bufferA.setSize(W, H);
    this.bufferB.setSize(W, H);
  }

  /* Actions
    --------------------------------------------------------- */

  update() {
    const { renderer: R } = this;
    R.setRenderTarget(this.bufferA);
    R.render(this.bufferScene, this.bufferCam);
    R.setRenderTarget(null);

    this.speed.subVectors(this.targetUV, this.targetpUV);
    this.targetpUV.copy(this.targetUV);
    this.bufferMesh.material.uniforms.speed.value = this.speed;

    this.swap();
  }

  swap() {
    const temp = this.bufferB;
    this.bufferB = this.bufferA;
    this.bufferA = temp;

    this.bufferMesh.material.uniforms.map.value = this.bufferB.texture;
  }

  /* Values
    --------------------------------------------------------- */
}

/* CONSTANTS & HELPERS
---------------------------------------------------------------------------------------------------- */
