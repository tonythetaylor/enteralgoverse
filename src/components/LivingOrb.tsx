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

// Orb sizing and animation configuration
const ORB_RADIUS = 0.92;
const MAX_PULSE_SCALE = 0.045;
const CAMERA_DISTANCE = 3.7;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uBeat;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    vec3 p = position;

    float undulation =
      sin(p.y * 5.8 + p.x * 3.1 + uTime * 1.25) *
      cos(p.z * 4.0 - p.x * 2.1 - uTime * 0.93);

    float crest =
      sin(p.y * 10.0 + p.z * 5.6 + uTime * 1.7) *
      sin(p.x * 7.9 - p.y * 2.5 - uTime * 1.05);

    // Fast surface fluctuations responding to rhythmic accents.
    float beatWave =
      sin(p.y * 13.0 - uTime * 3.1 + p.z * 7.0) *
      cos(p.x * 10.0 + uTime * 1.7);

    // Audio drives local deformation rather than enlarging
    // the entire sphere.
    float deformation =
        undulation * (0.018 + uMid * 0.065)
      + crest * (0.008 + uMid * 0.030)
      + beatWave * (0.009 + uBeat * 0.055)
      + uBass * 0.012;

    vec3 deformed = p + normal * deformation;

    vec4 eyePosition =
      modelViewMatrix * vec4(deformed, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-eyePosition.xyz);
    vPosition = deformed;

    gl_Position = projectionMatrix * eyePosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uMood;
  uniform float uBeat;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 view = normalize(vView);

    float ndv = max(dot(n, view), 0.0);
    float fresnel = pow(1.0 - ndv, 2.7);

    float diffuse = max(
      dot(n, normalize(vec3(-0.48, 0.75, 1.18))),
      0.0
    );

    vec3 midnight = vec3(0.018, 0.020, 0.082);
    vec3 deepViolet = vec3(0.115, 0.075, 0.255);
    vec3 electricLilac = vec3(0.67, 0.39, 1.0);
    vec3 iceBlue = vec3(0.30, 0.70, 1.0);
    vec3 palePink = vec3(0.98, 0.71, 0.98);

    // Luminous ribbons remain expressive during playback.
    float fold =
      vPosition.y * 10.8 +
      sin(vPosition.x * 4.3 + uTime * 0.74) * 2.1 +
      vPosition.z * 4.5 +
      uTime * 0.63;

    float ribbon = sin(fold);

    float filament = pow(
      max(0.0, 1.0 - abs(ribbon)),
      12.0
    );

    float veil = pow(
      max(
        0.0,
        0.5 + 0.5 * sin(fold * 0.52 + 1.6)
      ),
      2.4
    );

    float ribbonTwo = pow(
      max(
        0.0,
        1.0 - abs(
          sin(
            vPosition.y * 7.7 -
            vPosition.x * 3.8 +
            sin(vPosition.z * 5.0 + uTime) * 1.1 -
            uTime * 0.54
          )
        )
      ),
      16.0
    );

    float blueSide = smoothstep(
      -0.5,
      0.95,
      sin(
        vPosition.x * 3.4 -
        vPosition.z * 3.6 +
        uTime * 0.25 +
        uMood
      )
    );

    vec3 color = mix(
      midnight,
      deepViolet,
      0.55 + diffuse * 0.22
    );

    color += electricLilac * veil *
      (0.18 + diffuse * 0.22);


    // Purple and cyan filaments brighten during beats.
    color += mix(
      electricLilac,
      iceBlue,
      blueSide
    ) * filament *
      (0.48 + uMid * 0.65 + uHigh * 0.35 + uBeat * 0.75);

    // Pink accents flash during stronger musical peaks.
    color += palePink * ribbonTwo *
      (0.22 + uHigh * 0.25 + uBeat * 0.65);

    color += iceBlue * fresnel *
      (0.56 + uBass * 0.32);

    color += electricLilac *
      pow(fresnel, 2.0) * 0.46;

    color *= 0.7 + diffuse * 0.46;

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

  const levelsRef = useRef({
    bass: 0,
    mid: 0,
    high: 0,
  });

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
          uBeat: { value: 0 },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  );

  const beatRef = useRef(0);
  const bassBaselineRef = useRef(0);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame((_, frameDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const delta = Math.min(frameDelta, 0.05);
    const analyser = analyserRef.current;

    const target = {
      bass: 0,
      mid: 0,
      high: 0,
    };

    if (analyser && playing && !reduceMotion) {
      if (
        !dataRef.current ||
        dataRef.current.length !== analyser.frequencyBinCount
      ) {
        dataRef.current = new Uint8Array(
          new ArrayBuffer(analyser.frequencyBinCount),
        );
      }

      const data = dataRef.current;
      analyser.getByteFrequencyData(data);

      const hertzPerBin = analyser.context.sampleRate / analyser.fftSize;

      const bandEnergy = (minimumHz: number, maximumHz: number) => {
        const start = Math.min(
          data.length - 1,
          Math.floor(minimumHz / hertzPerBin),
        );

        const end = Math.min(
          data.length,
          Math.max(start + 1, Math.ceil(maximumHz / hertzPerBin)),
        );

        let total = 0;

        for (let i = start; i < end; i += 1) {
          total += data[i];
        }

        return total / ((end - start) * 255);
      };

      target.bass = Math.min(1, bandEnergy(35, 180) * 2.35);

      target.mid = Math.min(1, bandEnergy(180, 2500) * 2.05);

      target.high = Math.min(1, bandEnergy(2500, 9000) * 2.0);
    }

    const levels = levelsRef.current;

    // Fast attack for beats, slower release.
    const bassEase =
      1 - Math.exp(-(target.bass > levels.bass ? 19 : 6) * delta);

    const midEase = 1 - Math.exp(-11 * delta);
    const highEase = 1 - Math.exp(-14 * delta);

    levels.bass += (target.bass - levels.bass) * bassEase;

    levels.mid += (target.mid - levels.mid) * midEase;

    levels.high += (target.high - levels.high) * highEase;

    // Slowly track the average bass energy.
    // Fast peaks above that average indicate rhythmic accents.
    const baselineEase = 1 - Math.exp(-1.15 * delta);

    const baseline = bassBaselineRef.current;

    const beatTarget =
      playing && !reduceMotion
        ? THREE.MathUtils.clamp((target.bass - baseline) * 5.5, 0, 1)
        : 0;

    bassBaselineRef.current += (target.bass - baseline) * baselineEase;

    // Fast attack, slower decay.
    // This creates an intentional musical impact rather than jitter.
    const beatEase =
      1 - Math.exp(-(beatTarget > beatRef.current ? 28 : 7) * delta);

    beatRef.current += (beatTarget - beatRef.current) * beatEase;

    material.uniforms.uBeat.value = beatRef.current;
    material.uniforms.uBass.value = levels.bass;
    material.uniforms.uMid.value = levels.mid;
    material.uniforms.uHigh.value = levels.high;

    material.uniforms.uMood.value +=
      (mood - material.uniforms.uMood.value) * (1 - Math.exp(-1.6 * delta));

    // Rotation remains expressive without changing orb size.
    const wantedSpeed =
      playing && !reduceMotion ? 0.72 + levels.bass * 0.38 : 0;

    speedRef.current +=
      (wantedSpeed - speedRef.current) * (1 - Math.exp(-6 * delta));

    mesh.rotation.y += speedRef.current * delta;
    mesh.rotation.z += speedRef.current * delta * 0.21;

    if (playing && !reduceMotion) {
      const tilt = 0.22 * Math.sin(material.uniforms.uTime.value * 0.78);

      mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, tilt, 1.1, delta);
    }

    if (speedRef.current > 0.001) {
      material.uniforms.uTime.value += delta;
    }

    // Controlled audio-reactive scale.
    // Maximum growth is 4.5%, not 16%+.
    const targetScale =
      playing && !reduceMotion
        ? 1 + Math.min(0.025, levels.bass * 0.012 + beatRef.current * 0.014)
        : 1;

    const smoothScale = THREE.MathUtils.damp(
      mesh.scale.x,
      targetScale,
      11,
      delta,
    );

    mesh.scale.setScalar(smoothScale);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[ORB_RADIUS, 112, 80]} />

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
      className={`av-living-orb ${
        playing && !reduceMotion ? "is-playing" : ""
      }`}
      onClick={onToggle}
      aria-label={playing ? "Pause music" : "Play music"}
    >
      <span className="av-orb-orbit" aria-hidden="true" />

      <span className="av-orb-canvas" aria-hidden="true">
        <Canvas
          camera={{
            position: [0, 0, CAMERA_DISTANCE],
            fov: 40,
          }}
          dpr={[1, 1.5]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          }}
          style={{
            pointerEvents: "none",
          }}
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

      <span className="av-orb-hint">
        {playing ? "TAP TO PAUSE" : "TAP TO PLAY"}
      </span>
    </button>
  );
}
