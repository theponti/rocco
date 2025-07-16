import { memo } from "react";
import { env } from "~/lib/env";

type Props = {
	alt: string;
	photos: string[] | null | undefined;
};

const getImageSize = (photoUrl: string): string => {
	if (photoUrl.includes("places/") && photoUrl.includes("/photos/")) {
		return `https://places.googleapis.com/v1/${photoUrl}/media?key=${env.VITE_GOOGLE_API_KEY}&maxWidthPx=600&maxHeightPx=400`;
	}

	if (photoUrl.includes("googleusercontent")) {
		return `${photoUrl}=w600-h400-c`;
	}
	return photoUrl;
};

const PlacePhotos = ({ alt, photos }: Props) => {
	if (!photos || photos.length === 0) {
		return null;
	}

	return (
		<div className="border-2 border-slate-200 rounded-lg h-64">
			<div className="flex gap-4 overflow-x-auto h-full p-4 pb-3">
				{photos.map((photoUrl, index) => (
					<div
						key={photoUrl}
						className="flex-shrink-0 flex items-center justify-center"
					>
						<img
							src={getImageSize(photoUrl)}
							alt={`${alt} ${index + 1}`}
							loading={index === 0 ? "eager" : "lazy"}
							decoding="async"
							sizes="(max-width: 768px) 75vw, 600px"
							className="rounded-box object-cover h-full w-auto max-w-none"
							style={{ maxHeight: "192px" }}
							onError={(e) => {
								(e.target as HTMLImageElement).src = photoUrl;
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default memo(PlacePhotos);
