import generateText from "../Services/AiTextGeneration.js";
import generateImage from "../Services/Ai.ImageGeneration.js";
import composeImage from "../Services/composeService.js";
import AdModel from "../models/Ad.model.js";

const generateAd = async (req, res) => {
  try {
    const { prompt, tone, logo } = req.body;

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
      userId: req.user?.id,
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

export { generateAd };
