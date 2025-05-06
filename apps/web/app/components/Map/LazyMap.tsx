import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import Loading from "app/components/Loading";
import type { Place, PlaceLocation } from "app/lib/types";
import { Suspense, lazy } from "react";

type LazyMapProps = {
	isLoadingCurrentLocation: boolean;
	setSelected: (place: Place | null) => void;
	zoom: number;
	center: PlaceLocation;
	onMapClick: (event: MapMouseEvent) => void;
	onMarkerClick: () => void;
};

const MapPlaceholder = () => (
	<div className="flex flex-1 relative overflow-hidden rounded-lg shadow-md size-full bg-slate-100 animate-pulse">
		<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-full">
			<Loading size="xl" />
		</div>
	</div>
);

const LazyMap = (props: LazyMapProps) => {
	// Lazy load the actual Map component
	const RoccoMap = lazy(() => import("./index"));

	return (
		<Suspense fallback={<MapPlaceholder />}>
			<RoccoMap {...props} />
		</Suspense>
	);
};

export default LazyMap;
