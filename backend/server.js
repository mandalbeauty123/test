// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Gemini / GeoAI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro", // or any Gemini model you prefer
});

// Utility: build a rich system prompt for the GeoGemma Spatial Foundation Model
function buildGeoGemmaPrompt(payload) {
  const {
    farmLocation,
    cropType,
    analysisType,
    question,
    indices = {},
    timeRange,
    areaSize,
  } = payload;

  const { ndvi, lai, evi, customNotes } = indices;

  return `
You are *GeoGemma*, a specialized Spatial Foundation Model (SFM) and GeoAI assistant for precision agriculture in India.

Your core capabilities:
- Fuse multi-modal EO data (Sentinel-2, NDVI, LAI, EVI, etc.) with farm metadata.
- Provide hyper-local, actionable advisory for yield optimization, pest detection, and resource (water/fertilizer) management.
- Automatically design GIS workflows and generate executable GIS/Python/Google Earth Engine-like scripts.
- Explain recommendations clearly for non-technical farmers and agronomists.

=== FARM CONTEXT ===
Location (GLE / SVS anchor): ${farmLocation || "Not provided"}
Crop type: ${cropType || "Not provided"}
Analysis focus: ${analysisType || "Not selected"}
Farm size / area: ${areaSize || "Not provided"}
Time range of interest: ${timeRange || "Not provided"}

=== REMOTE SENSING INDICES (from ingestion pipeline) ===
NDVI (vegetation vigor): ${ndvi || "Not provided"}
LAI  (leaf area index): ${lai || "Not provided"}
EVI  (enhanced vegetation index): ${evi || "Not provided"}
Custom EO / agronomic notes: ${customNotes || "None"}

=== USER / FARMER NATURAL LANGUAGE QUERY ===
${question || "No explicit question, provide a default health & management assessment."}

=== REQUIRED OUTPUT FORMAT ===
1) **Hyper-local assessment**
   - Summarize crop health, vigor, and stress signals using the EO indices above.
   - Mention what these indices imply agronomically.

2) **Actionable recommendations**
   - For the chosen analysis type (${analysisType}), give stepwise, practical guidance.
   - Include timing, thresholds, and any simple numeric targets when possible.

3) **Automated GIS workflow (pseudo-code)**
   - Generate a *clear*, *copy-paste-ready* script in either:
     - Google Earth Engine JavaScript, OR
     - Python with rasterio / geopandas, OR
     - QGIS processing model description.
   - The script must:
     - Load Sentinel-2 data near ${farmLocation || "farm location"}.
     - Compute NDVI and LAI (even if approximate).
     - Clip results to the farm AOI (describe AOI as a polygon placeholder).
     - Export a map layer and a simple zonal statistics table (mean NDVI/LAI).

4) **Explainability**
   - Briefly explain how a Spatial Vector Space (SVS) and Geospatial Location Embedding (GLE) help make these decisions.
   - Keep language simple but technically correct.

Be concise but *complete*. Focus on factual, agronomy-aligned reasoning. Use bullet points and clear sections.
`;
}

// --- Main GeoGemma endpoint ---
app.post("/api/geo-gemma", async (req, res) => {
  try {
    const payload = req.body;

    const prompt = buildGeoGemmaPrompt(payload);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const timeSavedEstimate = 0.74; // ~74% as per your research

    res.json({
      ok: true,
      answer: text,
      meta: {
        timeSavedFraction: timeSavedEstimate,
        message:
          "Estimated 74% reduction in manual GIS workflow time vs. baseline.",
      },
    });
  } catch (err) {
    console.error("GeoGemma error:", err);
    res.status(500).json({
      ok: false,
      error: "GeoGemma processing failed. Check server logs.",
      details: err.message,
    });
  }
});

// Simple health check
app.get("/", (_req, res) => {
  res.send("GeoGemma GeoAI backend is running ✅");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 GeoGemma backend listening on http://localhost:${PORT}`);
});
