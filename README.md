# 3D Data Visualization - Periodic Table Style

A complete 3D visualization system that reads data from Google Sheets and displays it in an interactive periodic table format using Three.js.

## Features

✅ **Data Integration**: Reads data from Google Sheets CSV export
✅ **Color Coding**: Background colors based on Net Worth values
- Red: < $100K
- Orange: $100K - $200K  
- Green: > $200K

✅ **Four Visualization Modes**:
- **Table**: 20x10 grid arrangement
- **Sphere**: Spherical distribution
- **Helix**: Double helix formation
- **Grid**: 5x4x10 three-dimensional grid

✅ **Interactive Controls**: 
- Mouse controls for rotation, zoom, and pan
- Smooth transitions between arrangements
- Hover effects on elements

✅ **Data Display**: Each tile shows:
- ID number
- Net worth value
- Name initials/symbol
- Title and description

## Requirements Met

1. ✅ Uses Three.js CSS3D periodic table as base
2. ✅ Retrieves data from Google Sheet CSV
3. ✅ Replaces chemical elements with custom data
4. ✅ Color coding based on Net Worth (Red/Orange/Green)
5. ✅ Four arrangements: Table, Sphere, Helix, Grid
6. ✅ Table arrangement: 20x10 layout
7. ✅ Double helix instead of single helix
8. ✅ Grid arrangement: 5x4x10 dimensions

## Usage

1. Open the live demo: https://abdirahman172.github.io/kasatari-software-developer-ineternship/
2. Sign in with Google when prompted
3. Wait for data to load from Google Sheets
4. Use the buttons at the bottom to switch between arrangements:
   - **TABLE**: Traditional periodic table layout (20x10)
   - **SPHERE**: Spherical arrangement
   - **HELIX**: Double helix formation
   - **GRID**: 3D grid (5x4x10)

## Data Source

The system reads from: Google Sheets with proper authentication

Expected CSV format:
```
Name,Title,Description,NetWorth
John Doe,CEO,TechCorp,250000
Jane Smith,CTO,DataSys,150000
...
```

## Technical Details

- **Framework**: Three.js with CSS3DRenderer
- **Authentication**: Google OAuth 2.0
- **Controls**: TrackballControls for 3D navigation
- **Animations**: Tween.js for smooth transitions
- **Responsive**: Adapts to window resizing
- **Interactive**: Click elements to view profile photos

## Files

- `index.html` - Main HTML file with styling and layout
- `app.js` - Complete JavaScript application with data loading and 3D visualization
- `README.md` - This documentation

## Live Demo

🌐 **[View Live Demo](https://abdirahman172.github.io/kasatari-software-developer-ineternship/)**

## Features Showcase

- **Google Authentication**: Secure sign-in required
- **Real-time Data**: Loads actual data from Google Spreadsheet
- **3D Interactions**: Full 3D navigation and controls
- **Photo Integration**: Click elements to view profile photos
- **Professional Design**: Clean, modern periodic table interface