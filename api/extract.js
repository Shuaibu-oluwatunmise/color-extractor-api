import axios from "axios";
import getColors from "get-image-colors";
import { extname } from "path";

export default async function handler(req, res) {
  const { img } = req.query;
  if (!img) return res.status(400).json({ error: "Missing ?img=" });

  try {
    // Get file extension from URL (.png, .jpg, etc.)
    const ext = extname(img).replace('.', '') || 'jpeg';

    // Download the image as a buffer
    const response = await axios.get(img, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // Pass detected type to getColors
    const colors = await getColors(buffer, ext);

    res.status(200).json({
      primary: colors[0].hex(),
      secondary: colors[1]?.hex() || colors[0].hex(),
    });
  } catch (err) {
    console.error("Color extraction failed:", err.message);
    res.status(500).json({ error: "Failed to extract colors." });
  }
}
