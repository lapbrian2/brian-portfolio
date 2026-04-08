import * as THREE from 'three'

/**
 * Scene 0 — Hero: Dark architectural environment
 * Placeholder: grid floor + tall box columns + floating particles
 */
export function createHeroScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.018),
    cameraPath: {
      from: { x: 0, y: 4, z: 20, lookY: 2 },
      to: { x: 3, y: 2, z: 10, lookY: 0 },
    },
    setup(scene, camera) {
      camera.position.set(0, 4, 20)
      camera.lookAt(0, 2, 0)

      // Ambient + directional
      scene.add(new THREE.AmbientLight(0x1a3d3d, 0.6))
      const dir = new THREE.DirectionalLight(0x4a9ead, 0.8)
      dir.position.set(5, 10, 5)
      scene.add(dir)

      // Grid floor
      const gridGeo = new THREE.BufferGeometry()
      const gridPos = []
      for (let x = -40; x <= 40; x += 2) {
        gridPos.push(x, 0, -40, x, 0, 40)
      }
      for (let z = -40; z <= 40; z += 2) {
        gridPos.push(-40, 0, z, 40, 0, z)
      }
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPos, 3))
      scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({
        color: 0x1a4a4a, transparent: true, opacity: 0.2,
      })))

      // Tall columns — architectural placeholders
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x0d2b2b, roughness: 0.8, metalness: 0.2,
      })
      for (let i = 0; i < 20; i++) {
        const h = 4 + Math.random() * 12
        const w = 0.3 + Math.random() * 0.8
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, w),
          colMat,
        )
        col.position.set(
          (Math.random() - 0.5) * 30,
          h / 2,
          (Math.random() - 0.5) * 30 - 5,
        )
        scene.add(col)
      }

      // Floating particles
      const pCount = 300
      const pPos = new Float32Array(pCount * 3)
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 40
        pPos[i * 3 + 1] = Math.random() * 15
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 40
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.08, color: 0x4a9ead, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      })))

      // Store refs for animation
      scene.userData.particles = pGeo
    },
    update(dt, elapsed) {
      // Drift particles upward slowly
      const pos = this.threeScene.userData.particles?.attributes.position
      if (!pos) return
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += dt * 0.15
        if (pos.array[i * 3 + 1] > 15) pos.array[i * 3 + 1] = 0
      }
      pos.needsUpdate = true
    },
  }
}

/**
 * Scene 1 — About: Floating monoliths in void
 * Placeholder: dark floating blocks + glowing edges + particles
 */
export function createAboutScene() {
  const blocks = []
  return {
    fog: new THREE.FogExp2(0x050f12, 0.02),
    cameraPath: {
      from: { x: 0, y: 0, z: 15, lookY: 0 },
      to: { x: -3, y: 2, z: 8, lookY: 1 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 15)

      scene.add(new THREE.AmbientLight(0x111111, 0.4))
      const point = new THREE.PointLight(0x4a9ead, 2, 30)
      point.position.set(0, 5, 5)
      scene.add(point)

      // Floating monolith blocks
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0a1a1f, roughness: 0.6, metalness: 0.4,
      })
      for (let i = 0; i < 12; i++) {
        const w = 0.5 + Math.random() * 2
        const h = 2 + Math.random() * 6
        const d = 0.5 + Math.random() * 2
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        block.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 15,
        )
        block.rotation.set(
          Math.random() * 0.2,
          Math.random() * Math.PI,
          Math.random() * 0.1,
        )
        scene.add(block)
        blocks.push(block)
      }

      // Edge-glow wireframe overlay on some blocks
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x4a9ead, wireframe: true, transparent: true, opacity: 0.08,
      })
      blocks.slice(0, 5).forEach(b => {
        const wire = new THREE.Mesh(b.geometry.clone(), wireMat)
        wire.position.copy(b.position)
        wire.rotation.copy(b.rotation)
        wire.scale.multiplyScalar(1.02)
        scene.add(wire)
      })

      scene.userData.blocks = blocks
    },
    update(dt, elapsed) {
      const bks = this.threeScene.userData.blocks
      if (!bks) return
      bks.forEach((b, i) => {
        b.position.y += Math.sin(elapsed * 0.3 + i) * dt * 0.15
      })
    },
  }
}

/**
 * Scene 2 — Work: Rotating glass structure
 * Placeholder: wireframe icosahedron rotating
 */
export function createWorkScene() {
  let ico
  return {
    fog: new THREE.FogExp2(0x07161a, 0.015),
    cameraPath: {
      from: { x: 0, y: 0, z: 12 },
      to: { x: 2, y: 1, z: 8 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 12)

      scene.add(new THREE.AmbientLight(0x1a2a2a, 0.5))
      const light = new THREE.PointLight(0x4a9ead, 1.5, 20)
      light.position.set(3, 5, 5)
      scene.add(light)

      // Glass-like icosahedron
      ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3, 1),
        new THREE.MeshPhysicalMaterial({
          color: 0x1a3a3a,
          roughness: 0.1,
          metalness: 0.3,
          transmission: 0.6,
          thickness: 1.5,
          transparent: true,
          opacity: 0.7,
        }),
      )
      scene.add(ico)

      // Wireframe overlay
      scene.add(new THREE.Mesh(
        new THREE.IcosahedronGeometry(3.05, 1),
        new THREE.MeshBasicMaterial({
          color: 0x4a9ead, wireframe: true, transparent: true, opacity: 0.12,
        }),
      ))

      scene.userData.ico = ico
    },
    update(dt, elapsed) {
      const i = this.threeScene.userData.ico
      if (i) {
        i.rotation.y = elapsed * 0.15
        i.rotation.x = Math.sin(elapsed * 0.1) * 0.2
      }
    },
  }
}

/**
 * Scene 3 — Agentic: Network graph / neural mesh
 * Placeholder: connected node sphere cluster
 */
export function createAgenticScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.012),
    cameraPath: {
      from: { x: 0, y: 0, z: 20 },
      to: { x: 5, y: 3, z: 12, lookY: 1 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 20)

      scene.add(new THREE.AmbientLight(0x111111, 0.3))
      scene.add(new THREE.PointLight(0x4a9ead, 1.5, 40))

      // Nodes
      const nodes = []
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.6 })
      for (let i = 0; i < 40; i++) {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.1 + Math.random() * 0.15, 8, 8),
          nodeMat.clone(),
        )
        node.position.set(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 25,
        )
        scene.add(node)
        nodes.push(node)
      }

      // Connections
      const linePos = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].position.distanceTo(nodes[j].position) < 8) {
            linePos.push(
              nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
              nodes[j].position.x, nodes[j].position.y, nodes[j].position.z,
            )
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
      scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
        color: 0x4a9ead, transparent: true, opacity: 0.06,
      })))

      scene.userData.nodes = nodes
    },
    update(dt, elapsed) {
      const nodes = this.threeScene.userData.nodes
      if (!nodes) return
      nodes.forEach((n, i) => {
        n.material.opacity = 0.3 + Math.sin(elapsed * 0.5 + i * 0.7) * 0.3
      })
    },
  }
}

/**
 * Scene 4 — Footer: Minimal, just the logo
 * Placeholder: single subtle wireframe
 */
export function createFooterScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.025),
    cameraPath: {
      from: { x: 0, y: 0, z: 10 },
      to: { x: 0, y: 2, z: 8 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 10)
      scene.add(new THREE.AmbientLight(0x111111, 0.3))

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2, 0.02, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.15 }),
      )
      scene.add(ring)
      scene.userData.ring = ring
    },
    update(dt, elapsed) {
      const r = this.threeScene.userData.ring
      if (r) {
        r.rotation.x = elapsed * 0.1
        r.rotation.y = elapsed * 0.15
      }
    },
  }
}
