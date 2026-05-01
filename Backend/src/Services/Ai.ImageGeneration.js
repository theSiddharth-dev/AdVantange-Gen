import fetch from "node-fetch";
import config from "../Config/Config.js";
import cloudinary from "../Utils/Cloudinary.js";

async function uploadGeneratedImage(imageUrl) {
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "advantage-gen/generated-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

async function generateImage(prompt) {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  if (!config.HF_TOKEN) {
    throw new Error("HF_TOKEN is missing");
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/fal-ai/fal-ai/flux/dev",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Failed to generate image"
      );
    }

    // Extract image URL
    const imageUrl =
      data?.images?.[0]?.url ||
      data?.image?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    // Upload to cloudinary
    const uploadedImage = await uploadGeneratedImage(imageUrl);

    return uploadedImage.secure_url;
  } catch (error) {
    throw new Error(
      `Image generation failed: ${error.message}`
    );
  }
}

export default generateImage;