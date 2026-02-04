// Simple 3D Profile Visualization
let camera, scene, renderer, controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };

// Sample profile data
const profileData = [
    { name: "John Smith", age: 28, country: "USA", interest: "Technology", netWorth: 75000 },
    { name: "Jane Doe", age: 32, country: "Canada", interest: "Art", netWorth: 120000 },
    { name: "Mike Johnson", age: 25, country: "UK", interest: "Sports", netWorth: 85000 },
    { name: "Sarah Wilson", age: 29, country: "Australia", interest: "Music", netWorth: 95000 },
    { name: "David Brown", age: 35, country: "Germany", interest: "Science", netWorth: 150000 },
    { name: "Lisa Davis", age: 27, country: "France", interest: "Travel", netWorth: 110000 },
    { name: "Tom Miller", age: 31, country: "Japan", interest: "Food", netWorth: 130000 },
    { name: "Anna Garcia", age: 26, country: "Spain", interest: "Books", netWorth: 90000 },
    { name: "Chris Martinez", age: 33, country: "Italy", interest: "Movies", netWorth: 105000 },
    { name: "Emma Rodriguez", age: 30, country: "Brazil", interest: "Gaming", netWorth: 115000 },
    { name: "James Wilson", age: 34, country: "Mexico", interest: "Photography", netWorth: 125000 },
    { name: "Mary Johnson", age: 28, country: "India", interest: "Fitness", netWorth: 80000 },
    { name: "Robert Davis", age: 36, country: "China", interest: "Cooking", netWorth: 140000 },
    { name: "Patricia Miller", age: 29, country: "Russia", interest: "Dancing", netWorth: 100000 },
    { name: "Michael Garcia", age: 31, country: "South Korea", interest: "Writing", netWorth: 135000 },
    { name: "Jennifer Martinez", age: 27, country: "Netherlands", interest: "Painting", netWorth: 95000 },
    { name: "William Rodriguez", age: 33, country: "Sweden", interest: "Swimming", netWorth: 145000 },
    { name: "Linda Wilson", age: 30, country: "Norway", interest: "Hiking", netWorth: 120000 },
    { name: "Richard Johnson", age: 32, country: "Denmark", interest: "Yoga", netWorth: 110000 },
    { name: "Elizabeth Davis", age: 28, country: "Finland", interest: "Fashion", netWorth: 85000 }
];

// CSS3D Components
function initCSS3D() {
    // CSS3DObject
    THREE.CSS3DObject = function(element) {
        THREE.Object3D.call(this);
        this.element = element;
        this.element.style.position = 'absolute';
        this.element.style.pointerEvents = 'auto';
    };
    THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype);
    THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

    // CSS3DRenderer
    THREE.CSS3DRenderer = function() {
        var _this = this;
        var _width, _height;
        var _widthHalf, _heightHalf;
        var matrix = new THREE.Matrix4();
        var cache = { camera: { fov: 0, style: '' }, objects: new WeakMap() };
        
        var domElement = document.createElement('div');
        domElement.style.overflow = 'hidden';
        this.domElement = domElement;
        
        var cameraElement = document.createElement('div');
        cameraElement.style.WebkitTransformStyle = 'preserve-3d';
        cameraElement.style.transformStyle = 'preserve-3d';
        domElement.appendChild(cameraElement);

        this.setSize = function(width, height) {
            _width = width;
            _height = height;
            _widthHalf = _width / 2;
            _heightHalf = _height / 2;
            domElement.style.width = width + 'px';
            domElement.style.height = height + 'px';
            cameraElement.style.width = width + 'px';
            cameraElement.style.height = height + 'px';
        };

        var epsilon = function(value) {
            return Math.abs(value) < 1e-10 ? 0 : value;
        };

        var getCameraCSSMatrix = function(matrix) {
            var elements = matrix.elements;
            return 'matrix3d(' +
                epsilon(elements[0]) + ',' + epsilon(-elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' +
                epsilon(elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(elements[6]) + ',' + epsilon(elements[7]) + ',' +
                epsilon(elements[8]) + ',' + epsilon(-elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' +
                epsilon(elements[12]) + ',' + epsilon(-elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
        };

        var getObjectCSSMatrix = function(matrix, cameraCSSMatrix) {
            var elements = matrix.elements;
            var matrix3d = 'matrix3d(' +
                epsilon(elements[0]) + ',' + epsilon(elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' +
                epsilon(-elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(-elements[6]) + ',' + epsilon(-elements[7]) + ',' +
                epsilon(elements[8]) + ',' + epsilon(elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' +
                epsilon(elements[12]) + ',' + epsilon(elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
            
            return cameraCSSMatrix === 'none' ? 
                'translate3d(-50%,-50%,0) ' + matrix3d : 
                'translate3d(-50%,-50%,0) ' + matrix3d + ' ' + cameraCSSMatrix;
        };

        var renderObject = function(object, scene, camera, cameraCSSMatrix) {
            if (object instanceof THREE.CSS3DObject) {
                var style = getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix);
                var element = object.element;
                var cachedObject = cache.objects.get(object);
                
                if (cachedObject === undefined || cachedObject.style !== style) {
                    element.style.WebkitTransform = style;
                    element.style.transform = style;
                    cache.objects.set(object, { style: style });
                }
                
                if (element.parentNode !== cameraElement) {
                    cameraElement.appendChild(element);
                }
            }
            
            for (var i = 0; i < object.children.length; i++) {
                renderObject(object.children[i], scene, camera, cameraCSSMatrix);
            }
        };

        this.render = function(scene, camera) {
            var fov = camera.projectionMatrix.elements[5] * _heightHalf;
            var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse) + 
                       " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";
            
            if (cache.camera.style !== style) {
                cameraElement.style.WebkitTransform = style;
                cameraElement.style.transform = style;
                cache.camera.style = style;
            }
            
            renderObject(scene, scene, camera, style);
        };
    };

    // TrackballControls
    THREE.TrackballControls = function(object, domElement) {
        var _this = this;
        var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
        
        this.object = object;
        this.domElement = domElement || document;
        this.enabled = true;
        this.screen = { left: 0, top: 0, width: 0, height: 0 };
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.2;
        this.panSpeed = 0.3;
        this.noRotate = false;
        this.noZoom = false;
        this.noPan = false;
        this.staticMoving = false;
        this.dynamicDampingFactor = 0.2;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.target = new THREE.Vector3();
        
        var EPS = 0.000001;
        var lastPosition = new THREE.Vector3();
        var _state = STATE.NONE;
        var _eye = new THREE.Vector3();
        var _movePrev = new THREE.Vector2();
        var _moveCurr = new THREE.Vector2();
        var _zoomStart = new THREE.Vector2();
        var _zoomEnd = new THREE.Vector2();
        
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.up0 = this.object.up.clone();

        this.handleResize = function() {
            if (this.domElement === document) {
                this.screen.left = 0;
                this.screen.top = 0;
                this.screen.width = window.innerWidth;
                this.screen.height = window.innerHeight;
            } else {
                var box = this.domElement.getBoundingClientRect();
                var d = this.domElement.ownerDocument.documentElement;
                this.screen.left = box.left + window.pageXOffset - d.clientLeft;
                this.screen.top = box.top + window.pageYOffset - d.clientTop;
                this.screen.width = box.width;
                this.screen.height = box.height;
            }
        };

        this.update = function() {
            _eye.subVectors(_this.object.position, _this.target);
            _this.object.position.addVectors(_this.target, _eye);
            _this.object.lookAt(_this.target);
            
            if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
                _this.dispatchEvent({ type: 'change' });
                lastPosition.copy(_this.object.position);
            }
        };

        function getMouseOnScreen(pageX, pageY) {
            var vector = new THREE.Vector2();
            vector.set(
                (pageX - _this.screen.left) / _this.screen.width,
                (pageY - _this.screen.top) / _this.screen.height
            );
            return vector;
        }

        this.addEventListener = THREE.EventDispatcher.prototype.addEventListener;
        this.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener;
        this.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener;
        this.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;

        this.domElement.addEventListener('contextmenu', function(event) { event.preventDefault(); }, false);
        
        this.domElement.addEventListener('mousedown', function(event) {
            if (_this.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            
            if (_state === STATE.NONE) {
                _state = event.button;
            }
            
            if (_state === STATE.ROTATE && !_this.noRotate) {
                _moveCurr.copy(getMouseOnScreen(event.pageX, event.pageY));
                _movePrev.copy(_moveCurr);
            } else if (_state === STATE.ZOOM && !_this.noZoom) {
                _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
                _zoomEnd.copy(_zoomStart);
            }
            
            document.addEventListener('mousemove', mousemove, false);
            document.addEventListener('mouseup', mouseup, false);
        }, false);

        function mousemove(event) {
            if (_this.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            
            if (_state === STATE.ROTATE && !_this.noRotate) {
                _movePrev.copy(_moveCurr);
                _moveCurr.copy(getMouseOnScreen(event.pageX, event.pageY));
            } else if (_state === STATE.ZOOM && !_this.noZoom) {
                _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
            }
        }

        function mouseup(event) {
            if (_this.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            
            _state = STATE.NONE;
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }

        this.domElement.addEventListener('wheel', function(event) {
            if (_this.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            
            var delta = 0;
            if (event.wheelDelta) {
                delta = event.wheelDelta / 40;
            } else if (event.detail) {
                delta = -event.detail / 3;
            }
            
            _eye.subVectors(_this.object.position, _this.target);
            _eye.multiplyScalar(1 - delta * 0.01);
            _this.object.position.addVectors(_this.target, _eye);
            _this.object.lookAt(_this.target);
        }, false);

        this.handleResize();
    };
    
    THREE.TrackballControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;
}

// Initialize everything
function init() {
    console.log('Initializing 3D Profile Visualization...');
    
    // Initialize CSS3D components
    initCSS3D();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Create controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);
    
    // Create elements
    createElements();
    
    // Setup layouts
    setupLayouts();
    
    // Set initial layout
    transform(targets.table, 2000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    console.log('3D Profile Visualization ready!');
}

// Create profile elements
function createElements() {
    for (let i = 0; i < profileData.length; i++) {
        const profile = profileData[i];
        
        // Create element
        const element = document.createElement('div');
        element.className = 'element';
        
        // Format net worth
        const formattedNetWorth = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(profile.netWorth);
        
        // Create content
        element.innerHTML = `
            <div class="number">${i + 1}</div>
            <img src="https://via.placeholder.com/50x50/0,127,127/fff?text=${profile.name.charAt(0)}" alt="${profile.name}" class="photo">
            <div class="name">${profile.name}</div>
            <div class="details">
                Age: ${profile.age}<br>
                ${profile.country}<br>
                ${profile.interest}<br>
                ${formattedNetWorth}
            </div>
        `;
        
        // Create 3D object
        const objectCSS = new THREE.CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        
        scene.add(objectCSS);
        objects.push(objectCSS);
    }
}

// Setup layouts
function setupLayouts() {
    // TABLE LAYOUT
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const col = i % 5;
        const row = Math.floor(i / 5);
        
        object.position.x = col * 200 - 400;
        object.position.y = -(row * 200) + 400;
        object.position.z = 0;
        
        targets.table.push(object);
    }
    
    // SPHERE LAYOUT
    const radius = 800;
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const phi = Math.acos(-1 + (2 * i) / objects.length);
        const theta = Math.sqrt(objects.length * Math.PI) * phi;
        
        object.position.x = radius * Math.cos(theta) * Math.sin(phi);
        object.position.y = radius * Math.sin(theta) * Math.sin(phi);
        object.position.z = radius * Math.cos(phi);
        
        const vector = new THREE.Vector3();
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        
        targets.sphere.push(object);
    }
    
    // HELIX LAYOUT
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const y = (i / objects.length) * 1000 - 500;
        const angle = i * 0.5;
        
        object.position.x = Math.cos(angle) * 400;
        object.position.y = y;
        object.position.z = Math.sin(angle) * 400;
        
        targets.helix.push(object);
    }
    
    // GRID LAYOUT
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const col = i % 4;
        const row = Math.floor(i / 4) % 5;
        const layer = Math.floor(i / 20);
        
        object.position.x = col * 200 - 300;
        object.position.y = row * 200 - 400;
        object.position.z = layer * 200 - 200;
        
        targets.grid.push(object);
    }
}

// Transform to layout
function transform(targets, duration) {
    TWEEN.removeAll();
    
    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];
        
        new TWEEN.Tween(object.position)
            .to({
                x: target.position.x,
                y: target.position.y,
                z: target.position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        
        new TWEEN.Tween(object.rotation)
            .to({
                x: target.rotation.x,
                y: target.rotation.y,
                z: target.rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
    
    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('table').addEventListener('click', () => {
        transform(targets.table, 2000);
        setActiveButton('table');
    });
    
    document.getElementById('sphere').addEventListener('click', () => {
        transform(targets.sphere, 2000);
        setActiveButton('sphere');
    });
    
    document.getElementById('helix').addEventListener('click', () => {
        transform(targets.helix, 2000);
        setActiveButton('helix');
    });
    
    document.getElementById('grid').addEventListener('click', () => {
        transform(targets.grid, 2000);
        setActiveButton('grid');
    });
}

// Set active button
function setActiveButton(activeId) {
    const buttons = document.querySelectorAll('.controls button');
    buttons.forEach(button => button.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

// Render
function render() {
    renderer.render(scene, camera);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

// Start when page loads
window.addEventListener('load', function() {
    setTimeout(() => {
        init();
        animate();
    }, 500);
});