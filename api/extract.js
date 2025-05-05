import axios from "axios";
import { createCanvas, loadImage } from "canvas";
import ColorThief from "colorthief";

export default async function handler(req, res) {
  const { img } = req.query;
  if (!img) return res.status(400).json({ error: "Missing ?img=" });

  try {
    // Fetch the image
    const response = await axios.get(img, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // Load image into canvas
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Use ColorThief to get dominant color
    const rgb = ColorThief.getColor(canvas);

    const primary = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

    // You can generate a secondary color manually or return a simple shade
    const secondary = `rgb(${Math.min(rgb[0]+20,255)}, ${Math.min(rgb[1]+20,255)}, ${Math.min(rgb[2]+20,255)})`;

    res.status(200).json({ primary, secondary });
  } catch (err) {
    console.error("Color extraction failed:", err.message);
    res.status(500).json({ error: "Failed to extract colors." });
  }
}
