// Local Three.js setup - fallback if CDN fails
console.log('Loading local Three.js fallback...');

// Check if THREE is already loaded
if (typeof THREE === 'undefined') {
    console.error('THREE.js core library not loaded');
    document.body.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(220, 53, 69, 0.9); color: white; padding: 20px; 
                    border-radius: 8px; text-align: center; max-width: 400px;">
            <h3>Three.js Required</h3>
            <p>This application requires Three.js library for 3D visualization.</p>
            <p>Please check your internet connection and refresh the page.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; 
                    background: white; color: #dc3545; border: none; border-radius: 4px; cursor: pointer;">
                Refresh Page
            </button>
        </div>
    `;
} else {
    console.log('✅ THREE.js core loaded successfully');
    
    // Check for required components
    setTimeout(() => {
        if (typeof THREE.CSS3DRenderer === 'undefined') {
            console.warn('CSS3DRenderer not found, attempting to load...');
            // You could add fallback loading logic here
        }
        
        if (typeof THREE.TrackballControls === 'undefined') {
            console.warn('TrackballControls not found, attempting to load...');
            // You could add fallback loading logic here
        }
    }, 1000);
}