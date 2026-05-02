import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Direction, NetmapPosition } from "../../types";
import { pixelToWorldXZ } from "../../util/netmap3d";

const CAM_HEIGHT = 45;
const CAM_DISTANCE = 35;
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
}

export default function CameraController({ initialTarget, bindScrollFunction, bindArrowScroll }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef<[number, number]>([...initialTarget]);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<{ startX: number; startZ: number; endX: number; endZ: number; startTime: number; duration: number; resolve: (p: NetmapPosition) => void } | null>(null);

  useEffect(() => {
    const [x, z] = initialTarget;
    camera.position.set(x, CAM_HEIGHT, z + CAM_DISTANCE);
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
      if (keys.has("w") || keys.has("arrowup")) targetRef.current[1] -= VELOCITY * delta;
      if (keys.has("s") || keys.has("arrowdown")) targetRef.current[1] += VELOCITY * delta;
      if (keys.has("a") || keys.has("arrowleft")) targetRef.current[0] -= VELOCITY * delta;
      if (keys.has("d") || keys.has("arrowright")) targetRef.current[0] += VELOCITY * delta;
    }

    const [ntx, ntz] = targetRef.current;
    camera.position.x += (ntx - camera.position.x) * LERP_FACTOR;
    camera.position.y = CAM_HEIGHT;
    camera.position.z += (ntz + CAM_DISTANCE - camera.position.z) * LERP_FACTOR;
    camera.lookAt(ntx, 0, ntz);
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
