import { memo, useMemo } from "react";
import {
	generateSrcSet,
	getCdnImageUrl,
	getPlaceholderImageUrl,
} from "~/components/image/image-cdn";

interface OptimizedImageProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
	width?: number | string;
	height?: number | string;
	priority?: boolean;
	placeholder?: "blur" | "empty";
	sizes?: string;
	quality?: number;
	objectFit?: "cover" | "contain" | "fill";
}

/**
 * OptimizedImage component that handles proper image loading patterns
 * and adds appropriate attributes for web vitals
 */
const OptimizedImage = ({
	src,
	alt,
	width,
	height,
	priority = false,
	placeholder = "empty",
	sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
	quality = 80,
	objectFit = "cover",
	className,
	...rest
}: OptimizedImageProps) => {
	// Determine loading strategy
	const loading = priority ? "eager" : "lazy";

	// Generate optimized image URLs
	const optimizedSrc = useMemo(
		() =>
			getCdnImageUrl(src, {
				width: typeof width === "number" ? width : undefined,
				height: typeof height === "number" ? height : undefined,
				quality,
				fit:
					objectFit === "cover"
						? "cover"
						: objectFit === "contain"
							? "contain"
							: "fill",
			}),
		[src, width, height, quality, objectFit],
	);

	// Generate srcset for responsive images
	const srcSet = useMemo(() => generateSrcSet(src), [src]);

	// Generate placeholder image for blur-up effect
	const placeholderSrc = useMemo(
		() => (placeholder === "blur" ? getPlaceholderImageUrl(src) : undefined),
		[src, placeholder],
	);

	// Handle blur placeholder style
	const blurStyle =
		placeholder === "blur"
			? {
					backgroundSize: "cover",
					backgroundPosition: "center",
					filter: "blur(5px)",
				}
			: {};

	return (
		<div className="relative" style={{ width, height, overflow: "hidden" }}>
			{placeholder === "blur" && placeholderSrc && (
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url(${placeholderSrc})`,
						...blurStyle,
					}}
					aria-hidden="true"
					role="presentation"
				/>
			)}
			{/* biome-ignore lint/a11y/useAltText: This error is through due to `rest` spread */}
			<img
				src={optimizedSrc}
				srcSet={srcSet}
				sizes={sizes}
				alt={alt}
				width={width}
				height={height}
				loading={loading}
				decoding="async"
				className={className}
				{...rest}
				onError={(e) => {
					// Fallback to original image if CDN version fails
					console.warn(
						"Optimized image failed to load, falling back to original:",
						src,
					);
					(e.target as HTMLImageElement).src = src;
				}}
			/>
		</div>
	);
};

// Memoize to prevent unnecessary re-renders
export default memo(OptimizedImage);

// Export a simple function for use outside of React components
export function getOptimizedImageUrl(
	src: string,
	width?: number,
	height?: number,
): string {
	return getCdnImageUrl(src, { width, height });
}
