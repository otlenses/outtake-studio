"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `
attribute vec2 a;
varying vec2 v_uv;
void main(){ v_uv = vec2(a.x*0.5+0.5, 0.5-a.y*0.5); gl_Position = vec4(a,0.,1.); }`;

// Cover-fit the photo exactly like object-cover/object-position, then bend it
// like a glass lens around the cursor with a faint RGB split at the edge.
const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_res, u_img, u_focus, u_mouse;
uniform float u_strength;
const vec3 INK = vec3(0.043,0.043,0.047);

vec3 sampleImg(vec2 uv){
  float scale = max(u_res.x/u_img.x, u_res.y/u_img.y);
  vec2 size = u_img*scale;
  vec2 offset = (u_res-size)*u_focus;
  vec2 t = (uv*u_res - offset)/size;
  return texture2D(u_tex, clamp(t, 0.001, 0.999)).rgb;
}

void main(){
  float aspect = u_res.x/u_res.y;
  vec2 d = (v_uv - u_mouse) * vec2(aspect,1.);
  float dist = length(d);
  float radius = 0.3;
  // smoothstep needs edge0 < edge1 (reversed edges are undefined in GLSL and differ per GPU)
  float f = (1.0 - smoothstep(0., radius, dist)) * u_strength;
  vec2 dir = normalize(d + 1e-5) / vec2(aspect,1.);
  vec2 warp = (v_uv - u_mouse) * f * 0.7;      // magnify toward the centre
  float split = f * 0.03;
  vec3 col;
  col.r = sampleImg(v_uv - warp + dir*split).r;
  col.g = sampleImg(v_uv - warp).g;
  col.b = sampleImg(v_uv - warp - dir*split).b;
  // brighten the photo inside the lens so the effect reads even on dark images
  col *= 1.0 + f * 0.6;
  gl_FragColor = vec4(mix(INK, col, 0.7 + 0.3 * f), 1.);
}`;

/**
 * Liquid-glass cursor effect for the banner photo. Draws the same photo in WebGL
 * over the normal <Image>; the loop only runs while the cursor is moving/easing,
 * so it is idle (zero GPU) otherwise. Disabled on touch screens, for reduced
 * motion, and when WebGL isn't available — the plain image is the fallback.
 */
export default function BannerFX({ src, focusX, focusY }: { src: string; focusX: number; focusY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, code: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, code);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const tex = gl.createTexture();
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let strength = 0;
    let target = 0;
    let raf = 0;
    let imgW = 1;
    let imgH = 1;
    let alive = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(host.clientWidth * dpr);
      const h = Math.round(host.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = () => {
      resize();
      gl.uniform2f(u("u_res"), canvas.width, canvas.height);
      gl.uniform2f(u("u_img"), imgW, imgH);
      gl.uniform2f(u("u_focus"), focusX / 100, focusY / 100);
      gl.uniform2f(u("u_mouse"), mouse.x, mouse.y);
      gl.uniform1f(u("u_strength"), strength);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      strength += (target - strength) * 0.08;
      draw();
      const moving = Math.abs(mouse.tx - mouse.x) > 0.001 || Math.abs(mouse.ty - mouse.y) > 0.001;
      if (alive && (target > 0 || strength > 0.003 || moving)) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = host.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = (e.clientY - r.top) / r.height;
      target = 1;
      kick();
    };
    const onLeave = () => {
      target = 0;
      kick();
    };

    const img = new window.Image();
    img.onload = () => {
      if (!alive) return;
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(u("u_tex"), 0);
      draw();
      setReady(true);
      host.addEventListener("mousemove", onMove);
      host.addEventListener("mouseleave", onLeave);
      window.addEventListener("resize", draw);
    };
    img.src = src;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", draw);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, focusX, focusY]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
