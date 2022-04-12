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

    const { W, H } = window.layout;

    this.uniforms = {
      resolution: { value: [W, H] },
      time: { value: 0 },
      height: { value: options.height },
      map: { value: options.map },
      bg: { value: options.bg },
      pointer: { value: [0, 0] },
      size: { value: options.size }
    };
  }

  update() {
    this.uniforms.time.value += 0.1;
  }
}
