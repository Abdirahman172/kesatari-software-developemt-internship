// Three.js Bundle - Modern ES6 Module approach
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { CSS3DRenderer, CSS3DObject } from 'https://unpkg.com/three@0.158.0/examples/jsm/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/TrackballControls.js';

// Make THREE global
window.THREE = THREE;
window.THREE.CSS3DRenderer = CSS3DRenderer;
window.THREE.CSS3DObject = CSS3DObject;
window.THREE.TrackballControls = TrackballControls;

console.log('✅ Three.js bundle loaded successfully');