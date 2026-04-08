import * as THREE from 'three'

// Brian's palette as Three.js colors
const INK = 0x09090B
const GRAPHITE = 0x18181B
const CARBON = 0x1C1C1E
const GOLD = 0xB8964E
const PEWTER = 0x71717A
const GALLERY = 0xFAFAF9
const LINEN = 0xF5F5F0

// Shared: dust particles
function createDust(scene, count, spread, color, size, opacity) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size, color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  })))
  return geo
}

// Shared: editorial lighting rig — warm key, cool fill, subtle rim
function addLightRig(scene) {
  scene.add(new THREE.AmbientLight(0x111111, 0.4))
  const key = new THREE.DirectionalLight(0xFFF5E6, 0.9) // warm white
  key.position.set(8, 12, 6)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xE0E0E0, 0.3)
  fill.position.set(-5, 3, -4)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xFFFFFF, 0.1)
  rim.position.set(0, 5, -10)
  scene.add(rim)
}

/**
 * Scene 0 — Hero: Editorial grid space
 * Clean vertical planes in graphite, thin gold accent lines, minimal dust
 */
export function createHeroScene() {
  return {
    fog: new THREE.FogExp2(INK, 0.012),
    cameraPath: {
      from: { x: 0, y: 4, z: 22, lookY: 2 },
      to: { x: 3, y: 1.5, z: 12, lookY: 0 },
    },
    setup(scene, camera) {
      camera.position.set(0, 4, 22)
      camera.lookAt(0, 2, 0)
      scene.background = new THREE.Color(INK)
      addLightRig(scene)

      // Subtle gold point light
      const goldLight = new THREE.PointLight(GOLD, 0.3, 30)
      goldLight.position.set(-5, 8, 0)
      scene.add(goldLight)

      // Grid floor — very subtle
      const gridGeo = new THREE.BufferGeometry()
      const gp = []
      for (let x = -40; x <= 40; x += 3) gp.push(x, 0, -40, x, 0, 40)
      for (let z = -40; z <= 40; z += 3) gp.push(-40, 0, z, 40, 0, z)
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3))
      scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({
        color: GRAPHITE, transparent: true, opacity: 0.08,
      })))

      // Vertical planes — editorial columns (flat, not boxes)
      const planeMat = new THREE.MeshStandardMaterial({
        color: GRAPHITE, roughness: 0.9, metalness: 0.05,
        side: THREE.DoubleSide,
      })
      const planes = []
      for (let i = 0; i < 18; i++) {
        const h = 6 + Math.random() * 16
        const w = 0.6 + Math.random() * 2
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          planeMat,
        )
        plane.position.set(
          (Math.random() - 0.5) * 35,
          h / 2,
          (Math.random() - 0.5) * 35 - 8,
        )
        plane.rotation.y = Math.random() * Math.PI
        scene.add(plane)
        planes.push(plane)
      }

      // Thin gold accent lines — horizontal, sparse
      const goldMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.12 })
      for (let i = 0; i < 5; i++) {
        const lineGeo = new THREE.BufferGeometry()
        const y = 3 + Math.random() * 10
        const x1 = (Math.random() - 0.5) * 20
        const x2 = x1 + 5 + Math.random() * 15
        const z = (Math.random() - 0.5) * 20
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute([x1, y, z, x2, y, z], 3))
        scene.add(new THREE.Line(lineGeo, goldMat))
      }

      // Minimal dust
      const dustGeo = createDust(scene, 200, 50, PEWTER, 0.04, 0.2)
      scene.userData.particles = dustGeo
    },
    update(dt, elapsed) {
      const pos = this.threeScene.userData.particles?.attributes.position
      if (!pos) return
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += dt * 0.06
        if (pos.array[i * 3 + 1] > 18) pos.array[i * 3 + 1] = -3
      }
      pos.needsUpdate = true
    },
  }
}

/**
 * Scene 1 — About: Floating rectangular volumes
 * Clean dark boxes hovering in void, thin gold edge accents on select pieces
 */
export function createAboutScene() {
  return {
    fog: new THREE.FogExp2(INK, 0.015),
    cameraPath: {
      from: { x: 0, y: 0, z: 16, lookY: 0 },
      to: { x: -3, y: 2, z: 9, lookY: 1 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 16)
      scene.background = new THREE.Color(INK)
      addLightRig(scene)

      const goldGlow = new THREE.PointLight(GOLD, 0.4, 20)
      goldGlow.position.set(3, 5, 3)
      scene.add(goldGlow)

      const mat = new THREE.MeshStandardMaterial({
        color: CARBON, roughness: 0.85, metalness: 0.1,
      })
      const blocks = []
      for (let i = 0; i < 12; i++) {
        const w = 0.5 + Math.random() * 2.5
        const h = 1.5 + Math.random() * 6
        const d = 0.3 + Math.random() * 1.5
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        block.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 16,
        )
        block.rotation.set(
          (Math.random() - 0.5) * 0.1,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.05,
        )
        scene.add(block)
        blocks.push(block)

        // Gold edge accent on ~30% of blocks
        if (Math.random() > 0.7) {
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(block.geometry),
            new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.08 })
          )
          edges.position.copy(block.position)
          edges.rotation.copy(block.rotation)
          edges.scale.multiplyScalar(1.005)
          scene.add(edges)
        }
      }

      createDust(scene, 150, 25, PEWTER, 0.03, 0.15)
      scene.userData.blocks = blocks
    },
    update(dt, elapsed) {
      const bks = this.threeScene.userData.blocks
      if (!bks) return
      bks.forEach((b, i) => {
        b.position.y += Math.sin(elapsed * 0.2 + i * 0.7) * dt * 0.04
      })
    },
  }
}

/**
 * Scene 2 — Work: Rotating octahedron with gold wireframe
 * Clean geometric form, institutional feel
 */
export function createWorkScene() {
  return {
    fog: new THREE.FogExp2(INK, 0.01),
    cameraPath: {
      from: { x: 0, y: 0, z: 14 },
      to: { x: 2, y: 1, z: 10 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 14)
      scene.background = new THREE.Color(INK)
      addLightRig(scene)

      const goldInner = new THREE.PointLight(GOLD, 0.6, 10)
      goldInner.position.set(0, 0, 0)
      scene.add(goldInner)

      // Main form — octahedron
      const octa = new THREE.Mesh(
        new THREE.OctahedronGeometry(3, 0),
        new THREE.MeshStandardMaterial({
          color: GRAPHITE, roughness: 0.7, metalness: 0.2,
          transparent: true, opacity: 0.8,
        }),
      )
      scene.add(octa)

      // Gold wireframe shell
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(3.05, 0)),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.2 })
      )
      scene.add(wire)

      // Inner form — smaller, rotated
      const inner = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.8, 0),
        new THREE.MeshStandardMaterial({
          color: CARBON, roughness: 0.5, metalness: 0.3,
        }),
      )
      inner.rotation.set(Math.PI / 4, 0, Math.PI / 4)
      scene.add(inner)

      const innerWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.85, 0)),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.1 })
      )
      innerWire.rotation.copy(inner.rotation)
      scene.add(innerWire)

      createDust(scene, 100, 25, PEWTER, 0.03, 0.12)
      scene.userData.octa = octa
      scene.userData.wire = wire
      scene.userData.inner = inner
      scene.userData.innerWire = innerWire
    },
    update(dt, elapsed) {
      const { octa, wire, inner, innerWire } = this.threeScene.userData
      if (octa) {
        octa.rotation.y = elapsed * 0.08
        octa.rotation.x = Math.sin(elapsed * 0.06) * 0.1
      }
      if (wire) {
        wire.rotation.y = elapsed * 0.08
        wire.rotation.x = Math.sin(elapsed * 0.06) * 0.1
      }
      if (inner) {
        inner.rotation.y = -elapsed * 0.12
      }
      if (innerWire) {
        innerWire.rotation.y = -elapsed * 0.12
      }
    },
  }
}

/**
 * Scene 3 — Agentic: Constellation network
 * Nodes connected by thin lines, gold highlights on hub nodes
 */
export function createAgenticScene() {
  return {
    fog: new THREE.FogExp2(INK, 0.008),
    cameraPath: {
      from: { x: 0, y: 2, z: 22 },
      to: { x: 5, y: 3, z: 14, lookY: 1 },
    },
    setup(scene, camera) {
      camera.position.set(0, 2, 22)
      scene.background = new THREE.Color(INK)
      addLightRig(scene)

      const goldLight = new THREE.PointLight(GOLD, 0.5, 30)
      goldLight.position.set(0, 5, 0)
      scene.add(goldLight)

      // Nodes
      const nodes = []
      for (let i = 0; i < 45; i++) {
        const isHub = Math.random() > 0.8
        const s = isHub ? 0.15 + Math.random() * 0.1 : 0.05 + Math.random() * 0.08
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(s, 8, 8),
          new THREE.MeshBasicMaterial({
            color: isHub ? GOLD : PEWTER,
            transparent: true,
            opacity: isHub ? 0.7 : 0.35,
          })
        )
        node.position.set(
          (Math.random() - 0.5) * 28,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 28,
        )
        node.userData.isHub = isHub
        scene.add(node)
        nodes.push(node)
      }

      // Connections — thin pewter lines
      const linePos = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].position.distanceTo(nodes[j].position) < 9) {
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
        color: PEWTER, transparent: true, opacity: 0.03,
      })))

      createDust(scene, 150, 35, PEWTER, 0.02, 0.1)
      scene.userData.nodes = nodes
    },
    update(dt, elapsed) {
      const nodes = this.threeScene.userData.nodes
      if (!nodes) return
      nodes.forEach((n, i) => {
        const base = n.userData.isHub ? 0.5 : 0.2
        n.material.opacity = base + Math.sin(elapsed * 0.35 + i * 0.5) * 0.2
      })
    },
  }
}

/**
 * Scene 4 — Footer: Single gold ring
 */
export function createFooterScene() {
  return {
    fog: new THREE.FogExp2(INK, 0.02),
    cameraPath: {
      from: { x: 0, y: 0, z: 10 },
      to: { x: 0, y: 1, z: 7 },
    },
    setup(scene, camera) {
      camera.position.set(0, 0, 10)
      scene.background = new THREE.Color(INK)
      scene.add(new THREE.AmbientLight(0x0a0a0a, 0.3))

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.01, 16, 80),
        new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.15 })
      )
      scene.add(ring)

      createDust(scene, 50, 15, PEWTER, 0.02, 0.08)
      scene.userData.ring = ring
    },
    update(dt, elapsed) {
      const r = this.threeScene.userData.ring
      if (r) {
        r.rotation.x = elapsed * 0.06
        r.rotation.y = elapsed * 0.09
      }
    },
  }
}
