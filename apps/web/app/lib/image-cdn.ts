/**
 * Image CDN Configuration and helper functions
 * This module provides utilities for optimizing images through a CDN service
 */

// Types of image transformations
type ImageFormat = "webp" | "jpeg" | "png" | "avif";
type ImageFit = "cover" | "contain" | "fill" | "inside" | "outside";

// Image CDN configuration
const config = {
	// Use Cloudinary as the example CDN - replace with your actual CDN
	baseUrl:
		import.meta.env.VITE_IMAGE_CDN_URL || "https://res.cloudinary.com/demo",
	defaultQuality: 80,
	defaultFormat: "webp" as ImageFormat,
	defaultFit: "cover" as ImageFit,
	cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
};

// Options for image transformation
interface ImageOptions {
	width?: number;
	height?: number;
	quality?: number;
	format?: ImageFormat;
	fit?: ImageFit;
	blur?: number;
}

/**
 * Transform an original image URL to use the CDN with optimizations
 */
export function getCdnImageUrl(
	originalUrl: string,
	options: ImageOptions = {},
): string {
	// Skip CDN if the image is already served from the CDN
	if (originalUrl.includes(config.baseUrl)) {
		return originalUrl;
	}

	if (!originalUrl) {
		return "";
	}

	// For Google Maps/Places images
	if (originalUrl.includes("googleusercontent")) {
		// Extract maximum information from original URL
		const width = options.width || 600;
		const height = options.height || 400;
		return `${originalUrl}=w${width}-h${height}-c`;
	}

	// For Cloudinary-based CDN
	try {
		// Extract important options
		const {
			width = null,
			height = null,
			quality = config.defaultQuality,
			format = config.defaultFormat,
			fit = config.defaultFit,
			blur = 0,
		} = options;

		// Create transformation string for Cloudinary
		let transformations = "f_auto,q_auto:good";

		if (width) transformations += `,w_${width}`;
		if (height) transformations += `,h_${height}`;
		if (quality !== config.defaultQuality) transformations += `,q_${quality}`;
		// if (format !== 'auto') transformations += `,f_${format}`;
		if (fit) transformations += `,c_${fit}`;
		if (blur > 0) transformations += `,e_blur:${blur}`;

		// Simple approach - encode the full URL
		const encodedUrl = encodeURIComponent(originalUrl);

		// Return transformed URL
		return `${config.baseUrl}/${config.cloudName}/image/fetch/${transformations}/${encodedUrl}`;
	} catch (error) {
		console.error("Error generating CDN URL:", error);
		return originalUrl; // Fallback to original URL
	}
}

/**
 * Generate srcset attribute for responsive images
 */
export function generateSrcSet(
	originalUrl: string,
	sizes: number[] = [320, 640, 960, 1280],
): string {
	return sizes
		.map((size) => {
			const url = getCdnImageUrl(originalUrl, { width: size });
			return `${url} ${size}w`;
		})
		.join(", ");
}

/**
 * Get a placeholder image URL (low quality for fast loading)
 */
export function getPlaceholderImageUrl(originalUrl: string): string {
	return getCdnImageUrl(originalUrl, {
		width: 20,
		quality: 20,
		blur: 10,
	});
}
