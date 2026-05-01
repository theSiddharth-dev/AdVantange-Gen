import config from "../Config/Config.js";
import fetch from "node-fetch";

const DEFAULT_COPY_TONE = "professional";

function stripCodeFences(value) {
  return value
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeHashtags(hashtags) {
  if (!Array.isArray(hashtags)) {
    return [];
  }

  return hashtags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`));
}

async function generateText(prompt, tone = DEFAULT_COPY_TONE) {
  if (!prompt) {
    throw new Error("prompt is required for text generation");
  }

  if (!config.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "AdVantage Gen",
      },
      body: JSON.stringify({
        model: "openrouter/owl-alpha",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `
You are an expert creative director and premium social media poster copywriter.

Generate unique, cinematic, production-ready poster concepts based on the user's prompt and tone.

Return ONLY valid JSON with these exact keys:
{
  "refinedPrompt": "",
  "title": "",
  "subtitle": "",
  "caption": "",
  "cta": "",
  "hashtags": [],
  "imagePrompt": "",
  "palette": [],
  "layoutHint": ""
}

Rules:
- Keep text concise, modern, premium, and ad-ready.
- Never return markdown or explanations.
- Avoid repetitive layouts or generic wording.
- Make every design visually unique.
- Adapt composition, typography, effects, lighting, and atmosphere based on the tone.
- imagePrompt must feel like a luxury cinematic poster with:
  dramatic composition,
  dynamic centerpiece,
  rich textures,
  depth,
  premium typography,
  modern advertising style,
  high contrast,
  cinematic lighting,
  visually matching effects,
  ultra detailed,
  4k quality.
- palette must contain 3 to 5 cinematic color names.
- hashtags must be minimal and relevant.
- layoutHint should describe text placement and composition briefly.
`,
          },
          {
            role: "user",
            content: `PROMPT: ${prompt}

                      TONE: ${tone}

                  Create a visually distinct premium poster concept.`,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Text generation failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Text generation returned no content");
  }

  const parsed = JSON.parse(stripCodeFences(content));
  const hashtags = normalizeHashtags(parsed.hashtags);

  return {
    refinedPrompt: parsed.refinedPrompt || parsed.imagePrompt || prompt,
    title: parsed.title || "",
    subtitle: parsed.subtitle || "",
    caption:
      parsed.caption ||
      [parsed.title, parsed.subtitle].filter(Boolean).join(" "),
    cta: parsed.cta || "Learn More",
    hashtags,
    imagePrompt: parsed.imagePrompt || parsed.refinedPrompt || prompt,
    palette: Array.isArray(parsed.palette) ? parsed.palette : [],
    layoutHint: parsed.layoutHint || "premium editorial poster",
  };
}

export default generateText;
