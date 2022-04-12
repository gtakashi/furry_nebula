#define S smoothstep
uniform vec3 bg;
uniform sampler2D map;
uniform float time;

varying vec3 vColor;
varying vec3 vPos;
varying float vSpine;
varying float vScale;


void main() {
    float t = sin(time * 0.8 + vScale * 3150.) * 0.5 + 0.5;
    t *= vScale;
    vec3 col = vec3(0.2, 0.4, 0.9);
    col = mix(bg, col, vSpine);

    vec3 c = abs(vColor) + col * 0.1 + step(0.99, vSpine) * t;

    col += clamp(c, 0., 1.);

    float dist = length(vPos) * 0.07;
    dist = pow(dist, 3.);
    col = mix(col, bg, dist);

    if (dist > 1.) discard;

    gl_FragColor = vec4(col, 1.);
}
