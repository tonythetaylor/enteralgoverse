import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type LivingOrbProps = {
  analyserRef: RefObject<AnalyserNode | null>;
  playing: boolean;
  reduceMotion?: boolean;
  mood?: number;
  onToggle: () => void;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObjectPosition;

  void main() {
    vec3 p = position;
    float ripple =
      sin(p.y * 11.0 + p.x * 4.0 + uTime * 0.65) *
      cos(p.z * 9.0 - p.y * 3.0 - uTime * 0.55) +
      0.35 * sin(p.x * 16.0 + p.y * 8.0 + uTime);

    // Low frequencies pulse the sphere as a whole; mids deform its surface.
    float displacement = ripple * (0.006 + uMid * 0.085)
                       + uBass * 0.024;
    vec3 displaced = p + normal * displacement;

    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    vObjectPosition = displaced;

    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uHigh;
  uniform float uMood;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vObjectPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(vView);
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.2);
    float light = max(dot(normal, normalize(vec3(-0.5, 0.85, 0.9))), 0.0);

    vec3 indigo = vec3(0.065, 0.090, 0.205);
    vec3 violet = vec3(0.48, 0.37, 0.73);
    vec3 cyan = vec3(0.45, 0.80, 0.86);
    vec3 amber = vec3(0.98, 0.67, 0.48);
    vec3 pearl = vec3(0.89, 0.84, 0.90);

    vec3 accent = mix(violet, amber, smoothstep(0.0, 1.0, uMood));
    accent = mix(accent, cyan, smoothstep(1.0, 2.0, uMood));

    float flow = sin(
      vObjectPosition.y * 5.6 +
      vObjectPosition.x * 6.2 +
      uTime * 0.21
    );
    float tide = smoothstep(-0.65, 0.9, flow);
    float vertical = smoothstep(-0.75, 0.9, vObjectPosition.y);

    vec3 color = mix(indigo, accent, 0.18 + tide * 0.58);
    color = mix(color, pearl, vertical * 0.09);
    color *= 0.38 + light * 0.77;
    color += mix(violet, cyan, 0.6) * fresnel * 0.60;

    // A few delicate highlights follow the actual upper audio frequencies.
    float micro = pow(max(0.0, sin(
      vObjectPosition.y * 24.0 +
      vObjectPosition.x * 17.0 + uTime * 0.55
    )), 12.0);
    color += pearl * micro * (0.012 + uHigh * 0.15);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function AudioSphere({
  analyserRef,
  playing,
  reduceMotion = false,
  mood = 0,
}: Omit<LivingOrbProps, "onToggle">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const levelsRef = useRef({ bass: 0, mid: 0, high: 0 });
  const speedRef = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBass: { value: 0 },
          uMid: { value: 0 },
          uHigh: { value: 0 },
          uMood: { value: 0 },
        },
        vertexShader,
        fragmentShader,
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, frameDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const delta = Math.min(frameDelta, 0.05);
    const analyser = analyserRef.current;
    const target = { bass: 0, mid: 0, high: 0 };

    if (analyser && playing && !reduceMotion) {
      if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
        dataRef.current = new Uint8Array(
          new ArrayBuffer(analyser.frequencyBinCount)
        );
      }
      const data = dataRef.current;
      analyser.getByteFrequencyData(data);
      const hertzPerBin = analyser.context.sampleRate / analyser.fftSize;

      const bandEnergy = (minimumHz: number, maximumHz: number) => {
        const start = Math.min(data.length - 1, Math.floor(minimumHz / hertzPerBin));
        const end = Math.min(data.length, Math.max(start + 1, Math.ceil(maximumHz / hertzPerBin)));
        let total = 0;
        for (let i = start; i < end; i += 1) total += data[i];
        return total / ((end - start) * 255);
      };

      target.bass = Math.min(1, bandEnergy(35, 180) * 2.0);
      target.mid = Math.min(1, bandEnergy(180, 2500) * 1.9);
      target.high = Math.min(1, bandEnergy(2500, 9000) * 2.0);
    }

    // Smooth amplitude to avoid jitter without losing beat-level response.
    const ease = 1 - Math.exp(-9 * delta);
    const levels = levelsRef.current;
    levels.bass += (target.bass - levels.bass) * ease;
    levels.mid += (target.mid - levels.mid) * ease;
    levels.high += (target.high - levels.high) * ease;

    material.uniforms.uBass.value = levels.bass;
    material.uniforms.uMid.value = levels.mid;
    material.uniforms.uHigh.value = levels.high;
    material.uniforms.uMood.value +=
      (mood - material.uniforms.uMood.value) * (1 - Math.exp(-1.6 * delta));

    const wantedSpeed = playing && !reduceMotion ? 0.19 : 0;
    speedRef.current += (wantedSpeed - speedRef.current) * (1 - Math.exp(-6 * delta));
    mesh.rotation.y += speedRef.current * delta;
    mesh.rotation.z += speedRef.current * delta * 0.12;
    material.uniforms.uTime.value += speedRef.current > 0.001 ? delta : 0;

    mesh.scale.setScalar(1 + levels.bass * 0.075);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 112, 80]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function LivingOrb({
  analyserRef,
  playing,
  reduceMotion = false,
  mood = 0,
  onToggle,
}: LivingOrbProps) {
  return (
    <button
      type="button"
      className="av-living-orb"
      onClick={onToggle}
      aria-label={playing ? "Pause music" : "Play music"}
    >
      <span className="av-orb-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 3.45], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          style={{ pointerEvents: "none" }}
          fallback={<span className="av-orb-fallback" />}
        >
          <AudioSphere
            analyserRef={analyserRef}
            playing={playing}
            reduceMotion={reduceMotion}
            mood={mood}
          />
        </Canvas>
      </span>
      <span className="av-orb-hint">{playing ? "TAP TO PAUSE" : "TAP TO PLAY"}</span>
    </button>
  );
}
