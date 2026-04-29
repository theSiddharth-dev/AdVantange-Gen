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
        model: "openai/gpt-4o-mini",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You create polished poster copy for social media ads. Return only valid JSON with the keys: refinedPrompt, title, subtitle, caption, cta, hashtags, imagePrompt, palette, layoutHint. Keep the copy concise, premium, and production-ready.",
          },
          {
            role: "user",
            content: `Brand prompt: ${prompt}\nTone: ${tone}\nWrite copy for a single vertical poster that combines a strong hero image, a short headline, a supporting line, a CTA, and 5 to 8 relevant hashtags. Make the image prompt cinematic and suitable for an ad poster.`,
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
