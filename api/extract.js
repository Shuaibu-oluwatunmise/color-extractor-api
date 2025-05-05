import axios from "axios";
import getColors from "get-image-colors";

export default async function handler(req, res) {
  const { img } = req.query;
  if (!img) return res.status(400).json({ error: "Missing ?img=" });

  try {
    const response = await axios.get(img, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const colors = await getColors(buffer, "image/jpeg");

    res.status(200).json({
      primary: colors[0].hex(),
      secondary: colors[1]?.hex() || colors[0].hex(),
    });
  } catch (err) {
    console.error("Color extraction failed:", err.message);
    res.status(500).json({ error: "Failed to extract colors." });
  }
}
