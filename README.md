✨ Features
🌱 1. Farm Advisory (AI)

Choose a crop, location, and season to get a structured advisory generated using Google Gemini.

Outputs include:

Crop diagnosis

Best practices

Common challenges

Fertilizer strategy

Irrigation schedule

Harvesting guidance

The system generates region-specific and crop-specific guidance, not generic text.

🩺 2. Disease Detection (Image Upload)

Upload an image of a plant leaf.
Gemini Vision analyzes the photo and provides:

Clear disease diagnosis

Confidence score

Recommended treatment steps

Example:

Diagnosis: Severe Leaf Blight
Confidence: 85%
Advice: Remove infected debris, apply broad-spectrum fungicide, avoid overhead watering.

🌤️ 3. Live Weather

A simple and fast weather tool that shows:

Temperature

Humidity

Wind

Weather conditions

Farmers can quickly check conditions before irrigation, spraying, or field operations.

🛒 4. Market Linkage

A minimal marketplace for farmers to track their crop listings:

Crop name

Quantity

Unit

Expected price

Farmers can add / edit / delete listings.
All data is securely stored in Supabase.

🛰️ 5. Geospatial AI (Satellite-Based Insights)

The Geospatial AI module uses satellite imagery data to give farmers visual insights into their fields.

Key Capabilities:

Access to Sentinel-2 and RISAT satellite data

NDVI-based vegetation health visualization

Early stress detection (pest, drought, nutrient deficiency)

Real-time field monitoring

Simple color-coded map interface

This helps farmers see field-level problem areas without physical inspection.

🧰 Tech Stack
Frontend

React

Vite

Tailwind CSS

Backend & Services

Supabase (database + auth + storage)

Google OAuth

Web3Forms

Gemini API (advisory + vision-based diagnosis)

Weather API

Deployment

Vercel

🔐 Environment Variables

Create a .env file and add the following:

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_GEMINI_API_KEY=
VITE_WEATHER_API_KEY=
VITE_WEB3FORMS_API_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_SECRET=

🚀 Getting Started
1. Clone the repository
git clone https://github.com/neevlila/krishi-miitra.git
cd krishi-miitra

2. Install dependencies
npm install

3. Run locally
npm run dev


Your app will be available at:
➡️ http://localhost:5173/