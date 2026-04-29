import config from "../Config/Config.js";
import fetch from "node-fetch";

function extractImageSource(message) {
  const image = message?.images?.[0];
  return image?.image_url?.url || image?.url || image?.b64_json || image?.base64 || null;
}

async function generateImage(imagePrompt) {
  if (!imagePrompt) {
    throw new Error("imagePrompt is required for image generation");
  }

  if (!config.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "AdVantage Gen",
    },
    body: JSON.stringify({
      model: "black-forest-labs/flux.2-klein-4b",
      messages: [
        {
          role: "user",
          content: imagePrompt,
        },
      ],
      modalities: ["image"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const message = result.choices?.[0]?.message;
  const imageSource = extractImageSource(message);

  if (!imageSource) {
    throw new Error("Image generation returned no image");
  }

  return imageSource;
}

export default generateImage;