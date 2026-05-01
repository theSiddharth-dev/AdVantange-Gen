import generateText from "../Services/AiTextGeneration.js";
import generateImage from "../Services/Ai.ImageGeneration.js";
import composeImage from "../Services/composeService.js";
import AdModel from "../models/Ad.model.js";
import jwt from "jsonwebtoken";
import config from "../Config/Config.js";

const getAuthenticatedUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_TOKEN);
    return decoded.id;
  } catch {
    return null;
  }
};

const generateAd = async (req, res) => {
  try {
    const { prompt, tone, logo } = req.body;
    const userId = getAuthenticatedUserId(req) || req.user?.id || null;

    if (!prompt || !tone) {
      return res.status(400).json({
        success: false,
        error: "prompt and tone are required",
      });
    }

    const textData = await generateText(prompt, tone);
    const imageUrl = await generateImage(
      textData.imagePrompt || textData.refinedPrompt,
    );
    const composed = await composeImage(
      imageUrl,
      logo,
      textData.title || textData.refinedPrompt,
      textData.subtitle || textData.caption,
      textData.hashtags || [],
      textData.cta,
      textData.palette,
    );

    const ad = await AdModel.create({
      userId,
      prompt,
      refinedPrompt: textData.refinedPrompt,
      caption: textData.caption,
      hashtags: textData.hashtags,
      imageUrl,
      brandlogo: logo,
      finalImageUrl: composed.finalImageUrl,
    });

    res.json({
      success: true,
      data: textData,
      imageUrl,
      finalImageUrl: composed.finalImageUrl,
      ad,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

const getRecentAds = async (req, res) => {
  try {
    const userId =
      req.query.userId || getAuthenticatedUserId(req) || req.user?.id || null;
    const query = userId ? { userId } : {};
    const ads = await AdModel.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      ads,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export { generateAd, getRecentAds };
