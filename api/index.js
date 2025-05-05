const express = require("express");
const axios = require("axios");
const ColorThief = require("colorthief");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const port = process.env.PORT || 3000;

app.get("/api/extract", async (req, res) => {
  const { img } = req.query;
  if (!img) return res.status(400).json({ error: "Missing ?img=" });

  try {
    const response = await axios.get(img, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    const rgb = ColorThief.getColor(canvas);
    const primary = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    const secondary = `rgb(${Math.min(rgb[0] + 20, 255)}, ${Math.min(rgb[1] + 20, 255)}, ${Math.min(rgb[2] + 20, 255)})`;

    res.status(200).json({ primary, secondary });
  } catch (err) {
    console.error("Extraction error:", err.message);
    res.status(500).json({ error: "Failed to extract colors." });
  }
});

app.listen(port, () => {
  console.log(`Color Extractor API running on port ${port}`);
});
