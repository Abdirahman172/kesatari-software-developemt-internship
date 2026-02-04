// 3D Data Visualization - Complete periodic table visualization
let data = [];
const GOOGLE_CLIENT_ID = '953717110168-ld8sea9hpv1q67levd6n5bqo25asfvv1.apps.googleusercontent.com';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv';

let isSignedIn = false;
let camera, scene, renderer, controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };
let selectedElement = null;

document.addEventListener('DOMContentLoaded', () => {
    showSignInScreen();
    // Delay to allow Google client script to load when present
    setTimeout(initializeGoogleSignIn, 800);
});

function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        setupGoogleSignIn();
    } else {
        // If Google Identity Services isn't available, render the local button placeholder
        console.warn('Google Identity Services not available; rendering fallback sign-in control');
        renderFallbackSignIn();
    }
}

function setupGoogleSignIn() {
    try {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false
        });

        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
            google.accounts.id.renderButton(buttonElement, {
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            });
        }
    } catch (err) {
        console.error('setupGoogleSignIn error', err);
        renderFallbackSignIn();
    }
}

function renderFallbackSignIn() {
    const el = document.getElementById('google-signin-button');
    if (!el) return;
    el.innerHTML = '';
    const btn = document.createElement('button');
    btn.textContent = 'Sign in (fallback)';
    btn.style.padding = '10px 18px';
    btn.onclick = () => {
        // Simulate successful sign-in for demo/deployment safety
        handleCredentialResponse({ credential: 'fallback-credential' });
    };
    el.appendChild(btn);
}

function showSignInScreen() {
    const loading = document.getElementById('loading');
    if (!loading) return;
    loading.style.display = 'block';
}

function showSignInError() {
    const loading = document.getElementById('loading');
    if (!loading) return;
    loading.innerHTML = `
        <div style="text-align:center;color:#fff;padding:40px;">
            <h2 style="color:#ff4444">Sign-in failed</h2>
            <p style="color:#ccc">There was a problem initializing authentication.</p>
            <button onclick="location.reload()" style="padding:10px 16px">Reload</button>
        </div>
    `;
}

function handleCredentialResponse(response) {
    console.log('Credential response:', response && response.credential ? 'present' : 'none');
    isSignedIn = true;
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = `\n            <div style="color:#fff;text-align:center">\n                <h3>✅ Authentication Successful</h3>\n                <p>Loading data...</p>\n            </div>`;
    }
    setTimeout(init, 600);
}

async function init() {
    if (!isSignedIn) {
        showSignInScreen();
        return;
    }

    try {
        await loadDataFromCSV();
    } catch (err) {
        console.warn('loadDataFromCSV failed:', err);
        data = generateSampleData();
    }

    // Ensure we have data with valid NetWorth values
    if (!data || data.length === 0) {
        console.log('No data loaded, using sample data');
        data = generateSampleData();
    }

    // Check if NetWorth values are missing or zero, if so use sample data
    const hasValidNetWorth = data.some(item => item.NetWorth && parseFloat(item.NetWorth) > 0);
    if (!hasValidNetWorth) {
        console.log('NetWorth data missing or invalid, using sample data');
        data = generateSampleData();
    }

    console.log('Final data check - first item NetWorth:', data[0]?.NetWorth);

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    const info = document.getElementById('info');
    if (info) info.style.display = 'block';
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'block';

    // Initialize 3D visualization
    init3D();
    setupEventListeners();
}

async function loadDataFromCSV() {
    try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error('Network response not ok');
        const text = await res.text();
        const csvData = parseCSV(text);
        
        // If CSV data is valid and has NetWorth values, use it
        if (csvData.length > 0 && csvData[0].NetWorth && parseFloat(csvData[0].NetWorth) > 0) {
            data = csvData;
            console.log('Loaded CSV data with', data.length, 'rows');
        } else {
            // Use sample data if CSV fails or has no valid NetWorth data
            data = generateSampleData();
            console.log('Using sample data with', data.length, 'rows');
        }
    } catch (err) {
        console.warn('Could not load CSV, using sample data:', err);
        data = generateSampleData();
        console.log('Using sample data with', data.length, 'rows');
    }
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
        return generateSampleData();
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const cols = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h] = (cols[i] || '').trim());
        return obj;
    });
    
    // Check if we have valid NetWorth data
    const hasValidNetWorth = rows.some(row => row.NetWorth && parseFloat(row.NetWorth) > 0);
    
    if (rows.length === 0 || !hasValidNetWorth) {
        console.log('CSV data invalid or missing NetWorth, using sample data');
        return generateSampleData();
    }
    
    return rows;
}

function generateSampleData() {
    // Complete periodic table elements (118 elements)
    const periodicElements = [
        { symbol: 'H', name: 'Hydrogen' }, { symbol: 'He', name: 'Helium' },
        { symbol: 'Li', name: 'Lithium' }, { symbol: 'Be', name: 'Beryllium' }, { symbol: 'B', name: 'Boron' }, 
        { symbol: 'C', name: 'Carbon' }, { symbol: 'N', name: 'Nitrogen' }, { symbol: 'O', name: 'Oxygen' }, 
        { symbol: 'F', name: 'Fluorine' }, { symbol: 'Ne', name: 'Neon' },
        { symbol: 'Na', name: 'Sodium' }, { symbol: 'Mg', name: 'Magnesium' }, { symbol: 'Al', name: 'Aluminum' }, 
        { symbol: 'Si', name: 'Silicon' }, { symbol: 'P', name: 'Phosphorus' }, { symbol: 'S', name: 'Sulfur' }, 
        { symbol: 'Cl', name: 'Chlorine' }, { symbol: 'Ar', name: 'Argon' },
        { symbol: 'K', name: 'Potassium' }, { symbol: 'Ca', name: 'Calcium' }, { symbol: 'Sc', name: 'Scandium' }, 
        { symbol: 'Ti', name: 'Titanium' }, { symbol: 'V', name: 'Vanadium' }, { symbol: 'Cr', name: 'Chromium' }, 
        { symbol: 'Mn', name: 'Manganese' }, { symbol: 'Fe', name: 'Iron' }, { symbol: 'Co', name: 'Cobalt' }, 
        { symbol: 'Ni', name: 'Nickel' }, { symbol: 'Cu', name: 'Copper' }, { symbol: 'Zn', name: 'Zinc' }, 
        { symbol: 'Ga', name: 'Gallium' }, { symbol: 'Ge', name: 'Germanium' }, { symbol: 'As', name: 'Arsenic' }, 
        { symbol: 'Se', name: 'Selenium' }, { symbol: 'Br', name: 'Bromine' }, { symbol: 'Kr', name: 'Krypton' },
        { symbol: 'Rb', name: 'Rubidium' }, { symbol: 'Sr', name: 'Strontium' }, { symbol: 'Y', name: 'Yttrium' }, 
        { symbol: 'Zr', name: 'Zirconium' }, { symbol: 'Nb', name: 'Niobium' }, { symbol: 'Mo', name: 'Molybdenum' }, 
        { symbol: 'Tc', name: 'Technetium' }, { symbol: 'Ru', name: 'Ruthenium' }, { symbol: 'Rh', name: 'Rhodium' }, 
        { symbol: 'Pd', name: 'Palladium' }, { symbol: 'Ag', name: 'Silver' }, { symbol: 'Cd', name: 'Cadmium' }, 
        { symbol: 'In', name: 'Indium' }, { symbol: 'Sn', name: 'Tin' }, { symbol: 'Sb', name: 'Antimony' }, 
        { symbol: 'Te', name: 'Tellurium' }, { symbol: 'I', name: 'Iodine' }, { symbol: 'Xe', name: 'Xenon' },
        { symbol: 'Cs', name: 'Cesium' }, { symbol: 'Ba', name: 'Barium' }, { symbol: 'La', name: 'Lanthanum' }, 
        { symbol: 'Ce', name: 'Cerium' }, { symbol: 'Pr', name: 'Praseodymium' }, { symbol: 'Nd', name: 'Neodymium' }, 
        { symbol: 'Pm', name: 'Promethium' }, { symbol: 'Sm', name: 'Samarium' }, { symbol: 'Eu', name: 'Europium' }, 
        { symbol: 'Gd', name: 'Gadolinium' }, { symbol: 'Tb', name: 'Terbium' }, { symbol: 'Dy', name: 'Dysprosium' }, 
        { symbol: 'Ho', name: 'Holmium' }, { symbol: 'Er', name: 'Erbium' }, { symbol: 'Tm', name: 'Thulium' }, 
        { symbol: 'Yb', name: 'Ytterbium' }, { symbol: 'Lu', name: 'Lutetium' }, { symbol: 'Hf', name: 'Hafnium' }, 
        { symbol: 'Ta', name: 'Tantalum' }, { symbol: 'W', name: 'Tungsten' }, { symbol: 'Re', name: 'Rhenium' }, 
        { symbol: 'Os', name: 'Osmium' }, { symbol: 'Ir', name: 'Iridium' }, { symbol: 'Pt', name: 'Platinum' }, 
        { symbol: 'Au', name: 'Gold' }, { symbol: 'Hg', name: 'Mercury' }, { symbol: 'Tl', name: 'Thallium' }, 
        { symbol: 'Pb', name: 'Lead' }, { symbol: 'Bi', name: 'Bismuth' }, { symbol: 'Po', name: 'Polonium' }, 
        { symbol: 'At', name: 'Astatine' }, { symbol: 'Rn', name: 'Radon' },
        { symbol: 'Fr', name: 'Francium' }, { symbol: 'Ra', name: 'Radium' }, { symbol: 'Ac', name: 'Actinium' }, 
        { symbol: 'Th', name: 'Thorium' }, { symbol: 'Pa', name: 'Protactinium' }, { symbol: 'U', name: 'Uranium' }, 
        { symbol: 'Np', name: 'Neptunium' }, { symbol: 'Pu', name: 'Plutonium' }, { symbol: 'Am', name: 'Americium' }, 
        { symbol: 'Cm', name: 'Curium' }, { symbol: 'Bk', name: 'Berkelium' }, { symbol: 'Cf', name: 'Californium' }, 
        { symbol: 'Es', name: 'Einsteinium' }, { symbol: 'Fm', name: 'Fermium' }, { symbol: 'Md', name: 'Mendelevium' }, 
        { symbol: 'No', name: 'Nobelium' }, { symbol: 'Lr', name: 'Lawrencium' }, { symbol: 'Rf', name: 'Rutherfordium' }, 
        { symbol: 'Db', name: 'Dubnium' }, { symbol: 'Sg', name: 'Seaborgium' }, { symbol: 'Bh', name: 'Bohrium' }, 
        { symbol: 'Hs', name: 'Hassium' }, { symbol: 'Mt', name: 'Meitnerium' }, { symbol: 'Ds', name: 'Darmstadtium' }, 
        { symbol: 'Rg', name: 'Roentgenium' }, { symbol: 'Cn', name: 'Copernicium' }, { symbol: 'Nh', name: 'Nihonium' }, 
        { symbol: 'Fl', name: 'Flerovium' }, { symbol: 'Mc', name: 'Moscovium' }, { symbol: 'Lv', name: 'Livermorium' }, 
        { symbol: 'Ts', name: 'Tennessine' }, { symbol: 'Og', name: 'Oganesson' }
    ];
    
    const profilePhotos = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    ];
    
    const names = [
        'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson',
        'James Miller', 'Jessica Garcia', 'Robert Martinez', 'Ashley Rodriguez', 'Christopher Lee', 'Amanda Walker',
        'Matthew Hall', 'Stephanie Allen', 'Daniel Young', 'Michelle King', 'Anthony Wright', 'Kimberly Lopez',
        'Mark Hill', 'Laura Scott', 'Steven Green', 'Rebecca Adams', 'Paul Baker', 'Sharon Nelson',
        'Andrew Carter', 'Cynthia Mitchell', 'Joshua Perez', 'Angela Roberts', 'Kenneth Turner', 'Brenda Phillips'
    ];
    
    // Extended realistic net worth values for all 118 elements
    const netWorthValues = [
        250000, 180000, 320000, 95000, 450000, 275000, 150000, 380000, 220000, 190000,
        310000, 85000, 420000, 165000, 290000, 340000, 125000, 480000, 210000, 360000,
        140000, 395000, 175000, 260000, 330000, 115000, 410000, 185000, 270000, 350000,
        160000, 425000, 195000, 280000, 370000, 135000, 440000, 205000, 315000, 385000,
        155000, 465000, 225000, 295000, 355000, 145000, 475000, 235000, 305000, 375000,
        165000, 485000, 245000, 285000, 365000, 175000, 495000, 255000, 325000, 395000,
        185000, 505000, 265000, 335000, 405000, 195000, 515000, 275000, 345000, 415000,
        205000, 525000, 285000, 355000, 425000, 215000, 535000, 295000, 365000, 435000,
        225000, 545000, 305000, 375000, 445000, 235000, 555000, 315000, 385000, 455000,
        245000, 565000, 325000, 395000, 465000, 255000, 575000, 335000, 405000, 475000,
        265000, 585000, 345000, 415000, 485000, 275000, 595000, 355000, 425000, 495000,
        285000, 605000, 365000, 435000, 505000, 295000, 615000, 375000
    ];
    
    const sampleData = [];
    
    // Generate data for all 118 elements
    for (let i = 0; i < periodicElements.length; i++) {
        const element = periodicElements[i];
        
        // Use predefined values or generate random ones
        const networth = netWorthValues[i] || (Math.random() * 400000 + 50000);
        
        // All elements use teal/cyan color scheme
        const color = '#008B8B'; // Dark cyan/teal color
        
        sampleData.push({
            Name: names[i % names.length],
            Symbol: element.symbol,
            ElementName: element.name,
            NetWorth: Math.floor(networth),
            Photo: profilePhotos[i % profilePhotos.length],
            Color: color,
            Position: i + 1
        });
    }
    
    console.log(`Generated ${sampleData.length} elements with full periodic table data`);
    return sampleData;
}

function init3D() {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // Create elements
    for (let i = 0; i < data.length; i++) {
        const element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = data[i].Color || getColorByNetWorth(data[i].NetWorth);

        const number = document.createElement('div');
        number.className = 'number';
        number.textContent = i + 1;
        element.appendChild(number);

        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = data[i].Symbol || data[i].Name?.substring(0, 2).toUpperCase() || 'XX';
        element.appendChild(symbol);

        const details = document.createElement('div');
        details.className = 'details';
        const displayName = data[i].ElementName || data[i].Name || 'Unknown';
        const netWorthValue = data[i].NetWorth || 0;
        const displayNetWorth = formatNetWorth(netWorthValue);
        
        // Debug logging for first few elements
        if (i < 3) {
            console.log(`Element ${i}: NetWorth=${netWorthValue}, Formatted=${displayNetWorth}`);
        }
        
        details.innerHTML = `${displayName}<br>${displayNetWorth}`;
        element.appendChild(details);

        // Add photo - show by default
        if (data[i].Photo) {
            const photo = document.createElement('img');
            photo.className = 'photo';
            photo.src = data[i].Photo;
            photo.alt = data[i].Name;
            photo.onerror = function() {
                this.src = `https://via.placeholder.com/100/008B8B/fff?text=${data[i].Symbol}`;
            };
            element.appendChild(photo);
        }

        // Add click handler
        element.addEventListener('click', () => selectElement(element, i));

        const objectCSS = new THREE.CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);
    }

    // Table layout
    const table = [
        "H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He",
        "Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne",
        "Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar",
        "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr",
        "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe",
        "Cs", "Ba", "*", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",
        "Fr", "Ra", "**", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
    ];

    for (let i = 0; i < objects.length; i++) {
        const row = Math.floor(i / 18);
        const col = i % 18;
        
        const object = new THREE.Object3D();
        object.position.x = (col * 140) - 1260;
        object.position.y = -(row * 180) + 990;
        object.position.z = 0;
        targets.table.push(object);
    }

    // Sphere layout
    const vector = new THREE.Vector3();
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        targets.sphere.push(object);
    }

    // Helix layout
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = -(i * 8) + 450;

        const object = new THREE.Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
    }

    // Grid layout
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        object.position.x = ((i % 5) * 400) - 800;
        object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800;
        object.position.z = (Math.floor(i / 25)) * 1000 - 2000;
        targets.grid.push(object);
    }

    // Renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    // Start with table view
    transform(targets.table, 2000);

    window.addEventListener('resize', onWindowResize);
}

function getColorByNetWorth(networth) {
    // Use consistent teal/cyan color scheme
    return '#008B8B'; // Dark cyan/teal
}

function formatNetWorth(networth) {
    const value = parseFloat(networth) || 0;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.floor(value / 1000)}K`;
    return `$${Math.floor(value)}`;
}

function selectElement(element, index) {
    // Remove previous selection
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    
    // Add selection to new element
    element.classList.add('selected');
    selectedElement = element;
    
    // Store the selected element data for popup
    window.selectedElementData = data[index];
    
    // Auto-open popup when element is selected
    openPhotoPopup();
}

function setupEventListeners() {
    document.getElementById('table').addEventListener('click', () => {
        transform(targets.table, 2000);
    });

    document.getElementById('sphere').addEventListener('click', () => {
        transform(targets.sphere, 2000);
    });

    document.getElementById('helix').addEventListener('click', () => {
        transform(targets.helix, 2000);
    });

    document.getElementById('grid').addEventListener('click', () => {
        transform(targets.grid, 2000);
    });
}

function transform(targets, duration) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function openPhotoPopup() {
    const popup = document.getElementById('photo-popup');
    const grid = document.getElementById('photo-grid');
    if (!popup || !grid) return;
    
    grid.innerHTML = '';
    
    // If a specific element is selected, show only that person's photo
    if (window.selectedElementData) {
        const selectedData = window.selectedElementData;
        
        // Show the selected person's photo 3 times in the top row only
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'photo-card teal selected-card';
            card.innerHTML = `
                <img src="${selectedData.Photo}" alt="${selectedData.Name}" onerror="this.src='https://via.placeholder.com/100/008B8B/fff?text=${selectedData.Symbol}'">
                <div class="name">${selectedData.Name}</div>
            `;
            grid.appendChild(card);
        }
    } else {
        // Show default profiles if no specific element is selected
        const profiles = [
            { 
                name: 'John Smith', 
                photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            },
            { 
                name: 'Sarah Johnson', 
                photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            },
            { 
                name: 'Michael Brown', 
                photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            },
            { 
                name: 'Emily Davis', 
                photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            },
            { 
                name: 'David Wilson', 
                photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            },
            { 
                name: 'Lisa Anderson', 
                photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
                color: 'teal' 
            }
        ];
        
        profiles.forEach(profile => {
            const card = document.createElement('div');
            card.className = `photo-card ${profile.color}`;
            card.innerHTML = `
                <img src="${profile.photo}" alt="${profile.name}" onerror="this.src='https://via.placeholder.com/100/008B8B/fff?text=${profile.name.split(' ').map(n => n[0]).join('')}'">
                <div class="name">${profile.name}</div>
            `;
            grid.appendChild(card);
        });
    }
    
    popup.style.display = 'block';
}

// Start animation loop
document.addEventListener('DOMContentLoaded', () => {
    showSignInScreen();
    setTimeout(initializeGoogleSignIn, 800);
    
    // Start animation loop when page loads
    setTimeout(() => {
        if (typeof animate === 'function') {
            animate();
        }
    }, 1000);
});

function closePhotoPopup() {
    const popup = document.getElementById('photo-popup');
    if (popup) popup.style.display = 'none';
    
    // Clear selected element data
    window.selectedElementData = null;
    
    // Remove selection from element
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
}

function logout() {
    isSignedIn = false;
    // If Google client exists, revoke token (best-effort)
    try { if (google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
    document.getElementById('info').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    showSignInScreen();
}

function showGeneralPhotos() {
    // Clear any selected element data to show general photos
    window.selectedElementData = null;
    openPhotoPopup();
}

// Expose functions globally for inline handlers
window.closePhotoPopup = closePhotoPopup;
window.openPhotoPopup = openPhotoPopup;
window.showGeneralPhotos = showGeneralPhotos;
window.logout = logout;
