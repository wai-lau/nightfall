import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Direction, NetmapPosition } from "../../types";
import { pixelToWorldXZ } from "../../util/netmap3d";

const CAM_HEIGHT = 39.15;
const CAM_DISTANCE = 50;
const CAM_ANGLE = Math.PI / 4;
const CAM_OFFSET_X = -CAM_DISTANCE * Math.sin(CAM_ANGLE);
const CAM_OFFSET_Z = CAM_DISTANCE * Math.cos(CAM_ANGLE);
const DIAG = Math.SQRT1_2; // 1/√2 — forward/right unit vectors in XZ at 45°
const VELOCITY = 20;
const LERP_FACTOR = 0.1;

export interface ArrowScrollAPI {
  startScroll: (dir: Direction) => void;
  endScroll: () => void;
}

interface CameraControllerProps {
  initialTarget: [number, number];
  bindScrollFunction: (f: (pos: NetmapPosition, duration?: number) => Promise<NetmapPosition>) => void;
  bindArrowScroll?: (api: ArrowScrollAPI) => void;
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export default function CameraController({ initialTarget, bindScrollFunction, bindArrowScroll, bounds }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef<[number, number]>([...initialTarget]);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<{ startX: number; startZ: number; endX: number; endZ: number; startTime: number; duration: number; resolve: (p: NetmapPosition) => void } | null>(null);

  useEffect(() => {
    const [x, z] = initialTarget;
    camera.position.set(x + CAM_OFFSET_X, CAM_HEIGHT, z + CAM_OFFSET_Z);
    camera.lookAt(x, 0, z);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (animRef.current) {
      const anim = animRef.current;
      const elapsed = Date.now() - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);
      targetRef.current = [
        anim.startX + (anim.endX - anim.startX) * t,
        anim.startZ + (anim.endZ - anim.startZ) * t,
      ];
      if (t >= 1) {
        anim.resolve([anim.endX, anim.endZ]);
        animRef.current = null;
      }
    } else {
      const keys = keysRef.current;
      const v = VELOCITY * delta;
      if (keys.has("w") || keys.has("arrowup"))    { targetRef.current[0] += DIAG * v; targetRef.current[1] -= DIAG * v; }
      if (keys.has("s") || keys.has("arrowdown"))  { targetRef.current[0] -= DIAG * v; targetRef.current[1] += DIAG * v; }
      if (keys.has("a") || keys.has("arrowleft"))  { targetRef.current[0] -= DIAG * v; targetRef.current[1] -= DIAG * v; }
      if (keys.has("d") || keys.has("arrowright")) { targetRef.current[0] += DIAG * v; targetRef.current[1] += DIAG * v; }
    }

    if (bounds) {
      targetRef.current[0] = Math.max(bounds.minX, Math.min(bounds.maxX, targetRef.current[0]));
      targetRef.current[1] = Math.max(bounds.minZ, Math.min(bounds.maxZ, targetRef.current[1]));
    }
    const [ntx, ntz] = targetRef.current;
    camera.position.x += (ntx + CAM_OFFSET_X - camera.position.x) * LERP_FACTOR;
    camera.position.y = CAM_HEIGHT;
    camera.position.z += (ntz + CAM_OFFSET_Z - camera.position.z) * LERP_FACTOR;
    camera.lookAt(camera.position.x - CAM_OFFSET_X, 0, camera.position.z - CAM_OFFSET_Z);
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const scrollToPosition = (pos: NetmapPosition, duration: number = 100): Promise<NetmapPosition> => {
      return new Promise((resolve) => {
        const [endX, endZ] = pixelToWorldXZ(pos[0], pos[1]);
        animRef.current = {
          startX: targetRef.current[0],
          startZ: targetRef.current[1],
          endX,
          endZ,
          startTime: Date.now(),
          duration,
          resolve: (p) => resolve(p),
        };
      });
    };
    bindScrollFunction(scrollToPosition);
  }, [bindScrollFunction]);

  useEffect(() => {
    if (!bindArrowScroll) return;
    const startScroll = (dir: Direction) => {
      switch (dir) {
        case Direction.Up:    keysRef.current.add("arrowup"); break;
        case Direction.Down:  keysRef.current.add("arrowdown"); break;
        case Direction.Left:  keysRef.current.add("arrowleft"); break;
        case Direction.Right: keysRef.current.add("arrowright"); break;
      }
    };
    const endScroll = () => {
      keysRef.current.delete("arrowup");
      keysRef.current.delete("arrowdown");
      keysRef.current.delete("arrowleft");
      keysRef.current.delete("arrowright");
    };
    bindArrowScroll({ startScroll, endScroll });
  }, [bindArrowScroll]);

  return null;
}
