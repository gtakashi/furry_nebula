//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

#define S smoothstep
#define HPI 1.57079632679
#define PI 3.14159265359
#define TPI 6.28318530718

uniform float time;
uniform float size;
uniform float height;
uniform sampler2D map;

attribute float aScale;
attribute float spine;


varying vec3 vColor;
varying vec3 vPos;
varying float vSpine;
varying float vScale;

const vec3 up = vec3(0., 1., 0.);

mat4 rotation3d(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat4 scale(float x, float y, float z) {
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

/* Easing Elastic In equation */
/* Adapted from Robert Penner easing equations */
float easeElasticIn(float t) {
    if (t == 0.0) { return 0.0; }
    if (t == 1.0) { return 1.0; }
    float p = 0.3;
    float a = 1.0;
    float s = p / 4.0;
    return -(a * pow(2.0, 10.0 * (t -= 1.0)) * sin((t - s) * TPI / p));
}



void main() {
    float t = time * 0.01;
    vec4 pos = vec4(position, 0.0);
    float hh = height / 2.;


    vec4 newPos = instanceMatrix * vec4(vec3(0.), 1.);
    vPos = newPos.xyz;
    vec2 iuv = newPos.xz / size * vec2(1., -1.) + 0.5;
    vec4 img = texture2D(map, iuv);


    float nx = snoise(vec3(newPos.xz * 0.06 + vec2(t, 0.), t * 0.5));
    float nz = snoise(vec3(newPos.xz * 0.08 + t * 0.5, t * 0.8));
    float s  = aScale * 0.5 + 0.5;

    vec2 dir = img.bg * 2. - 1.;
    vec3 aX = cross(up, -up.xxy);
    vec3 aZ = cross(up, up.yxx);

    float p = dot(img.gb * 2. - 1., vec2(0.587, 0.114));

//    dir = mix(vec2(0.), dir, clamp(easeElasticIn(abs(p)) * 50., -.5, .5));


    pos.y += hh;
    pos *= scale(1., s, 1.); 
    pos *= rotation3d(aX, (nx + dir.x) * spine * spine);
    pos *= rotation3d(aZ, (nz + dir.y) * spine * spine);
    pos.y -= hh;

    newPos += pos;

    vColor = vec3(p);
    vSpine = spine;
    vScale = aScale;

    gl_Position = projectionMatrix * modelViewMatrix * newPos;
}
