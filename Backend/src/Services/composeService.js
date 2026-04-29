import sharp from "sharp";
import fetch from "node-fetch";
import cloudinary from "../Utils/Cloudinary.js";

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1350;

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHash(value = "") {
  return String(value).replace(/^#+/, "").trim();
}

function wrapText(text, maxCharsPerLine) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function textBlockSvg({
  x,
  y,
  lines,
  fontSize,
  lineHeight,
  fill = "#ffffff",
  weight = 700,
  family = "Segoe UI, Arial, sans-serif",
}) {
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}">${tspans}</text>`;
}

async function resolveBuffer(source) {
  if (!source) {
    return null;
  }

  if (Buffer.isBuffer(source)) {
    return source;
  }

  if (typeof source !== "string") {
    return null;
  }

  if (source.startsWith("data:")) {
    const base64 = source.split(",")[1];
    return Buffer.from(base64, "base64");
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Unable to fetch image source: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return Buffer.from(source, "base64");
}

async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "advantage-gen/posters",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

async function composeImage(
  imageSource,
  logo,
  title,
  subtitle,
  hashtags = [],
  cta = "Learn More",
  palette = [],
) {
  const heroBuffer = await resolveBuffer(imageSource);
  if (!heroBuffer) {
    throw new Error("A generated image is required to compose the poster");
  }

  const heroImage = sharp(heroBuffer).resize(620, 820, {
    fit: "cover",
    position: "centre",
  });

  const heroMeta = await heroImage.clone().metadata();
  const heroRendered = await heroImage.png().toBuffer();

  const paletteTop = palette?.[0] || "#0f172a";
  const paletteBottom = palette?.[1] || "#1e293b";
  const accent = palette?.[2] || "#f59e0b";
  const brandColor = palette?.[3] || "#ffffff";

  const mainTitleLines = wrapText(
    title || "Create a campaign that stops the scroll",
    14,
  );
  const subtitleLines = wrapText(
    subtitle || "A polished, production-ready ad poster built from one prompt.",
    28,
  );
  const hashtagsLine = hashtags.length
    ? hashtags
        .map((tag) => stripHash(tag))
        .slice(0, 6)
        .join("   #")
    : "AdVantageGen   CreativeStudio   SocialAds";

  const backgroundSvg = `
		<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="${paletteTop}" />
					<stop offset="60%" stop-color="#111827" />
					<stop offset="100%" stop-color="${paletteBottom}" />
				</linearGradient>
				<radialGradient id="glow" cx="28%" cy="18%" r="65%">
					<stop offset="0%" stop-color="${accent}" stop-opacity="0.35" />
					<stop offset="100%" stop-color="${accent}" stop-opacity="0" />
				</radialGradient>
			</defs>
			<rect width="100%" height="100%" fill="url(#bg)" />
			<circle cx="210" cy="180" r="420" fill="url(#glow)" />
			<circle cx="920" cy="220" r="260" fill="#ffffff" opacity="0.04" />
			<rect x="56" y="56" width="968" height="1238" rx="42" fill="none" stroke="rgba(255,255,255,0.12)" />
			<rect x="72" y="72" width="936" height="1206" rx="34" fill="none" stroke="rgba(255,255,255,0.05)" />
		</svg>`;

  const copySvg = `
		<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
			<style>
				.small { font-family: Segoe UI, Arial, sans-serif; font-size: 24px; letter-spacing: 3px; fill: rgba(255,255,255,0.72); }
				.cta { font-family: Segoe UI, Arial, sans-serif; font-size: 32px; font-weight: 800; fill: ${brandColor}; }
				.meta { font-family: Segoe UI, Arial, sans-serif; font-size: 23px; fill: rgba(255,255,255,0.78); }
			</style>
			<text x="92" y="126" class="small">ADVANTAGE GEN</text>
			<rect x="92" y="164" width="172" height="6" rx="3" fill="${accent}" opacity="0.95" />
			${textBlockSvg({ x: 92, y: 320, lines: mainTitleLines, fontSize: 92, lineHeight: 100, weight: 800 })}
			${textBlockSvg({ x: 92, y: 600, lines: subtitleLines, fontSize: 34, lineHeight: 48, fill: "rgba(255,255,255,0.84)", weight: 500 })}
			<rect x="92" y="734" width="320" height="78" rx="39" fill="${accent}" />
			<text x="128" y="785" class="cta">${escapeXml(cta || "Learn More")}</text>
			<text x="92" y="850" class="meta">${escapeXml(`#${hashtagsLine}`)}</text>
			<text x="92" y="1218" class="meta">Single-poster composition · text + image generation · production ready</text>
			<text x="92" y="1258" class="meta">Optimized for Instagram, LinkedIn, and campaign decks</text>
		</svg>`;

  const logoBuffer = await resolveBuffer(logo);
  const logoComposite = logoBuffer
    ? [
        {
          input: await sharp(logoBuffer)
            .resize(136, 136, {
              fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer(),
          top: 78,
          left: 858,
        },
      ]
    : [];

  const composed = await sharp({
    create: {
      width: POSTER_WIDTH,
      height: POSTER_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      { input: Buffer.from(backgroundSvg) },
      { input: heroRendered, top: 206, left: 382 },
      {
        input: Buffer.from(
          `<svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
						 <rect x="370" y="194" width="648" height="844" rx="36" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" />
						 <rect x="384" y="208" width="620" height="816" rx="28" fill="none" stroke="rgba(255,255,255,0.08)" />
					 </svg>`,
        ),
      },
      { input: Buffer.from(copySvg) },
      ...logoComposite,
    ])
    .png()
    .toBuffer();

  const poster = await uploadToCloudinary(composed);

  return {
    finalImageUrl: poster.secure_url,
    posterPublicId: poster.public_id,
    heroMeta,
  };
}

export default composeImage;
