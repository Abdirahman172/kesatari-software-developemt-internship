// EXACT Three.js Periodic Table Implementation with Profile Data

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
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // Fetch profile data from Google Sheets
        await fetchProfileData();
        
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
        
        console.log(`✅ Initialized with ${profileData.length} profiles`);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Show error message
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
            <p><strong>Error:</strong> ${error.message}</p>
            <button onclick="location.reload()" style="margin: 10px; padding: 8px 16px; background: white; color: #dc3545; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Fetch profile data from Google Sheets
async function fetchProfileData() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv';
    
    try {
        console.log('Fetching data from Google Sheets...');
        
        // Try direct fetch first
        let response = await fetch(csvUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            }
        });
        
        if (!response.ok) {
            // Try with CORS proxy
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(csvUrl);
            response = await fetch(proxyUrl);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data received:', csvText.length, 'characters');
        
        profileData = parseCSV(csvText);
        
        if (profileData.length === 0) {
            throw new Error('No valid profiles found in CSV data');
        }
        
        console.log(`✅ Successfully loaded ${profileData.length} profiles from Google Sheets`);
        console.log('First profile:', profileData[0]?.name);
        console.log('Last profile:', profileData[profileData.length - 1]?.name);
        
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
}

// Parse CSV data into profile objects
function parseCSV(csvText) {
    // Check if we got HTML instead of CSV
    if (csvText.includes('<html>') || csvText.includes('<!DOCTYPE') || csvText.includes('kasari-software')) {
        throw new Error('Google Sheet is not properly published as CSV format');
    }
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error(`CSV has insufficient data - only ${lines.length} lines`);
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers);
    
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
    if (profiles.length > 0) {
        console.log('First profile parsed:', profiles[0].name);
        console.log('Last profile parsed:', profiles[profiles.length - 1].name);
    }
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
    const container = document.getElementById('container');
    
    // Wait for all libraries to be loaded
    if (typeof THREE === 'undefined' || typeof THREE.CSS3DRenderer === 'undefined' || typeof THREE.TrackballControls === 'undefined') {
        console.log('Waiting for Three.js libraries to load...');
        setTimeout(initThreeJS, 100);
        return;
    }
    
    console.log('✅ All Three.js libraries loaded, initializing scene...');
    
    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Create controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('✅ Three.js scene initialized successfully');
}

// Create profile elements
function createElements() {
    console.log(`Creating ${profileData.length} profile elements...`);
    
    for (let i = 0; i < profileData.length; i++) {
        const profile = profileData[i];
        
        // Log first and last few profiles for verification
        if (i < 3 || i >= profileData.length - 3) {
            console.log(`Profile ${i + 1}: ${profile.name}`);
        }
        
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
    // TABLE LAYOUT (20x10) - Sequential ordering: left to right, top to bottom
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        
        // Calculate position: 20 columns, sequential row-by-row
        const col = i % 20;  // 0-19 columns
        const row = Math.floor(i / 20);  // Row number
        
        // Position calculation for proper spacing
        object.position.x = col * 140 - 1330;  // Center the grid
        object.position.y = -(row * 180) + 990;  // Top to bottom
        object.position.z = 0;
        
        targets.table.push(object);
    }
    
    console.log(`✅ Table layout created for ${objects.length} profiles`);
    console.log('First profile position:', targets.table[0]?.position);
    console.log('Last profile position:', targets.table[objects.length - 1]?.position);
    
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
}

// Transform to target layout
function transform(targets, duration) {
    // Wait for TWEEN to be available
    if (typeof TWEEN === 'undefined') {
        console.log('Waiting for TWEEN.js to load...');
        setTimeout(() => transform(targets, duration), 100);
        return;
    }
    
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
    if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
    }
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

// Check for pending response when script loads
if (window.pendingCredentialResponse) {
    appHandleCredentialResponse(window.pendingCredentialResponse);
    window.pendingCredentialResponse = null;
}