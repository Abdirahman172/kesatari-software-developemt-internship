# Google Sheets Setup Instructions

## Current Issue
The Google Sheets URL is returning HTML content instead of CSV data, which means the sheet is not properly published as CSV format.

## Current URL Status
- URL: `https://docs.google.com/spreadsheets/d/e/2PACX-1vTSa1kwu7O75ST0q8-ti4RrABWJbHVWw40-EgAjx8FAv6_KXsywg6glAIyt-SFVBJFe8740ouMBfPA1/pub?output=csv`
- Returns: "kasari-software" (HTML content)
- Expected: CSV data with columns: Name, Photo, Age, Country, Interest, NetWorth

## How to Fix

### Step 1: Open Your Google Sheet
1. Go to your Google Sheet with the profile data
2. Ensure it has the required columns: Name, Photo, Age, Country, Interest, NetWorth

### Step 2: Publish to Web
1. Click **File** → **Share** → **Publish to web**
2. In the dialog:
   - **What to publish**: Select "Entire Document" (not just a sheet)
   - **Format**: Select "Comma-separated values (.csv)" (not Web page)
3. Click **Publish**
4. Copy the generated URL

### Step 3: Update the Code
Replace the current URL in `app.js` line ~145 with your new CSV URL.

### Step 4: Test the URL
Before using in the app, test the URL directly in your browser:
- It should download a CSV file
- The CSV should contain your actual data
- First line should be headers: Name,Photo,Age,Country,Interest,NetWorth

## Expected Data Format
```csv
Name,Photo,Age,Country,Interest,NetWorth
John Doe,https://example.com/photo1.jpg,25,USA,Technology,150000
Jane Smith,https://example.com/photo2.jpg,30,Canada,Design,120000
```

## Troubleshooting
- If URL still returns HTML: The sheet isn't published correctly
- If URL downloads empty file: Check sheet permissions and data
- If data doesn't load: Check browser console for CORS errors