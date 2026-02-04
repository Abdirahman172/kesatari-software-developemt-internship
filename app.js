// 3D Data Visualization - Simple Google Sign-In
let camera, scene, renderer;
let controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };
let data = [];

// Google Configuration
const GOOGLE_CLIENT_ID = '953717110168-ld8sea9hpv1q67levd6n5bqo25asfvv1.apps.googleusercontent.com';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv';
const HTML_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pubhtml';

let isSignedIn = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    showSignInScreen();
    // Give a moment for the DOM to be ready, then initialize Google Sign-In
    setTimeout(initializeGoogleSignIn, 500);
});

function initializeGoogleSignIn() {
    // Wait for Google Identity Services to load
    if (typeof google !== 'undefined' && google.accounts) {
        setupGoogleSignIn();
    } else {
        // Wait a bit more for Google to load
        setTimeout(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                setupGoogleSignIn();
            } else {
                console.error('Google Identity Services failed to load');
                showSignInError();
            }
        }, 2000);
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
        
        // Render the sign-in button
        google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { 
                theme: "filled_blue", 
                size: "large",
                width: 300,
                text: "signin_with",
                shape: "rectangular"
            }
        );
        
        console.log('Google Sign-In initialized successfully');
        
    } catch (error) {
        console.error('Error setting up Google Sign-In:', error);
        showSignInError();
    }
}

function showSignInError() {
    document.getElementById('loading').innerHTML = `
        <div style="text-align: center; color: #fff; padding: 40px;">
            <h1 style="font-size: 48px; margin-bottom: 50px; color: #fff;">Welcome Back</h1>
            <div style="
                border: 2px solid #444;
                border-radius: 8px;
                padding: 40px;
                background: #222;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                max-width: 400px;
                margin: 0 auto;
            ">
                <h3 style="color: #ff4444;">⚠️ Sign-In Issue</h3>
                <p style="color: #666;">Unable to initialize Google authentication</p>
                <button onclick="location.reload()" style="
                    background: #4285f4;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 10px;
                ">🔄 Reload Page</button>
            </div>
        </div>
    `;
}

function showSignInScreen() {
    document.getElementById('loading').innerHTML = `
        <div style="text-align: center; color: #fff; padding: 40px;">
            <h1 style="font-size: 48px; margin-bottom: 50px; color: #fff;">Welcome Back</h1>
            <div style="
                border: 2px solid #444;
                border-radius: 8px;
                padding: 40px;
                background: #222;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                max-width: 400px;
                margin: 0 auto;
            ">
                <p style="margin-bottom: 30px; color: #ccc; font-size: 16px;">Please sign in to continue</p>
                <div id="google-signin-button" style="display: flex; justify-content: center;"></div>
            </div>
        </div>
    `;
}

function handleCredentialResponse(response) {
    console.log("Google Sign-In successful!");
    console.log("Credential:", response.credential);
    isSignedIn = true;
    
    // Show loading message
    document.getElementById('loading').innerHTML = `
        <div style="color: #fff; text-align: center;">
            <h3>✅ Authentication Successful!</h3>
            <p>Loading your data...</p>
        </div>
    `;
    
    // Load data and start visualization
    setTimeout(init, 1000);
}

async function init() {
    if (!isSignedIn) {
        showSignInScreen();
        return;
    }
    
    try {
        console.log('Loading data from your spreadsheet...');
        await loadDataFromCSV();
        
        // Hide loading and show UI elements
        document.getElementById('loading').style.display = 'none';
        document.getElementById('info').style.display = 'block';
        document.getElementById('menu').style.display = 'block';
        