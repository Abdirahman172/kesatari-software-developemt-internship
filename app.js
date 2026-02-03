// Simple Working 3D Profile Visualization

// Global variables
let camera, scene, renderer, controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };
let profileData = [];
let isAuthenticated = false;

// Authentication handling
function appHandleCredentialResponse(response) {
    console.log('Login successful:', response);
    isAuthenticated = true;
    
    // Hide login screen and show app
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    // Initialize the 3D visualization
    init();
    animate();
}

// Make the handler globally available
window.appHandleCredentialResponse = appHandleCredentialResponse;

// Check for pending response when script loads
if (window.pendingCredentialResponse) {
    appHandleCredentialResponse(window.pendingCredentialResponse);
    window.pendingCredentialResponse = null;
}

// Logout function
function logout() {
    isAuthenticated = false;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    
    // Clean up Three.js scene
    if (renderer && renderer.domElement) {
        renderer.domElement.remove();
    }
    
    // Reset global variables
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    objects = [];
    profileData = [];
}

// Initialize the application
async function init() {
    try {
        console.log('🚀 Starting application...');
        
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // Fetch profile data from Google Sheets
        await fetchProfileData();
        console.log(`✅ Loaded ${profileData.length} profiles`);
        
        // Wait for Three.js to be ready
        await waitForThreeJS();
        
        // Initialize Three.js scene
        initThreeJS();
        
        // Create profile elements
        createElements();
        
        // Setup layouts
        setupLayouts();
        
        // Set initial layout
        transform(targets.table, 2000);
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        console.log(`🎉 Application ready with ${profileData.length} profiles!`);
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Show error message
        showError(error.message);
    }
}

// Wait for Three.js to be ready
function waitForThreeJS() {
    return new Promise((resolve) => {
        function check() {
            if (typeof THREE !== 'undefined' && typeof TWEEN !== 'undefined') {
                console.log('✅ Three.js and TWEEN ready');
                resolve();
            } else {
                console.log('⏳ Waiting for Three.js...');
                setTimeout(check, 100);
            }
        }
        check();
    });
}

// Fetch profile data from Google Sheets
async function fetchProfileData() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv';
    
    try {
        console.log('📡 Fetching data from Google Sheets...');
        
        // Try direct fetch first
        let response = await fetch(csvUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            }
        });
        
        if (!response.ok) {
            console.log('⚠️ Direct fetch failed, trying CORS proxy...');
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(csvUrl);
            response = await fetch(proxyUrl);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('📄 CSV data received:', csvText.length, 'characters');
        
        profileData = parseCSV(csvText);
        
        if (profileData.length === 0) {
            throw new Error('No valid profiles found in CSV data');
        }
        
        console.log(`✅ Successfully loaded ${profileData.length} profiles`);
        console.log('👤 First profile:', profileData[0]?.name);
        console.log('👤 Last profile:', profileData[profileData.length - 1]?.name);
        
    } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        throw error;
    }
}

// Parse CSV data into profile objects
function parseCSV(csvText) {
    console.log('🔍 Parsing CSV data...');
    
    // Check if we got HTML instead of CSV
    if (csvText.includes('<html>') || csvText.includes('<!DOCTYPE')) {
        throw new Error('Google Sheet is not properly published as CSV format');
    }
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error(`CSV has insufficient data - only ${lines.length} lines`);
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 CSV Headers:', headers);
    
    // Find column indices
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const photoIndex = headers.findIndex(h => h.toLowerCase().includes('photo'));
    const ageIndex = headers.findIndex(h => h.toLowerCase().includes('age'));
    const countryIndex = headers.findIndex(h => h.toLowerCase().includes('country'));
    const interestIndex = headers.findIndex(h => h.toLowerCase().includes('interest'));
    const netWorthIndex = headers.findIndex(h => h.toLowerCase().includes('worth') || h.toLowerCase().includes('net'));
    
    if (nameIndex === -1 || ageIndex === -1 || countryIndex === -1) {
        throw new Error('CSV missing required headers: Name, Age, Country');
    }
    
    const profiles = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        
        if (values.length >= 3) {
            const name = (values[nameIndex] || `Person ${i}`).replace(/"/g, '').trim();
            const photo = photoIndex >= 0 ? (values[photoIndex] || '').replace(/"/g, '').trim() : '';
            const finalPhoto = photo || `https://via.placeholder.com/60x60/0,127,127/fff?text=${name.charAt(0)}`;
            const age = parseInt(values[ageIndex]) || 25;
            const country = (values[countryIndex] || 'Unknown').replace(/"/g, '').trim();
            const interest = interestIndex >= 0 ? (values[interestIndex] || 'General').replace(/"/g, '').trim() : 'General';
            
            let netWorth = 75000;
            if (netWorthIndex >= 0 && values[netWorthIndex]) {
                const netWorthStr = values[netWorthIndex].replace(/"/g, '').trim();
                netWorth = parseFloat(netWorthStr.replace(/[$,]/g, '')) || 75000;
            }
            
            profiles.push({
                name,
                photo: finalPhoto,
                age,
                country,
                interest,
                netWorth
            });
        }
    }
    
    console.log(`✅ Parsed ${profiles.length} valid profiles`);
    return profiles;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, ''));
}

// Initialize Three.js scene
function initThreeJS() {
    console.log('🎨 Initializing Three.js scene...');
    
    const container = document.getElementById('container');
    
    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create renderer using CSS3DRenderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    container.appendChild(renderer.domElement);
    
    // Create controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('✅ Three.js scene initialized');
}

// Create profile elements
function createElements() {
    console.log(`🎨 Creating ${profileData.length} profile elements...`);
    
    for (let i = 0; i < profileData.length; i++) {
        const profile = profileData[i];
        
        // Create element div
        const element = document.createElement('div');
        element.className = 'element';
        element.setAttribute('data-index', i);
        element.setAttribute('data-name', profile.name);
        
        // Determine net worth color class
        let networthClass = 'networth-low';
        if (profile.netWorth > 200000) {
            networthClass = 'networth-high';
        } else if (profile.netWorth > 100000) {
            networthClass = 'networth-medium';
        }
        element.classList.add(networthClass);
        
        // Format net worth
        const formattedNetWorth = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(profile.netWorth);
        
        // Create element content
        element.innerHTML = `
            <div class="number">${i + 1}</div>
            <img src="${profile.photo}" alt="${profile.name}" class="photo" onerror="this.src='https://via.placeholder.com/60x60/0,127,127/fff?text=${profile.name.charAt(0)}'">
            <div class="name">${profile.name}</div>
            <div class="age">Age: ${profile.age}</div>
            <div class="country">${profile.country}</div>
            <div class="interest">${profile.interest}</div>
            <div class="networth">${formattedNetWorth}</div>
        `;
        
        // Create CSS3D object
        const objectCSS = new THREE.CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        
        scene.add(objectCSS);
        objects.push(objectCSS);
    }
    
    console.log(`✅ Created ${objects.length} profile elements`);
}

// Setup layout targets
function setupLayouts() {
    console.log('📐 Setting up layouts...');
    
    // TABLE LAYOUT (20x10)
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        
        const col = i % 20;
        const row = Math.floor(i / 20);
        
        object.position.x = col * 140 - 1330;
        object.position.y = -(row * 180) + 990;
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
    
    // HELIX LAYOUT (Double Helix)
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        
        const isFirstHelix = i % 2 === 0;
        const helixIndex = Math.floor(i / 2);
        const y = (helixIndex / (objects.length / 2)) * 1000 - 500;
        const angle = helixIndex * 0.175 + (isFirstHelix ? 0 : Math.PI);
        
        object.position.x = Math.cos(angle) * 400;
        object.position.y = y;
        object.position.z = Math.sin(angle) * 400;
        
        const vector = new THREE.Vector3();
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        
        targets.helix.push(object);
    }
    
    // GRID LAYOUT (5x4x10)
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        
        const col = i % 5;
        const row = Math.floor(i / 5) % 4;
        const layer = Math.floor(i / 20);
        
        object.position.x = col * 200 - 400;
        object.position.y = row * 200 - 300;
        object.position.z = layer * 200 - 1000;
        
        targets.grid.push(object);
    }
    
    console.log('✅ Layouts setup complete');
}

// Transform to target layout
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
    
    // Set initial active button
    setActiveButton('table');
}

// Set active button
function setActiveButton(activeId) {
    const buttons = document.querySelectorAll('#menu button');
    buttons.forEach(button => button.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

// Render function
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

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(220, 53, 69, 0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        z-index: 2000;
        max-width: 500px;
    `;
    errorDiv.innerHTML = `
        <h3>Unable to Load Data</h3>
        <p>Failed to load profiles from Google Sheets.</p>
        <p><strong>Error:</strong> ${message}</p>
        <button onclick="location.reload()" style="margin: 10px; padding: 8px 16px; background: white; color: #dc3545; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
    `;
    document.body.appendChild(errorDiv);
}

// Add CSS3DRenderer and TrackballControls to THREE
window.addEventListener('load', function() {
    if (typeof THREE !== 'undefined') {
        console.log('✅ THREE.js loaded, adding CSS3D components...');
        
        // CSS3DObject
        THREE.CSS3DObject = function ( element ) {
            THREE.Object3D.call( this );
            this.element = element;
            this.element.style.position = 'absolute';
            this.element.style.pointerEvents = 'auto';
        };
        THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
        THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

        // CSS3DRenderer
        THREE.CSS3DRenderer = function ( parameters ) {
            var _this = this;
            var _width, _height;
            var _widthHalf, _heightHalf;
            var matrix = new THREE.Matrix4();
            var cache = {
                camera: { fov: 0, style: '' },
                objects: new WeakMap()
            };
            var domElement = document.createElement( 'div' );
            domElement.style.overflow = 'hidden';
            this.domElement = domElement;
            var cameraElement = document.createElement( 'div' );
            cameraElement.style.WebkitTransformStyle = 'preserve-3d';
            cameraElement.style.transformStyle = 'preserve-3d';
            domElement.appendChild( cameraElement );

            this.setSize = function ( width, height ) {
                _width = width;
                _height = height;
                _widthHalf = _width / 2;
                _heightHalf = _height / 2;
                domElement.style.width = width + 'px';
                domElement.style.height = height + 'px';
                cameraElement.style.width = width + 'px';
                cameraElement.style.height = height + 'px';
            };

            var epsilon = function ( value ) {
                return Math.abs( value ) < 1e-10 ? 0 : value;
            };

            var getCameraCSSMatrix = function ( matrix ) {
                var elements = matrix.elements;
                return 'matrix3d(' +
                    epsilon( elements[ 0 ] ) + ',' +
                    epsilon( - elements[ 1 ] ) + ',' +
                    epsilon( elements[ 2 ] ) + ',' +
                    epsilon( elements[ 3 ] ) + ',' +
                    epsilon( elements[ 4 ] ) + ',' +
                    epsilon( - elements[ 5 ] ) + ',' +
                    epsilon( elements[ 6 ] ) + ',' +
                    epsilon( elements[ 7 ] ) + ',' +
                    epsilon( elements[ 8 ] ) + ',' +
                    epsilon( - elements[ 9 ] ) + ',' +
                    epsilon( elements[ 10 ] ) + ',' +
                    epsilon( elements[ 11 ] ) + ',' +
                    epsilon( elements[ 12 ] ) + ',' +
                    epsilon( - elements[ 13 ] ) + ',' +
                    epsilon( elements[ 14 ] ) + ',' +
                    epsilon( elements[ 15 ] ) +
                ')';
            };

            var getObjectCSSMatrix = function ( matrix, cameraCSSMatrix ) {
                var elements = matrix.elements;
                var matrix3d = 'matrix3d(' +
                    epsilon( elements[ 0 ] ) + ',' +
                    epsilon( elements[ 1 ] ) + ',' +
                    epsilon( elements[ 2 ] ) + ',' +
                    epsilon( elements[ 3 ] ) + ',' +
                    epsilon( - elements[ 4 ] ) + ',' +
                    epsilon( - elements[ 5 ] ) + ',' +
                    epsilon( - elements[ 6 ] ) + ',' +
                    epsilon( - elements[ 7 ] ) + ',' +
                    epsilon( elements[ 8 ] ) + ',' +
                    epsilon( elements[ 9 ] ) + ',' +
                    epsilon( elements[ 10 ] ) + ',' +
                    epsilon( elements[ 11 ] ) + ',' +
                    epsilon( elements[ 12 ] ) + ',' +
                    epsilon( elements[ 13 ] ) + ',' +
                    epsilon( elements[ 14 ] ) + ',' +
                    epsilon( elements[ 15 ] ) +
                ')';
                if ( cameraCSSMatrix === 'none' ) {
                    return 'translate3d(-50%,-50%,0) ' + matrix3d;
                } else {
                    return 'translate3d(-50%,-50%,0) ' + matrix3d + ' ' + cameraCSSMatrix;
                }
            };

            var renderObject = function ( object, scene, camera, cameraCSSMatrix ) {
                if ( object instanceof THREE.CSS3DObject ) {
                    var style = getObjectCSSMatrix( object.matrixWorld, cameraCSSMatrix );
                    var element = object.element;
                    var cachedObject = cache.objects.get( object );
                    if ( cachedObject === undefined || cachedObject.style !== style ) {
                        element.style.WebkitTransform = style;
                        element.style.transform = style;
                        var objectData = { style: style };
                        cache.objects.set( object, objectData );
                    }
                    if ( element.parentNode !== cameraElement ) {
                        cameraElement.appendChild( element );
                    }
                }
                for ( var i = 0, l = object.children.length; i < l; i ++ ) {
                    renderObject( object.children[ i ], scene, camera, cameraCSSMatrix );
                }
            };

            this.render = function ( scene, camera ) {
                var fov = camera.projectionMatrix.elements[ 5 ] * _heightHalf;
                var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";
                if ( cache.camera.style !== style ) {
                    cameraElement.style.WebkitTransform = style;
                    cameraElement.style.transform = style;
                    cache.camera.style = style;
                }
                renderObject( scene, scene, camera, style );
            };
        };

        // TrackballControls
        THREE.TrackballControls = function ( object, domElement ) {
            var _this = this;
            var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };
            this.object = object;
            this.domElement = ( domElement !== undefined ) ? domElement : document;
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
            var _state = STATE.NONE,
            _eye = new THREE.Vector3(),
            _movePrev = new THREE.Vector2(),
            _moveCurr = new THREE.Vector2(),
            _zoomStart = new THREE.Vector2(),
            _zoomEnd = new THREE.Vector2();
            this.target0 = this.target.clone();
            this.position0 = this.object.position.clone();
            this.up0 = this.object.up.clone();

            this.handleResize = function () {
                if ( this.domElement === document ) {
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

            this.update = function () {
                _eye.subVectors( _this.object.position, _this.target );
                _this.object.position.addVectors( _this.target, _eye );
                _this.object.lookAt( _this.target );
                if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {
                    _this.dispatchEvent( { type: 'change' } );
                    lastPosition.copy( _this.object.position );
                }
            };

            function getMouseOnScreen( pageX, pageY ) {
                var vector = new THREE.Vector2();
                vector.set(
                    ( pageX - _this.screen.left ) / _this.screen.width,
                    ( pageY - _this.screen.top ) / _this.screen.height
                );
                return vector;
            }

            this.addEventListener = THREE.EventDispatcher.prototype.addEventListener;
            this.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener;
            this.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener;
            this.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;

            this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
            this.domElement.addEventListener( 'mousedown', function ( event ) {
                if ( _this.enabled === false ) return;
                event.preventDefault();
                event.stopPropagation();
                if ( _state === STATE.NONE ) {
                    _state = event.button;
                }
                if ( _state === STATE.ROTATE && ! _this.noRotate ) {
                    _moveCurr.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                    _movePrev.copy( _moveCurr );
                } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {
                    _zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                    _zoomEnd.copy( _zoomStart );
                }
                document.addEventListener( 'mousemove', mousemove, false );
                document.addEventListener( 'mouseup', mouseup, false );
            }, false );

            function mousemove( event ) {
                if ( _this.enabled === false ) return;
                event.preventDefault();
                event.stopPropagation();
                if ( _state === STATE.ROTATE && ! _this.noRotate ) {
                    _movePrev.copy( _moveCurr );
                    _moveCurr.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {
                    _zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                }
            }

            function mouseup( event ) {
                if ( _this.enabled === false ) return;
                event.preventDefault();
                event.stopPropagation();
                _state = STATE.NONE;
                document.removeEventListener( 'mousemove', mousemove );
                document.removeEventListener( 'mouseup', mouseup );
            }

            this.domElement.addEventListener( 'mousewheel', mousewheel, false );
            this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false );

            function mousewheel( event ) {
                if ( _this.enabled === false ) return;
                event.preventDefault();
                event.stopPropagation();
                var delta = 0;
                if ( event.wheelDelta ) {
                    delta = event.wheelDelta / 40;
                } else if ( event.detail ) {
                    delta = - event.detail / 3;
                }
                _eye.subVectors( _this.object.position, _this.target );
                _eye.multiplyScalar( 1 - delta * 0.01 );
                _this.object.position.addVectors( _this.target, _eye );
                _this.object.lookAt( _this.target );
            }

            this.handleResize();
        };
        THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
        THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;

        console.log('✅ CSS3D components added to THREE.js');
    }
});