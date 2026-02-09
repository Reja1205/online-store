// backend/src/routes/ai.routes.js
const router = require("express").Router();
const OpenAI = require("openai");

const requireAuth = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/product-description  (admin only)
router.post("/product-description", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, keyFeatures, tone, length } = req.body || {};

    if (!name) return res.status(400).json({ message: "Product name is required" });

    const features = Array.isArray(keyFeatures)
      ? keyFeatures.filter(Boolean)
      : String(keyFeatures || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const prompt = `
Write a product description for an ecommerce store.

Product name: ${name}
Category: ${category || "General"}
Key features: ${features.length ? features.join(", ") : "Not provided"}
Tone: ${tone || "friendly and professional"}
Length: ${length || "80-120 words"}

Rules:
- No fake claims (no “FDA approved”, “best in the world”, etc.)
- Clear benefits + simple language
- Output only the description text
`.trim();

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
      reasoning: { effort: "none" },
    });

    return res.json({ description: (response.output_text || "").trim() });
  } catch (err) {
    console.error("AI_DESC_ERROR:", err);
    return res.status(500).json({ message: "AI generation failed", error: err.message });
  }
});

module.exports = router;