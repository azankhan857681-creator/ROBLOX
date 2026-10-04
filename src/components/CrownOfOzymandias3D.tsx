import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import exactCrownImage from '../assets/images/crown_ozymandias_hero_1789318934088.jpg';

interface CrownOfOzymandias3DProps {
  className?: string;
  onClick?: () => void;
  height?: number | string;
}

export const CrownOfOzymandias3D: React.FC<CrownOfOzymandias3DProps> = ({
  className = '',
  onClick,
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGLFailed(true);
      return;
    }

    const width = container.clientWidth || 540;
    const heightVal = typeof height === 'number' ? height : container.clientHeight || 320;

    renderer.setSize(width, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / heightVal, 0.1, 100);
    camera.position.set(0, 1.35, 6.6);
    camera.lookAt(0, 0, 0);

    // Procedural Reflection Environment Map for ultra-realistic metallic gold and chrome silver sheen
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#505664');
      grad.addColorStop(0.3, '#222630');
      grad.addColorStop(0.6, '#0d0f14');
      grad.addColorStop(0.85, '#352712');
      grad.addColorStop(1, '#ffc02e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Studio softbox highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 20, 110, 60);
      ctx.fillRect(320, 20, 130, 60);

      // Warm ground reflection
      const warmGrad = ctx.createRadialGradient(256, 200, 10, 256, 200, 130);
      warmGrad.addColorStop(0, '#ffa812');
      warmGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(100, 130, 312, 126);

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = envTexture;
    }

    // Studio Lighting setup matching Roblox Avatar shop dark theme
    const ambientLight = new THREE.AmbientLight(0x38342c, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff2df, 2.8);
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    const bottomGlow = new THREE.DirectionalLight(0xff9900, 2.4);
    bottomGlow.position.set(0, -6, 4);
    scene.add(bottomGlow);

    // Warm inner golden spotlight in the center of the ring
    const innerPointLight = new THREE.PointLight(0xffaa00, 6.0, 10);
    innerPointLight.position.set(0, 0.05, 0);
    scene.add(innerPointLight);

    // Crown Parent Group with exact pitch tilt from Screenshot_2026_0913_223034.jpg
    const crownGroup = new THREE.Group();
    crownGroup.rotation.x = 0.44; // tilted forward to reveal elliptical interior
    scene.add(crownGroup);

    // Materials: Reflective Metallic Gold & Gleaming Chrome Silver
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffba14,
      emissive: 0x4f2b00,
      emissiveIntensity: 0.24,
      metalness: 0.98,
      roughness: 0.12,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f8fc,
      emissive: 0x161c26,
      emissiveIntensity: 0.14,
      metalness: 0.98,
      roughness: 0.09,
    });

    const bandMaterial = new THREE.MeshStandardMaterial({
      color: 0xffc424,
      emissive: 0x442400,
      emissiveIntensity: 0.22,
      metalness: 0.98,
      roughness: 0.14,
    });

    // Central circular gold band connecting the waists
    const crownRadius = 2.12;
    const bandGeometry = new THREE.TorusGeometry(crownRadius, 0.046, 24, 96);
    const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
    bandMesh.rotation.x = Math.PI / 2;
    crownGroup.add(bandMesh);

    // Subtle second inner rim band
    const innerRimGeo = new THREE.TorusGeometry(crownRadius * 0.982, 0.022, 16, 96);
    const innerRimMesh = new THREE.Mesh(innerRimGeo, bandMaterial);
    innerRimMesh.rotation.x = Math.PI / 2;
    innerRimMesh.position.y = 0.02;
    crownGroup.add(innerRimMesh);

    // 20 Alternating Figures (10 Gold, 10 Silver) perfectly matching the spacing in the screenshot
    const spikeCount = 20;

    // Upper Spire (4-sided diamond blade tapering to needle point)
    const upperSpireGeo = new THREE.CylinderGeometry(0.001, 0.078, 1.48, 4);
    upperSpireGeo.rotateY(Math.PI / 4);

    // Horizontal Shoulders / Crossbar
    const armsGeo = new THREE.BoxGeometry(0.46, 0.076, 0.07);

    // Head / Diamond Finial
    const headGeo = new THREE.CylinderGeometry(0.001, 0.062, 0.22, 4);
    headGeo.rotateY(Math.PI / 4);

    // Central Torso
    const torsoGeo = new THREE.BoxGeometry(0.125, 0.36, 0.075);

    // Lower Spike (4-sided diamond blade tapering downwards to needle point)
    const lowerSpikeGeo = new THREE.CylinderGeometry(0.078, 0.001, 1.36, 4);
    lowerSpikeGeo.rotateY(Math.PI / 4);

    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * Math.PI * 2;
      const isGold = i % 2 === 0;
      const currentMaterial = isGold ? goldMaterial : silverMaterial;

      const spikeGroup = new THREE.Group();

      // Upper spire pointing up
      const upperMesh = new THREE.Mesh(upperSpireGeo, currentMaterial);
      upperMesh.position.y = 0.92;
      spikeGroup.add(upperMesh);

      // Head / diamond finial
      const headMesh = new THREE.Mesh(headGeo, currentMaterial);
      headMesh.position.y = 0.32;
      spikeGroup.add(headMesh);

      // Horizontal shoulder crossbar
      const armsMesh = new THREE.Mesh(armsGeo, currentMaterial);
      armsMesh.position.y = 0.20;
      spikeGroup.add(armsMesh);

      // Center torso connected to the gold ring
      const torsoMesh = new THREE.Mesh(torsoGeo, currentMaterial);
      torsoMesh.position.y = 0.0;
      spikeGroup.add(torsoMesh);

      // Lower spike pointing down
      const lowerMesh = new THREE.Mesh(lowerSpikeGeo, currentMaterial);
      lowerMesh.position.y = -0.80;
      spikeGroup.add(lowerMesh);

      // Position along perimeter of the crown circle
      const x = Math.cos(angle) * crownRadius;
      const z = Math.sin(angle) * crownRadius;
      spikeGroup.position.set(x, 0, z);

      // Rotate so it faces tangentially outward from the center
      spikeGroup.rotation.y = -angle + Math.PI / 2;

      crownGroup.add(spikeGroup);
    }

    // Interactive Drag to Rotate + Smooth Auto-Rotation
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    const autoRotateSpeed = 0.009;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMouseX = clientX;
      previousMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMouseX;
      const deltaY = clientY - previousMouseY;

      crownGroup.rotation.y += deltaX * 0.01;
      crownGroup.rotation.x = Math.max(0.18, Math.min(0.75, crownGroup.rotation.x + deltaY * 0.005));

      previousMouseX = clientX;
      previousMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Continuous Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        crownGroup.rotation.y += autoRotateSpeed;
      }

      // Subtle breathing float animation
      crownGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }

      renderer.dispose();
      bandGeometry.dispose();
      innerRimGeo.dispose();
      upperSpireGeo.dispose();
      headGeo.dispose();
      armsGeo.dispose();
      torsoGeo.dispose();
      lowerSpikeGeo.dispose();
      goldMaterial.dispose();
      silverMaterial.dispose();
      bandMaterial.dispose();
    };
  }, [height]);

  if (webGLFailed) {
    return (
      <div
        className={`relative flex items-center justify-center cursor-pointer ${className}`}
        onClick={onClick}
      >
        <img
          src={exactCrownImage}
          alt="Gold Crown of Ozymandias"
          referrerPolicy="no-referrer"
          className="max-h-56 sm:max-h-76 w-auto object-contain drop-shadow-[0_12px_36px_rgba(234,179,8,0.25)]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full flex items-center justify-center select-none overflow-hidden bg-black ${className}`}
      style={{ height }}
    >
      {/* Warm ambient golden spotlight centered behind the crown matching Screenshot_2026_0913_223034.jpg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,_rgba(245,160,20,0.24)_0%,_rgba(234,179,8,0.06)_36%,_transparent_68%)] pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
        onClick={onClick}
      />
    </div>
  );
};
