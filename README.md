# 3D Profile Visualization - Kasatari Software Developer Internship

A stunning 3D web application that visualizes profile data from Google Sheets using Three.js CSS3D rendering.

## 🌟 Features

- **Google Authentication**: Secure login with Google Identity Services
- **Google Sheets Integration**: Real-time data loading from published CSV
- **4 Layout Modes**: Table (20×10), Sphere, Double Helix, Grid (5×4×10)
- **Color-Coded Profiles**: Net worth visualization (Red <$100K, Orange $100K-$200K, Green >$200K)
- **3D Navigation**: Intuitive mouse controls for rotation and zoom
- **Profile Numbering**: Sequential numbering matching Google Sheets order
- **Responsive Design**: Modern glass morphism UI with gradient backgrounds

## 🎮 Navigation

- **Mouse Drag**: Rotate camera around 3D space
- **Mouse Scroll**: Zoom in/out for detailed inspection
- **Layout Buttons**: Switch between Table, Sphere, Double Helix, and Grid views
- **Profile Cards**: Display photo, name, age, country, interest, and net worth

## 🚀 Live Demo

The application loads 200 profiles from Google Sheets and displays them in beautiful 3D arrangements:

- **Table Layout**: 20×10 periodic table style grid
- **Sphere Layout**: Profiles distributed on sphere surface
- **Double Helix Layout**: Two intertwined DNA-like spirals
- **Grid Layout**: 3D cube arrangement (5×4×10)

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js with CSS3DRenderer
- **Authentication**: Google Identity Services
- **Data Source**: Google Sheets (CSV export)
- **Styling**: Modern CSS with glass morphism effects

## 📋 Requirements Met

✅ Google Sheet integration with CSV import  
✅ Google login authentication system  
✅ Modified periodic table demo structure  
✅ Profile data display (photo, name, age, country, interest, net worth)  
✅ Color coding by net worth (Red/Orange/Green)  
✅ 4 layout formats (Table, Sphere, Helix, Grid)  
✅ Table arrangement: 20×10 grid  
✅ Double helix implementation  
✅ Grid arrangement: 5×4×10 structure  
✅ Fully functional web application  

## 🎯 Data Structure

Each profile contains:
- **Name**: Person's full name
- **Photo**: Profile image URL
- **Age**: Person's age
- **Country**: Country of residence
- **Interest**: Area of interest/expertise
- **Net Worth**: Financial value (color-coded)

## 🔧 Setup & Installation

1. Clone the repository
2. Ensure Google Sheets is properly published as CSV
3. Update the CSV URL in `app.js` if needed
4. Serve files using a local server (e.g., `python -m http.server 8000`)
5. Access via `http://localhost:8000`

## 📊 Profile Distribution

- **Total Profiles**: 200
- **First Profile**: Lee Siew Suan (#1)
- **Last Profile**: Collen McClintock (#200)
- **Order**: Matches Google Sheets sequence exactly

## 🎨 Visual Design

- Modern gradient backgrounds with animation
- Glass morphism effects with backdrop blur
- Professional color scheme and typography
- Hover effects and smooth transitions
- Responsive layout for different screen sizes

## 🔍 Color Coding System

- 🔴 **Red**: Net worth < $100,000
- 🟠 **Orange**: Net worth $100,000 - $200,000
- 🟢 **Green**: Net worth > $200,000

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 👨‍💻 Developer

**Abdirahman** - Kasatari Software Developer Internship Assignment

## 📄 License

This project is part of the Kasatari Software Developer Internship program.