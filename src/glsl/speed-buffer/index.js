import { ShaderMaterial } from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class CustomShaderMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      transparent: true
    });
    // this.extensions.derivatives =      '#extension GL_OES_standard_derivatives : enable'
    const { W, H } = window.layout;

    this.uniforms = {
      resolution: { value: [W, H] },
      time: { value: 0 },
      map: { value: options.map },
      bg: { value: options.bg },
      pointer: { value: [0, 0] },
      size: { value: options.size },
      speed: { value: options.speed }
    };
  }

  update() {
    this.uniforms.time.value += 0.1;
  }
}
