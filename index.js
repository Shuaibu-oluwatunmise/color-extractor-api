const express = require("express");
const axios = require("axios");
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

    const imageData = ctx.getImageData(0, 0, image.width, image.height).data;

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < imageData.length; i += 4 * 100) { // sample every 100px
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const primary = `rgb(${r}, ${g}, ${b})`;
    const secondary = `rgb(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)})`;

    res.status(200).json({ primary, secondary });
  } catch (err) {
    console.error("Extraction error:", err.message);
    res.status(500).json({ error: "Failed to extract colors." });
  }
});

app.listen(port, () => {
  console.log(`Color Extractor API running on port ${port}`);
});
