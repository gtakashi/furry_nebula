import {
  CylinderBufferGeometry,
  Object3D,
  InstancedBufferGeometry,
  InstancedMesh,
  MathUtils,
  InstancedBufferAttribute,
  Float32BufferAttribute
} from "three";
import Furrymaterial from "./glsl/furry-material";

const dummy = new Object3D();
const count = 100;

/* SWAMP
---------------------------------------------------------------------------------------------------- */

export default class Furry {
  constructor(...options) {
    [this.params] = options;
    this.params.height = 3;

    const spine = [];
    const geom = new CylinderBufferGeometry(
      0.03,
      0.03,
      this.params.height,
      8,
      16
    );
    const material = new Furrymaterial({
      bg: this.params.bg,
      height: this.params.height,
      map: this.params.tex,
      size: this.params.size
    });

    const { position } = geom.attributes;

    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const p = (y + this.params.height / 2) / this.params.height;

      spine.push(p);
    }

    const instanceGeom = new InstancedBufferGeometry().copy(geom);
    const scales = [];

    this.mesh = new InstancedMesh(instanceGeom, material, count ** 2);

    let cpt = 0;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const x = MathUtils.randFloatSpread(this.params.size);
        const y = this.params.height / 2;
        const z = MathUtils.randFloatSpread(this.params.size);

        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        scales.push(Math.random());

        this.mesh.setMatrixAt(cpt, dummy.matrix);
        cpt += 1;
      }
    }

    this.mesh.geometry.setAttribute(
      "aScale",
      new InstancedBufferAttribute(new Float32Array(scales), 1)
    );
    this.mesh.geometry.setAttribute(
      "spine",
      new Float32BufferAttribute(spine, 1)
    );

    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.frustumCulled = false;
  }

  /* Handlers
    --------------------------------------------------------- */

  /* Actions
    --------------------------------------------------------- */

  /* Values
    --------------------------------------------------------- */

  update() {
    this.mesh.material.update();
  }
}

/* CONSTANTS & HELPERS
---------------------------------------------------------------------------------------------------- */
