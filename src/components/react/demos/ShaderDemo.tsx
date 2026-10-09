import { useEffect, useRef } from "react";
import { useInView } from "./hooks";

const VERTEX = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENT = `
precision highp float;
uniform vec2 r;
uniform float t;
uniform vec2 m;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float map(vec3 p) {
  float d = length(p - vec3(m, 0.0)) - 0.5;
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    vec3 c = vec3(sin(t * 0.7 + f * 1.7) * 1.2, cos(t * 0.5 + f * 2.3) * 0.7, sin(t * 0.6 + f) * 0.5);
    d = smin(d, length(p - c) - 0.42, 0.6);
  }
  return d;
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  vec3 ro = vec3(0.0, 0.0, -3.2);
  vec3 rd = normalize(vec3(uv, 1.6));
  float dist = 0.0;
  bool hit = false;
  for (int i = 0; i < 64; i++) {
    float d = map(ro + rd * dist);
    if (d < 0.002) { hit = true; break; }
    dist += d;
    if (dist > 8.0) break;
  }
  vec3 col = vec3(0.078, 0.075, 0.059) + 0.05 * (uv.y + 0.5);
  if (hit) {
    vec3 p = ro + rd * dist;
    vec3 n = normal(p);
    vec3 l = normalize(vec3(0.6, 0.8, -0.5));
    float dif = max(dot(n, l), 0.0);
    float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float spec = pow(max(dot(reflect(-l, n), -rd), 0.0), 32.0);
    col = vec3(0.83, 0.25, 0.10) * (0.15 + 0.85 * dif) + fre * vec3(1.0, 0.7, 0.5) + spec * 0.5;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { started, visibleRef } = useInView(rootRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!started || !canvas) {
      return undefined;
    }

    const gl = canvas.getContext("webgl");
    if (!gl) {
      return undefined;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "r");
    const uTime = gl.getUniformLocation(program, "t");
    const uMouse = gl.getUniformLocation(program, "m");

    const pointer = { x: 0, y: 0, active: false };
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left - rect.width / 2) / rect.height) * 2;
      pointer.y = (-(event.clientY - rect.top - rect.height / 2) / rect.height) * 2;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    let smooth = { x: 0, y: 0 };
    const start = performance.now();
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visibleRef.current) {
        return;
      }

      const time = (performance.now() - start) / 1000;
      const targetX = pointer.active ? pointer.x : Math.sin(time * 0.9) * 0.9;
      const targetY = pointer.active ? pointer.y : Math.cos(time * 0.7) * 0.5;
      smooth = {
        x: smooth.x + (targetX - smooth.x) * 0.12,
        y: smooth.y + (targetY - smooth.y) * 0.12,
      };

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, smooth.x, smooth.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [started, visibleRef]);

  return (
    <div className="demo" ref={rootRef}>
      <canvas ref={canvasRef} style={{ touchAction: "pan-y" }} />
    </div>
  );
}
