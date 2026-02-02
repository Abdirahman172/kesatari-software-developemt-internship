# 3D Profile Visualization - Complete Setup Guide

A complete frontend web application that displays profile data from Google Sheets in an interactive 3D visualization using Three.js CSS3DRenderer, meeting all specified requirements.

## 🎯 Requirements Checklist

✅ **Google Sheets Integration**: Fetches data from published Google Sheet  
✅ **Google Authentication**: Secure login with Google Identity Services  
✅ **3D Periodic Table Style**: Based on Three.js CSS3D periodic table demo  
✅ **Custom Data Structure**: Replaces chemical elements with profile data  
✅ **Net Worth Color Coding**: Red (<$100K), Orange ($100K-$200K), Green (>$200K)  
✅ **Four Layout Modes**: Table (20×10), Sphere, Double Helix, Grid (5×4×10)  
✅ **Responsive Design**: Works across different screen sizes  

## 🚀 Quick Start

### Step 1: Create Google Sheet

1. **Create a new Google Sheet** with exactly these columns:
   ```
   Name | Photo | Age | Country | Interest | Net Worth
   ```

2. **Add your data** following the format in `sample-data.csv`

3. **Share with lisa@kasatria.com**:
   - Click "Share" button
   - Add `lisa@kasatria.com` with "Viewer" access
   - Click "Send"

4. **Publish to web**:
   - File → Share → Publish to web
   - Choose "Entire Document" and "Comma-separated values (.csv)"
   - Click "Publish"
   - Copy the published URL

5. **Update the CSV URL** in `app.js` line 67:
   ```javascript
   const csvUrl = 'YOUR_PUBLISHED_CSV_URL_HERE';
   ```

### Step 2: Google Cloud Project Setup

The app currently uses a demo Client ID. For production:

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable Google Identity Services**:
   - APIs & Services → Library
   - Search "Google Identity" and enable

3. **Create OAuth 2.0 Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client IDs
   - Application type: Web application
   - Add your domain to authorized origins

4. **Update Client ID** in `index.html` line 12:
   ```html
   data-client_id="YOUR_CLIENT_ID_HERE"
   ```

### Step 3: Deploy

#### Option A: GitHub Pages
1. Push code to GitHub repository
2. Settings → Pages → Select source branch
3. Access at `https://username.github.io/repository-name`

#### Option B: Netlify
1. Drag project folder to [Netlify](https://netlify.com)
2. Get instant URL

#### Option C: Vercel
1. Connect GitHub repo to [Vercel](https://vercel.com)
2. Auto-deploy on commits

## 📊 Data Structure Requirements

Your Google Sheet must have these exact columns:

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| Name | Text | "John Smith" | Full name of person |
| Photo | URL | "https://..." | Profile image URL |
| Age | Number | 28 | Age in years |
| Country | Text | "USA" | Country name |
| Interest | Text | "Technology" | Area of interest |
| Net Worth | Number | 150000 | Net worth in USD |

## 🎨 Layout Specifications

### 1. Table Layout (20×10)
- **Grid**: 20 columns × 10 rows = 200 profiles max
- **Spacing**: 140px horizontal, 180px vertical
- **View**: Front-facing periodic table style

### 2. Sphere Layout
- **Algorithm**: Fibonacci sphere distribution
- **Radius**: 800px
- **Rotation**: Cards face outward from center

### 3. Double Helix Layout
- **Structure**: Two intertwined helical spirals
- **Radius**: 600px per helix
- **Height**: 2000px total
- **Alternating**: Profiles alternate between helixes

### 4. Grid Layout (5×4×10)
- **Dimensions**: 5 wide × 4 high × 10 deep
- **Spacing**: 200px in all directions
- **Total**: 200 profiles in 3D cube

## 🎨 Color Coding System

Profile cards are automatically colored based on Net Worth:

- 🔴 **Red**: Net Worth < $100,000
- 🟠 **Orange**: Net Worth $100,000 - $200,000  
- 🟢 **Green**: Net Worth > $200,000

## 🔧 Technical Architecture

### Core Technologies
- **Three.js v0.158.0**: 3D graphics engine
- **CSS3DRenderer**: HTML/CSS in 3D space
- **TrackballControls**: Interactive camera controls
- **Google Identity Services**: Authentication
- **Vanilla JavaScript**: No frameworks, pure performance

### File Structure
```
├── index.html          # Main application
├── app.js             # Core JavaScript logic
├── styles.css         # All styling
├── three-bundle.js    # Three.js module loader
├── sample-data.csv    # Example data format
└── README.md          # This documentation
```

### Performance Features
- **Hardware Acceleration**: CSS3D uses GPU
- **Smooth Animations**: 60fps transitions between layouts
- **Efficient Rendering**: Optimized for 200+ profiles
- **Memory Management**: Proper cleanup on logout

## 🎮 User Interface

### Controls
- **Table Button**: Switch to 20×10 grid layout
- **Sphere Button**: Switch to spherical arrangement
- **Double Helix Button**: Switch to DNA-style double helix
- **Grid Button**: Switch to 5×4×10 3D cube
- **Logout Button**: Return to login screen

### Interactions
- **Mouse Drag**: Rotate camera around scene
- **Mouse Wheel**: Zoom in/out
- **Card Hover**: Highlight and scale effect
- **Smooth Transitions**: 2-second animated layout changes

## 🔒 Security & Privacy

- **Client-side Only**: No server required
- **Google OAuth**: Secure authentication
- **HTTPS Required**: For production deployment
- **No Data Storage**: No local data persistence
- **Public Sheets**: Google Sheets must be publicly readable

## 🐛 Troubleshooting

### Common Issues

1. **"Login not working"**
   - Check Client ID is correct
   - Verify domain is authorized in Google Cloud Console
   - Ensure HTTPS in production

2. **"Data not loading"**
   - Verify Google Sheet is published to web
   - Check CSV URL is correct
   - Ensure sheet has proper column headers

3. **"3D not rendering"**
   - Check browser supports WebGL
   - Verify Three.js loaded (check console)
   - Try different browser

4. **"Performance issues"**
   - Reduce number of profiles
   - Close other browser tabs
   - Check hardware acceleration enabled

### Debug Information
Open browser console (F12) to see detailed logs and error messages.

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 12+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## 📱 Mobile Considerations

While optimized for desktop, the app includes:
- Responsive button layouts
- Touch-friendly controls
- Scaled profile cards
- Mobile-optimized spacing

## 🎯 Demo Data

Use the included `sample-data.csv` as a template for your Google Sheet. It includes 20 sample profiles with proper formatting and realistic data.

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify all setup steps completed
3. Test with sample data first
4. Ensure stable internet connection

## 🚀 Going Live

Once setup is complete:
1. Test locally with your data
2. Deploy to your chosen platform
3. Share the URL as requested
4. Verify all layouts work correctly
5. Test authentication flow

---

**Ready to deploy?** Follow the setup steps above and you'll have a fully functional 3D profile visualization that meets all requirements!