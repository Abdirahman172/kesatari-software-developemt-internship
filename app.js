// 3D Profile Visualization - Periodic Table Style
// Based on Three.js CSS3D Periodic Table Example

// Global variables
let camera, scene, renderer, controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };
let profileData = [];
let isAuthenticated = false;

// Configuration - YOUR SPECIFIC SETTINGS
const CONFIG = {
    // Your Google OAuth Client ID
    CLIENT_ID: "953717110168-ld8sea9hpv1q67levd6n5bqo25asfvv1.apps.googleusercontent.com",
    
    // Your Google Sheets CSV URL
    SHEETS_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv",
    
    // Auto-start for deployment (set to true to bypass login)
    AUTO_START: true
};

// Auto-start functionality
if (CONFIG.AUTO_START) {
    window.addEventListener('load', function() {
        console.log('🚀 Auto-starting application...');
        setTimeout(() => {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('appContainer').style.display = 'block';
            isAuthenticated = true;
            init();
            animate();
        }, 1000);
    });
}

// Authentication handling
function appHandleCredentialResponse(response) {
    console.log('Login successful:', response);
    isAuthenticated = true;
    
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    init();
    animate();
}

window.appHandleCredentialResponse = appHandleCredentialResponse;

// Check for pending response
if (window.pendingCredentialResponse) {
    appHandleCredentialResponse(window.pendingCredentialResponse);
    window.pendingCredentialResponse = null;
}

// Logout function
function logout() {
    isAuthenticated = false;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    
    if (renderer && renderer.domElement) {
        renderer.domElement.remove();
    }
    
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    objects = [];
    profileData = [];
}

// Initialize application
async function init() {
    try {
        console.log('🚀 Initializing 3D Profile Visualization...');
        
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // Fetch profile data
        await fetchProfileData();
        console.log(`✅ Loaded ${profileData.length} profiles`);
        
        // Wait for Three.js
        await waitForThreeJS();
        
        // Initialize 3D scene
        initThreeJS();
        
        // Create profile elements
        createElements();
        
        // Setup layouts
        setupLayouts();
        
        // Set initial layout
        transform(targets.table, 2000);
        
        // Setup event listeners
        setupEventListeners();
        
        document.getElementById('loadingIndicator').style.display = 'none';
        
        console.log(`🎉 Application ready with ${profileData.length} profiles!`);
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        showError(error.message);
    }
}

// Wait for Three.js to be ready
function waitForThreeJS() {
    return new Promise((resolve) => {
        function check() {
            if (typeof THREE !== 'undefined' && typeof TWEEN !== 'undefined' && window.threeJSReady) {
                console.log('✅ Three.js components ready');
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
    try {
        console.log('📡 Fetching data from Google Sheets...');
        console.log('📍 URL:', CONFIG.SHEETS_URL);
        
        let response;
        
        // Try direct fetch first
        try {
            response = await fetch(CONFIG.SHEETS_URL, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/csv,text/plain,*/*'
                }
            });
            
            if (response.ok) {
                console.log('✅ Direct fetch successful');
            } else {
                throw new Error(`Direct fetch failed: ${response.status}`);
            }
        } catch (directError) {
            console.log('⚠️ Direct fetch failed, trying CORS proxy...');
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(CONFIG.SHEETS_URL);
            response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`CORS proxy failed: ${response.status}`);
            }
            console.log('✅ CORS proxy fetch successful');
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
        console.log('🔄 Using fallback test data...');
        
        profileData = generateFallbackData();
        console.log(`✅ Using ${profileData.length} fallback profiles`);
    }
}

// Parse CSV data
function parseCSV(csvText) {
    console.log('🔍 Parsing CSV data...');
    
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

// Parse CSV line with quoted values
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

// Generate fallback data
function generateFallbackData() {
    const profiles = [];
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Anna', 'Chris', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'China'];
    const interests = ['Technology', 'Sports', 'Music', 'Art', 'Science', 'Travel', 'Food', 'Books', 'Movies', 'Gaming'];
    
    for (let i = 0; i < 200; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName} ${Math.floor(i / 100) + 1}`;
        
        profiles.push({
            name: name,
            photo: `https://via.placeholder.com/60x60/0,127,127/fff?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
            age: 25 + (i % 40),
            country: countries[i % countries.length],
            interest: interests[i % interests.length],
            netWorth: 50000 + (i * 2500)
        });
    }
    
    // Ensure specific profiles for verification
    profiles[0] = {
        name: 'Lee Siew Suan',
        photo: 'https://via.placeholder.com/60x60/0,127,127/fff?text=LS',
        age: 28,
        country: 'Malaysia',
        interest: 'Technology',
        netWorth: 75000
    };
    
    profiles[199] = {
        name: 'Collen McClintock',
        photo: 'https://via.placeholder.com/60x60/0,127,127/fff?text=CM',
        age: 45,
        country: 'USA',
        interest: 'Business',
        netWorth: 550000
    };
    
    return profiles;
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
    
    // Create renderer
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
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    if (controls) {
        controls.update();
    }
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