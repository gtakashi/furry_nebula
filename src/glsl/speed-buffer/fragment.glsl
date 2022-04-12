#define S smoothstep
uniform vec2 resolution;
uniform vec2 pointer;
uniform vec2 pPointer;
uniform vec2 size;
uniform vec2 speed;
uniform vec3 bg;
varying vec2 vUv;
uniform sampler2D map;

vec4 premultiplied_alpha(vec4 src, vec4 dst) {
    float final_alpha = src.a + dst.a * (1.0 - src.a);
    return vec4(
        (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha,
        final_alpha
    );
}

void main() {
    float st = (size.x) / 10.;
    float c = S(1., 0., length(vUv - pointer - speed) * st);

    vec4 img = (texture2D(map, vUv) * 2.) - 1.;
    img *= 0.98;

    vec4 color = premultiplied_alpha(img, vec4(1., speed * 200., 1.) * c);

    color *= 0.5;
    color += 0.5;

    gl_FragColor = color;
}
