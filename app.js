// Global variables
let scene, camera, renderer, controls;
let objects = [];
let profileData = [];
let currentLayout = 'table';
let isAuthenticated = false;

// Authentication handling
function handleCredentialResponse(response) {
    console.log('Login successful');
    isAuthenticated = true;
    
    // Hide login screen and show app
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    // Initialize the 3D visualization
    initializeApp();
}

// Logout function
function logout() {
    isAuthenticated = false;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    
    // Clean up Three.js scene
    if (renderer) {
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

// Initialize the main application
async function initializeApp() {
    try {
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // Fetch data from Google Sheets
        await fetchProfileData();
        
        // Check if we have data
        if (!profileData || profileData.length === 0) {
            throw new Error('No profile data available');
        }
        
        // Initialize Three.js scene
        initThreeJS();
        
        // Create profile cards
        createProfileCards();
        
        // Set initial layout with proper camera positioning
        setLayout('table');
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Update data source indicator
        document.getElementById('profileCount').textContent = `${profileData.length} profiles loaded`;
        
        // Add debug info to UI
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo && profileData.length > 0) {
            debugInfo.textContent = `Data: ${profileData[0].name} → ${profileData[profileData.length - 1].name}`;
        }
        

        
        // Add debug info for development
        console.log(`✅ App initialized successfully with ${profileData.length} profiles`);
        console.log('Sample profiles:', profileData.slice(0, 3));
        console.log('Profile data summary:', {
            total: profileData.length,
            firstProfile: profileData[0],
            lastProfile: profileData[profileData.length - 1]
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Show more specific error message
        const errorMsg = error.message.includes('fetch') ? 
            'Unable to load data from Google Sheets. Using sample data instead.' :
            'Error loading data. Using sample data instead.';
            
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 193, 7, 0.9);
            color: #333;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
            font-size: 14px;
        `;
        notification.textContent = errorMsg;
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Try to continue without sample data - only use Google Sheets
        try {
            if (!profileData || profileData.length === 0) {
                throw new Error('No profile data available from Google Sheets');
            }
            
            initThreeJS();
            createProfileCards();
            setLayout('table');
            setupEventListeners();
            
        } catch (fallbackError) {
            console.error('Failed to initialize with fallback data:', fallbackError);
            
            // Show error message with detailed debugging info
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
                <p>Failed to load data from Google Sheets.</p>
                <div style="margin: 15px 0; font-size: 12px; text-align: left;">
                    <p><strong>Debug Info:</strong></p>
                    <p>URL: <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv" target="_blank" style="color: #fff;">Test Google Sheets URL</a></p>
                    <p>Error: ${fallbackError.message}</p>
                </div>
                <div>
                    <button onclick="location.reload()" style="margin: 5px; padding: 8px 16px; background: white; color: #dc3545; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                    <button onclick="window.open('https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv', '_blank')" style="margin: 5px; padding: 8px 16px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">Test URL</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        }
    }
}

// Fetch profile data from Google Sheets
async function fetchProfileData() {
    try {
        // Google Sheet CSV URL - Working URL with actual data
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv';
        
        try {
            // Try to fetch from Google Sheets with multiple approaches
            console.log('Fetching data from Google Sheets...');
            console.log('CSV URL:', csvUrl);
            
            let response;
            let csvText;
            
            // Method 1: Direct fetch with no-cors mode
            try {
                console.log('Trying direct fetch with no-cors...');
                response = await fetch(csvUrl, {
                    method: 'GET',
                    mode: 'no-cors'
                });
                console.log('Direct fetch response:', response);
                
                // For no-cors, we can't read the response, so try cors mode
                response = await fetch(csvUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'text/csv,text/plain,*/*'
                    }
                });
                
                if (response.ok) {
                    csvText = await response.text();
                    console.log('✅ Direct fetch successful, data length:', csvText.length);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (corsError) {
                console.log('Direct fetch failed:', corsError.message);
                
                // Method 2: CORS proxy
                try {
                    console.log('Trying CORS proxy...');
                    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(csvUrl);
                    console.log('Proxy URL:', proxyUrl);
                    
                    response = await fetch(proxyUrl);
                    
                    if (response.ok) {
                        csvText = await response.text();
                        console.log('✅ CORS proxy fetch successful, data length:', csvText.length);
                    } else {
                        throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (proxyError) {
                    console.log('CORS proxy failed:', proxyError.message);
                    
                    // Method 3: Alternative proxy
                    try {
                        console.log('Trying alternative proxy...');
                        const altProxyUrl = 'https://cors-anywhere.herokuapp.com/' + csvUrl;
                        console.log('Alt proxy URL:', altProxyUrl);
                        
                        response = await fetch(altProxyUrl);
                        
                        if (response.ok) {
                            csvText = await response.text();
                            console.log('✅ Alternative proxy fetch successful, data length:', csvText.length);
                        } else {
                            throw new Error(`Alt proxy HTTP ${response.status}: ${response.statusText}`);
                        }
                    } catch (altError) {
                        console.log('Alternative proxy failed:', altError.message);
                        console.error('All fetch methods failed. Details:', {
                            directError: corsError.message,
                            proxyError: proxyError.message,
                            altProxyError: altError.message
                        });
                        throw new Error('All fetch methods failed. CORS issue preventing data access.');
                    }
                }
            }
            
            if (csvText) {
                console.log('Raw CSV data received:', csvText.length, 'characters');
                console.log('First 200 characters:', csvText.substring(0, 200));
                
                profileData = parseCSV(csvText);
                
                if (profileData.length > 0) {
                    console.log(`✅ Successfully loaded ${profileData.length} profiles from Google Sheets`);
                    document.getElementById('dataSourceText').textContent = 'Data: Google Sheets';
                    return;
                } else {
                    console.warn('No valid profiles found in CSV data');
                    console.log('Full CSV text for debugging:', csvText);
                    throw new Error('No valid profiles could be parsed from the CSV data');
                }
            } else {
                throw new Error('No CSV data received');
            }
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            console.error('Error stack:', error.stack);
            
            // Show specific error message for publishing issues
            if (error.message.includes('not properly published')) {
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(220, 53, 69, 0.95);
                    color: white;
                    padding: 25px;
                    border-radius: 12px;
                    text-align: center;
                    z-index: 2000;
                    max-width: 600px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                `;
                errorDiv.innerHTML = `
                    <h3 style="margin: 0 0 15px 0;">❌ Google Sheet Not Properly Published</h3>
                    <p style="margin: 10px 0;">The Google Sheet is not published as CSV format.</p>
                    <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: left; font-size: 14px;">
                        <p><strong>To fix this:</strong></p>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Open your Google Sheet</li>
                            <li>Go to <strong>File → Share → Publish to web</strong></li>
                            <li>Select <strong>"Entire Document"</strong></li>
                            <li>Choose <strong>"Comma-separated values (.csv)"</strong></li>
                            <li>Click <strong>"Publish"</strong></li>
                            <li>Copy the new URL and update your code</li>
                        </ol>
                    </div>
                    <div style="margin: 15px 0;">
                        <p style="font-size: 12px; opacity: 0.8;">Current URL returns: "kasari-software" instead of CSV data</p>
                    </div>
                    <div>
                        <button onclick="location.reload()" style="margin: 5px; padding: 10px 20px; background: white; color: #dc3545; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Retry</button>
                        <button onclick="window.open('https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv', '_blank')" style="margin: 5px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer;">Test Current URL</button>
                    </div>
                `;
                document.body.appendChild(errorDiv);
                return;
            }
            
            throw error;
        }
        
        // If Google Sheets fails, show error - no sample data fallback
        console.error('Failed to load data from Google Sheets');
        throw new Error('Unable to load data from Google Sheets. Please check the sheet URL and ensure it is properly published as CSV.');
        
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
}

// Parse CSV data into profile objects
function parseCSV(csvText) {
    // Check if we got HTML instead of CSV
    if (csvText.includes('<html>') || csvText.includes('<!DOCTYPE') || csvText.includes('kasari-software')) {
        console.error('❌ Received HTML instead of CSV data. The Google Sheet is not properly published as CSV.');
        console.error('Received content:', csvText);
        throw new Error('Google Sheet is not properly published as CSV. Please ensure the sheet is published to web as CSV format.');
    }
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        console.error('❌ CSV has insufficient data - only', lines.length, 'lines');
        console.error('CSV content:', csvText);
        throw new Error(`CSV has insufficient data - only ${lines.length} lines found`);
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers found:', headers);
    
    // More flexible header validation - just check if we have basic required fields
    const hasName = headers.some(h => h.toLowerCase().includes('name'));
    const hasAge = headers.some(h => h.toLowerCase().includes('age'));
    const hasCountry = headers.some(h => h.toLowerCase().includes('country'));
    
    if (!hasName || !hasAge || !hasCountry) {
        console.error('❌ CSV missing required headers. Found:', headers);
        console.error('Need at least: Name, Age, Country');
        throw new Error(`CSV missing required headers. Found: ${headers.join(', ')}. Need at least: Name, Age, Country`);
    }
    
    // Find column indices
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const photoIndex = headers.findIndex(h => h.toLowerCase().includes('photo'));
    const ageIndex = headers.findIndex(h => h.toLowerCase().includes('age'));
    const countryIndex = headers.findIndex(h => h.toLowerCase().includes('country'));
    const interestIndex = headers.findIndex(h => h.toLowerCase().includes('interest'));
    const netWorthIndex = headers.findIndex(h => h.toLowerCase().includes('worth') || h.toLowerCase().includes('net'));
    
    console.log('Column indices:', { nameIndex, photoIndex, ageIndex, countryIndex, interestIndex, netWorthIndex });
    
    const profiles = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        console.log(`Row ${i} values:`, values);
        
        if (values.length >= 3) { // At least name, age, country
            // Extract data using found indices
            const name = (values[nameIndex] || `Person ${i}`).replace(/"/g, '').trim();
            const photo = photoIndex >= 0 ? (values[photoIndex] || '').replace(/"/g, '').trim() : '';
            const finalPhoto = photo || `https://via.placeholder.com/60x60/333/fff?text=${name.charAt(0)}`;
            const age = parseInt(values[ageIndex]) || 25;
            const country = (values[countryIndex] || 'Unknown').replace(/"/g, '').trim();
            const interest = interestIndex >= 0 ? (values[interestIndex] || 'General').replace(/"/g, '').trim() : 'General';
            
            // Parse net worth
            let netWorth = 75000; // Default value
            if (netWorthIndex >= 0 && values[netWorthIndex]) {
                const netWorthStr = values[netWorthIndex].replace(/"/g, '').trim();
                netWorth = parseFloat(netWorthStr.replace(/[$,]/g, '')) || 75000;
            }
            
            const profile = {
                name,
                photo: finalPhoto,
                age,
                country,
                interest,
                netWorth
            };
            
            console.log(`Parsed profile ${i}:`, profile);
            profiles.push(profile);
        }
    }
    
    console.log(`✅ Parsed ${profiles.length} valid profiles`);
    
    if (profiles.length === 0) {
        throw new Error('No valid profiles could be parsed from the CSV data');
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
    
    // Create scene - simplified version
    scene = new THREE.Scene();
    
    // Add children array if it doesn't exist
    if (!scene.children) {
        scene.children = [];
    }
    
    // Override add method to work with our CSS3DObjects
    const originalAdd = scene.add.bind(scene);
    scene.add = function(object) {
        if (object instanceof THREE.CSS3DObject) {
            // Add to our children array for CSS3D objects
            this.children.push(object);
        } else {
            // Use original add for regular Three.js objects
            originalAdd(object);
        }
    };
    
    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    
    // Create CSS3D renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    container.appendChild(renderer.domElement);
    
    // Create controls with better range for 200 profiles
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 200;   // Allow very close inspection
    controls.maxDistance = 15000; // Allow very far overview
    controls.addEventListener('change', render);
    
    // Set initial camera position
    camera.position.set(0, 0, 4000);
    camera.lookAt(0, 0, 0);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Create profile cards as 3D objects
function createProfileCards() {
    objects = [];
    
    profileData.forEach((profile, index) => {
        // Create DOM element for the card
        const element = document.createElement('div');
        element.className = 'profile-card';
        
        // Determine net worth color class - exactly as specified
        let networthClass = 'networth-low';  // Red for < $100K
        if (profile.netWorth > 200000) {
            networthClass = 'networth-high';  // Green for > $200K
        } else if (profile.netWorth > 100000) {
            networthClass = 'networth-medium'; // Orange for > $100K
        }
        
        element.classList.add(networthClass);
        
        // Format net worth for display
        const formattedNetWorth = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(profile.netWorth);
        
        element.innerHTML = `
            <div class="profile-index" style="position: absolute; top: 2px; left: 2px; background: rgba(0,0,0,0.7); color: white; font-size: 10px; padding: 2px 4px; border-radius: 3px;">#${index + 1}</div>
            <img src="${profile.photo}" alt="${profile.name}" class="profile-photo" onerror="this.src='https://via.placeholder.com/60x60/333/fff?text=${profile.name.charAt(0)}'">
            <div class="profile-name">${profile.name}</div>
            <div class="profile-age">Age: ${profile.age}</div>
            <div class="profile-country">${profile.country}</div>
            <div class="profile-interest">${profile.interest}</div>
            <div class="profile-networth">${formattedNetWorth}</div>
        `;
        
        // Create CSS3D object
        const object = new THREE.CSS3DObject(element);
        
        // Store the original index for proper ordering
        object.userData = { originalIndex: index, profile: profile };
        
        // Set initial position (will be overridden by layout)
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
        
        scene.add(object);
        objects.push(object);
    });
    
    console.log(`Created ${objects.length} profile cards in correct order`);
    console.log(`First card: ${objects[0].userData.profile.name}`);
    console.log(`Last card: ${objects[objects.length-1].userData.profile.name}`);
}

// Layout functions
function setLayout(layoutType) {
    currentLayout = layoutType;
    
    // Update active button
    document.querySelectorAll('.layout-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(layoutType + 'Btn').classList.add('active');
    
    console.log(`Switching to ${layoutType} layout with ${objects.length} profiles`);
    
    switch (layoutType) {
        case 'table':
            setTableLayout();
            break;
        case 'sphere':
            setSphereLayout();
            break;
        case 'helix':
            setHelixLayout();
            break;
        case 'grid':
            setGridLayout();
            break;
    }
    
    // Animate to new positions
    animateToLayout();
    
    // Update controls target after layout change
    setTimeout(() => {
        controls.target.set(0, 0, 0);
        controls.update();
        render();
    }, 100);
}

// Table layout (20 columns × 10 rows) - handles all profiles properly
function setTableLayout() {
    const cols = 20;
    const rows = Math.ceil(objects.length / cols); // Dynamic rows based on actual data
    
    console.log(`Table layout: ${objects.length} profiles in ${cols} cols × ${rows} rows`);
    
    objects.forEach((object, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        object.position.x = col * 140 - (cols * 140) / 2;
        object.position.y = -(row * 180) + (rows * 180) / 2;
        object.position.z = 0;
        
        object.rotation.x = 0;
        object.rotation.y = 0;
        object.rotation.z = 0;
    });
    
    // Adjust camera to show all profiles
    const tableWidth = cols * 140;
    const tableHeight = rows * 180;
    const maxDimension = Math.max(tableWidth, tableHeight);
    const optimalDistance = maxDimension * 1.2; // 20% padding
    
    camera.position.set(0, 0, Math.max(optimalDistance, 2000));
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
    // Update layout info
    updateLayoutInfo(`Table: ${cols}×${rows} (${objects.length} profiles)`);
    
    // Verify order
    console.log(`Table layout - First visible: ${objects[0].userData.profile.name}, Last visible: ${objects[objects.length-1].userData.profile.name}`);
}

// Sphere layout - properly distribute all profiles
function setSphereLayout() {
    const radius = 800;
    const totalProfiles = objects.length;
    
    console.log(`Sphere layout: ${totalProfiles} profiles on sphere with radius ${radius}`);
    
    objects.forEach((object, index) => {
        const phi = Math.acos(-1 + (2 * index) / totalProfiles);
        const theta = Math.sqrt(totalProfiles * Math.PI) * phi;
        
        object.position.x = radius * Math.cos(theta) * Math.sin(phi);
        object.position.y = radius * Math.sin(theta) * Math.sin(phi);
        object.position.z = radius * Math.cos(phi);
        
        // Simple lookAt implementation for our CSS3DObject
        const distance = Math.sqrt(
            object.position.x * object.position.x + 
            object.position.y * object.position.y + 
            object.position.z * object.position.z
        );
        
        // Rotate to face outward from center
        object.rotation.y = Math.atan2(object.position.x, object.position.z);
        object.rotation.x = Math.asin(object.position.y / distance);
    });
    
    // Position camera to see the full sphere
    camera.position.set(0, 0, radius * 2.5);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
    // Update layout info
    updateLayoutInfo(`Sphere: ${totalProfiles} profiles on radius ${radius}`);
}

// Double Helix layout - properly distribute all profiles
function setHelixLayout() {
    const radius = 600;
    const totalProfiles = objects.length;
    const height = Math.max(2000, totalProfiles * 10); // Dynamic height based on profile count
    
    console.log(`Double Helix layout: ${totalProfiles} profiles in double helix, height: ${height}`);
    
    objects.forEach((object, index) => {
        const isFirstHelix = index % 2 === 0;
        const helixIndex = Math.floor(index / 2);
        const y = (helixIndex / (totalProfiles / 2)) * height - height / 2;
        const angle = helixIndex * 0.175 + (isFirstHelix ? 0 : Math.PI);
        
        object.position.x = Math.cos(angle) * radius;
        object.position.y = y;
        object.position.z = Math.sin(angle) * radius;
        
        object.rotation.x = 0;
        object.rotation.y = -angle;
        object.rotation.z = 0;
    });
    
    // Position camera to see the full helix
    camera.position.set(radius * 2, 0, radius * 2);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
    // Update layout info
    updateLayoutInfo(`Double Helix: ${totalProfiles} profiles, height ${height}`);
}

// Grid layout (5 × 4 × 10) - properly distribute all profiles
function setGridLayout() {
    const cols = 5;
    const rows = 4;
    const totalProfiles = objects.length;
    const layers = Math.ceil(totalProfiles / (cols * rows)); // Dynamic layers based on actual data
    
    console.log(`Grid layout: ${totalProfiles} profiles in ${cols}×${rows}×${layers} grid`);
    
    objects.forEach((object, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols) % rows;
        const layer = Math.floor(index / (cols * rows));
        
        object.position.x = col * 200 - (cols * 200) / 2;
        object.position.y = row * 200 - (rows * 200) / 2;
        object.position.z = layer * 200 - (layers * 200) / 2;
        
        object.rotation.x = 0;
        object.rotation.y = 0;
        object.rotation.z = 0;
    });
    
    // Position camera to see the full grid
    const gridWidth = cols * 200;
    const gridHeight = rows * 200;
    const gridDepth = layers * 200;
    const maxDimension = Math.max(gridWidth, gridHeight, gridDepth);
    const optimalDistance = maxDimension * 1.5;
    
    camera.position.set(optimalDistance * 0.7, optimalDistance * 0.5, optimalDistance * 0.7);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
    // Update layout info
    updateLayoutInfo(`Grid: ${cols}×${rows}×${layers} (${totalProfiles} profiles)`);
}


// Animate objects to their new positions
function animateToLayout() {
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    // Store initial positions
    const initialPositions = objects.map(obj => ({
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        rx: obj.rotation.x,
        ry: obj.rotation.y,
        rz: obj.rotation.z
    }));
    
    // Store target positions
    const targetPositions = objects.map(obj => ({
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        rx: obj.rotation.x,
        ry: obj.rotation.y,
        rz: obj.rotation.z
    }));
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        objects.forEach((obj, index) => {
            const initial = initialPositions[index];
            const target = targetPositions[index];
            
            obj.position.x = initial.x + (target.x - initial.x) * easeProgress;
            obj.position.y = initial.y + (target.y - initial.y) * easeProgress;
            obj.position.z = initial.z + (target.z - initial.z) * easeProgress;
            
            obj.rotation.x = initial.rx + (target.rx - initial.rx) * easeProgress;
            obj.rotation.y = initial.ry + (target.ry - initial.ry) * easeProgress;
            obj.rotation.z = initial.rz + (target.rz - initial.rz) * easeProgress;
        });
        
        render();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('tableBtn').addEventListener('click', () => setLayout('table'));
    document.getElementById('sphereBtn').addEventListener('click', () => setLayout('sphere'));
    document.getElementById('helixBtn').addEventListener('click', () => setLayout('helix'));
    document.getElementById('gridBtn').addEventListener('click', () => setLayout('grid'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Update layout information display
function updateLayoutInfo(info) {
    const layoutInfo = document.getElementById('layoutInfo');
    if (layoutInfo) {
        layoutInfo.textContent = info;
    }
}

// Render function
function render() {
    renderer.render(scene, camera);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

// Start animation loop when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, checking Three.js...');
    
    // Wait for all Three.js components to load
    function checkThreeJS() {
        // Check if Three.js loaded properly
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded!');
            setTimeout(checkThreeJS, 500);
            return;
        }
        
        // Check if CSS3DRenderer is available and is a constructor
        if (typeof THREE.CSS3DRenderer === 'undefined') {
            console.log('Waiting for CSS3DRenderer...');
            setTimeout(checkThreeJS, 500);
            return;
        }
        
        // Test if CSS3DRenderer is actually a constructor
        try {
            const testRenderer = new THREE.CSS3DRenderer();
            console.log('✅ CSS3DRenderer constructor test passed');
        } catch (error) {
            console.error('❌ CSS3DRenderer constructor test failed:', error);
            setTimeout(checkThreeJS, 500);
            return;
        }
        
        // Check if TrackballControls is available and is a constructor
        if (typeof THREE.TrackballControls === 'undefined') {
            console.log('Waiting for TrackballControls...');
            setTimeout(checkThreeJS, 500);
            return;
        }
        
        // Test if TrackballControls is actually a constructor
        try {
            const testCamera = new THREE.PerspectiveCamera();
            const testControls = new THREE.TrackballControls(testCamera);
            console.log('✅ TrackballControls constructor test passed');
        } catch (error) {
            console.error('❌ TrackballControls constructor test failed:', error);
            setTimeout(checkThreeJS, 500);
            return;
        }
        
        console.log('✅ All Three.js components loaded successfully');
        console.log('THREE.CSS3DRenderer:', typeof THREE.CSS3DRenderer);
        console.log('THREE.TrackballControls:', typeof THREE.TrackballControls);
        animate();
    }
    
    // Start checking immediately
    checkThreeJS();
});

// Make handleCredentialResponse globally available for Google Sign-In
window.handleCredentialResponse = handleCredentialResponse;