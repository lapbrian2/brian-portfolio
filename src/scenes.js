import * as THREE from 'three'

// Shared utility: create particle dust field
function createDust(scene, count, spread, color, size, opacity) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size, color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }))
  scene.add(pts)
  return geo
}

// Shared: 3-point lighting rig
function addLightRig(scene, { key = 0x4a9ead, fill = 0x1a2a3a, ambient = 0x0a1a1a, keyIntensity = 1.2 } = {}) {
  scene.add(new THREE.AmbientLight(ambient, 0.5))
  const keyLight = new THREE.DirectionalLight(key, keyIntensity)
  keyLight.position.set(8, 12, 6)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(fill, 0.4)
  fillLight.position.set(-5, 3, -4)
  scene.add(fillLight)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.15)
  rimLight.position.set(0, 5, -10)
  scene.add(rimLight)
}

/**
 * Scene 0 — Hero: Dark cyberpunk architecture
 * Grid floor, tall columns with emissive edges, floating firefly particles
 */
export function createHeroScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.014),
    cameraPath: {
      from: { x: 0, y: 5, z: 22, lookY: 3 },
      to: { x: 4, y: 2, z: 10, lookY: 0 },
    },
    setup(scene, camera) {
      camera.position.set(0, 5, 22)
      camera.lookAt(0, 3, 0)
      addLightRig(scene)

      // Point lights for atmosphere
      const p1 = new THREE.PointLight(0x4a9ead, 0.8, 25)
      p1.position.set(-8, 8, -5)
      scene.add(p1)
      const p2 = new THREE.PointLight(0x2a6a7a, 0.5, 20)
      p2.position.set(10, 3, 0)
      scene.add(p2)

      // Grid floor
      const gridGeo = new THREE.BufferGeometry()
      const gp = []
      for (let x = -50; x <= 50; x += 2) gp.push(x, 0, -50, x, 0, 50)
      for (let z = -50; z <= 50; z += 2) gp.push(-50, 0, z, 50, 0, z)
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3))
      scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({
        color: 0x1a4a4a, transparent: true, opacity: 0.12,
      })))

      // Architectural columns with varying materials
      const colMats = [
        new THREE.MeshStandardMaterial({ color: 0x0d2b2b, roughness: 0.7, metalness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x0a2020, roughness: 0.9, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0x112828, roughness: 0.5, metalness: 0.5 }),
      ]
      const columns = []
      for (let i = 0; i < 30; i++) {
        const h = 5 + Math.random() * 18
        const w = 0.2 + Math.random() * 1.2
        const d = 0.2 + Math.random() * 0.6
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          colMats[i % 3],
        )
        col.position.set(
          (Math.random() - 0.5) * 40,
          h / 2,
          (Math.random() - 0.5) * 40 - 8,
        )
        scene.add(col)
        columns.push(col)

        // Emissive edge lines on some columns
        if (Math.random() > 0.5) {
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(col.geometry),
            new THREE.LineBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.08 })
          )
          edges.position.copy(col.position)
          scene.add(edges)
        }
      }

      // Horizontal beams connecting some columns
      for (let i = 0; i < 8; i++) {
        const a = columns[Math.floor(Math.random() * columns.length)]
        const b = columns[Math.floor(Math.random() * columns.length)]
        if (a === b) continue
        const beamH = 3 + Math.random() * 10
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, a.position.distanceTo(b.position)),
          new THREE.MeshBasicMaterial({ color: 0x1a3a3a, transparent: true, opacity: 0.3 })
        )
        beam.position.lerpVectors(a.position, b.position, 0.5)
        beam.position.y = beamH
        beam.lookAt(b.position.x, beamH, b.position.z)
        scene.add(beam)
      }

      // Firefly particles
      const dustGeo = createDust(scene, 500, 50, 0x4a9ead, 0.06, 0.5)
      scene.userData.particles = dustGeo
      scene.userData.columns = columns
    },
    update(dt, elapsed) {
      // Drift particles upward
      const pos = this.threeScene.userData.particles?.attributes.position
      if (!pos) return
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += dt * 0.12
        pos.array[i * 3] += Math.sin(elapsed * 0.5 + i) * dt * 0.02
        if (pos.array[i * 3 + 1] > 20) pos.array[i * 3 + 1] = -5
      }
      pos.needsUpdate = true
    },
  }
}

/**
 * Scene 1 — About: Floating monoliths in deep void
 * Dark blocks hovering with teal edge glow, volumetric dust
 */
export function createAboutScene() {
  return {
    fog: new THREE.FogExp2(0x040d10, 0.016),
    cameraPath: {
      from: { x: 0, y: 0, z: 16, lookY: 0 },
      to: { x: -4, y: 3, z: 8, lookY: 1 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 16)

      addLightRig(scene, { ambient: 0x050a0a, keyIntensity: 0.8 })

      // Cyan point light for glow
      const glow = new THREE.PointLight(0x4a9ead, 1.5, 25)
      glow.position.set(2, 6, 3)
      scene.add(glow)
      const glow2 = new THREE.PointLight(0x2a5a6a, 0.8, 20)
      glow2.position.set(-5, -2, -5)
      scene.add(glow2)

      // Monoliths
      const mat = new THREE.MeshStandardMaterial({
        color: 0x0a1a1f, roughness: 0.5, metalness: 0.5,
        envMapIntensity: 0.3,
      })
      const blocks = []
      for (let i = 0; i < 15; i++) {
        const w = 0.4 + Math.random() * 2.5
        const h = 2 + Math.random() * 8
        const d = 0.4 + Math.random() * 2
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        block.position.set(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 18,
        )
        block.rotation.set(
          (Math.random() - 0.5) * 0.15,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.1,
        )
        scene.add(block)
        blocks.push(block)

        // Teal edge wireframe on every block
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(block.geometry),
          new THREE.LineBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.06 + Math.random() * 0.08 })
        )
        edges.position.copy(block.position)
        edges.rotation.copy(block.rotation)
        edges.scale.multiplyScalar(1.01)
        scene.add(edges)
      }

      createDust(scene, 400, 30, 0x3a8a9a, 0.04, 0.3)
      scene.userData.blocks = blocks
    },
    update(dt, elapsed) {
      const bks = this.threeScene.userData.blocks
      if (!bks) return
      bks.forEach((b, i) => {
        b.position.y += Math.sin(elapsed * 0.25 + i * 0.8) * dt * 0.08
        b.rotation.y += dt * 0.005
      })
    },
  }
}

/**
 * Scene 2 — Work: Rotating glass polyhedron
 * Refracted icosahedron with inner glow, orbiting particles
 */
export function createWorkScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.012),
    cameraPath: {
      from: { x: 0, y: 0, z: 14 },
      to: { x: 3, y: 1, z: 9 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 14)

      addLightRig(scene, { keyIntensity: 1.0 })
      const inner = new THREE.PointLight(0x4a9ead, 2, 8)
      inner.position.set(0, 0, 0)
      scene.add(inner)

      // Glass icosahedron
      const ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3, 2),
        new THREE.MeshPhysicalMaterial({
          color: 0x1a3a3a, roughness: 0.05, metalness: 0.2,
          transmission: 0.7, thickness: 2, transparent: true, opacity: 0.6,
          ior: 1.5, envMapIntensity: 0.5,
        }),
      )
      scene.add(ico)

      // Wireframe shell
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3.08, 2),
        new THREE.MeshBasicMaterial({ color: 0x4a9ead, wireframe: true, transparent: true, opacity: 0.1 })
      )
      scene.add(wire)

      // Inner wireframe (smaller, brighter)
      const innerWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2, 1),
        new THREE.MeshBasicMaterial({ color: 0x6abccc, wireframe: true, transparent: true, opacity: 0.06 })
      )
      scene.add(innerWire)

      // Orbiting particles ring
      const ringCount = 200
      const ringPos = new Float32Array(ringCount * 3)
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2
        const r = 4.5 + (Math.random() - 0.5) * 1.5
        ringPos[i * 3] = Math.cos(angle) * r
        ringPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5
        ringPos[i * 3 + 2] = Math.sin(angle) * r
      }
      const ringGeo = new THREE.BufferGeometry()
      ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3))
      const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({
        size: 0.04, color: 0x4a9ead, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      }))
      scene.add(ring)

      createDust(scene, 200, 30, 0x2a5a6a, 0.03, 0.2)
      scene.userData.ico = ico
      scene.userData.wire = wire
      scene.userData.innerWire = innerWire
      scene.userData.ring = ring
    },
    update(dt, elapsed) {
      const { ico, wire, innerWire, ring } = this.threeScene.userData
      if (ico) {
        ico.rotation.y = elapsed * 0.12
        ico.rotation.x = Math.sin(elapsed * 0.08) * 0.15
      }
      if (wire) {
        wire.rotation.y = elapsed * 0.12
        wire.rotation.x = Math.sin(elapsed * 0.08) * 0.15
      }
      if (innerWire) {
        innerWire.rotation.y = -elapsed * 0.2
        innerWire.rotation.z = elapsed * 0.1
      }
      if (ring) ring.rotation.y = elapsed * 0.05
    },
  }
}

/**
 * Scene 3 — Agentic: Neural network
 * Nodes with pulsing glow, connections, data flow particles along edges
 */
export function createAgenticScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.01),
    cameraPath: {
      from: { x: 0, y: 2, z: 22 },
      to: { x: 6, y: 4, z: 14, lookY: 2 },
    },
    setup(scene, camera) {
      camera.position.set(0, 2, 22)

      addLightRig(scene, { ambient: 0x080808, keyIntensity: 0.6 })
      scene.add(new THREE.PointLight(0x4a9ead, 1, 35))

      // Nodes
      const nodes = []
      for (let i = 0; i < 50; i++) {
        const s = 0.08 + Math.random() * 0.18
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(s, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.5 })
        )
        node.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30,
        )
        scene.add(node)
        nodes.push(node)

        // Glow halo around larger nodes
        if (s > 0.15) {
          const halo = new THREE.Mesh(
            new THREE.SphereGeometry(s * 3, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.02 })
          )
          halo.position.copy(node.position)
          scene.add(halo)
        }
      }

      // Connections
      const linePos = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].position.distanceTo(nodes[j].position) < 10) {
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
        color: 0x4a9ead, transparent: true, opacity: 0.04,
      })))

      createDust(scene, 300, 40, 0x3a7a8a, 0.03, 0.25)
      scene.userData.nodes = nodes
    },
    update(dt, elapsed) {
      const nodes = this.threeScene.userData.nodes
      if (!nodes) return
      nodes.forEach((n, i) => {
        n.material.opacity = 0.25 + Math.sin(elapsed * 0.4 + i * 0.6) * 0.3
      })
    },
  }
}

/**
 * Scene 4 — Footer: Minimal ring + dust
 */
export function createFooterScene() {
  return {
    fog: new THREE.FogExp2(0x07161a, 0.02),
    cameraPath: {
      from: { x: 0, y: 0, z: 12 },
      to: { x: 0, y: 2, z: 8 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 12)
      scene.add(new THREE.AmbientLight(0x0a0a0a, 0.3))
      scene.add(new THREE.PointLight(0x4a9ead, 0.5, 15))

      // Two concentric rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.015, 16, 80),
        new THREE.MeshBasicMaterial({ color: 0x4a9ead, transparent: true, opacity: 0.12 }),
      )
      scene.add(ring1)

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2, 0.01, 16, 60),
        new THREE.MeshBasicMaterial({ color: 0x3a6a7a, transparent: true, opacity: 0.08 }),
      )
      ring2.rotation.x = Math.PI * 0.5
      scene.add(ring2)

      createDust(scene, 100, 20, 0x3a7a8a, 0.03, 0.15)
      scene.userData.ring1 = ring1
      scene.userData.ring2 = ring2
    },
    update(dt, elapsed) {
      const { ring1, ring2 } = this.threeScene.userData
      if (ring1) {
        ring1.rotation.x = elapsed * 0.08
        ring1.rotation.y = elapsed * 0.12
      }
      if (ring2) {
        ring2.rotation.y = -elapsed * 0.1
        ring2.rotation.z = elapsed * 0.06
      }
    },
  }
}
