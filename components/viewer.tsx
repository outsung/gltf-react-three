import React, { Suspense, useLayoutEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import useStore from '../utils/store'
import { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { OrbitControls as OrbitControlsRef } from 'three-stdlib'

type ControlsProto = {
  update(): void
  target: THREE.Vector3
}

export interface ViewerProps {
  shadows: boolean
  contactShadow: boolean
  autoRotate: boolean
  environment: string
  preset: string
  intensity: number
}

export default function Viewer({ shadows, contactShadow, autoRotate, environment, preset, intensity }: ViewerProps) {
  const scene = useStore((store) => store.scene)
  const ref = useRef<typeof OrbitControls>(null)

  useLayoutEffect(() => {
    if (scene) {
      scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.castShadow = obj.receiveShadow = shadows
          obj.material.envMapIntensity = 0.8
        }
      })
    }
  }, [scene, shadows])

  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]} camera={{ position: [0, 0, 150], fov: 50 }}>
      <ambientLight intensity={0.25} />
      <Suspense fallback={null}>
        <Stage
          controls={ref as unknown as React.MutableRefObject<ControlsProto>}
          preset={preset as 'rembrandt' | 'portrait' | 'upfront' | 'soft'}
          intensity={intensity}
          contactShadow={contactShadow ? { blur: 2, opacity: 0.5, position: [0, 0, 0] } : contactShadow}
          shadows
          adjustCamera
          environment={environment as PresetsType}>
          <primitive object={scene} />
        </Stage>
      </Suspense>
      <OrbitControls ref={ref as unknown as React.Ref<OrbitControlsRef>} autoRotate={autoRotate} />
    </Canvas>
  )
}
