import { memo } from "react";
import OptimizedImage from "~/components/image";
import type { Place } from "~/lib/types";

type Props = {
	alt: string;
	photos: string[] | null | undefined;
};

// Helper function to get appropriate image size based on viewport
const getImageSize = (photoUrl: string): string => {
	// Add size parameter to URL if it's from a service that supports it
	if (photoUrl.includes("googleusercontent")) {
		// Google's image service allows resize params
		return `${photoUrl}=w600-h400-c`;
	}
	return photoUrl;
};

const PlacePhotos = ({ alt, photos }: Props) => {
	if (!photos || photos.length === 0) {
		return null;
	}

	return (
		<div className="carousel p-4 space-x-4 bg-slate-200 rounded-box h-64 pl-4">
			{photos.map((photoUrl, index) => (
				<div key={photoUrl} className="carousel-item max-w-[75%]">
					<OptimizedImage
						src={getImageSize(photoUrl)}
						alt={`${alt} image ${index + 1}`}
						width="600"
						height="400"
						priority={index === 0} // Load first image with priority
						placeholder={index === 0 ? "blur" : "empty"}
						sizes="(max-width: 768px) 75vw, 600px"
						className="rounded-box object-cover"
						onError={(e) => {
							// Fallback if size param fails
							(e.target as HTMLImageElement).src = photoUrl;
						}}
					/>
				</div>
			))}
		</div>
	);
};

// Memoize to prevent unnecessary re-renders
export default memo(PlacePhotos);
