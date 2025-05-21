export interface Tracker {
	id: string;
	created_at: string;
	name: string;
	description?: string;
	pros?: string[];
	cons?: string[];
	photo_url?: string | null;
	user_id: string;
	votes: Vote[];
}

// Utility types for parsed pros/cons
export interface TrackerWithParsedArrays
	extends Omit<Tracker, "pros" | "cons"> {
	parsedPros: string[];
	parsedCons: string[];
}

// Helper functions to work with pros/cons
export function getParsedPros(tracker: Tracker): string[] {
	if (tracker.pros) {
		try {
			return JSON.parse(tracker.pros);
		} catch (e) {
			console.error("Error parsing pros JSON:", e);
		}
	}
	// Fallback to legacy fields
	return [tracker.pro1, tracker.pro2, tracker.pro3].filter(
		(item): item is string => !!item,
	);
}

export function getParsedCons(tracker: Tracker): string[] {
	if (tracker.cons) {
		try {
			return JSON.parse(tracker.cons);
		} catch (e) {
			console.error("Error parsing cons JSON:", e);
		}
	}
	// Fallback to legacy fields
	return [tracker.con1, tracker.con2, tracker.con3].filter(
		(item): item is string => !!item,
	);
}

export function convertToTrackerWithParsedArrays(
	tracker: Tracker,
): TrackerWithParsedArrays {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { pros, cons, ...rest } = tracker;
	return {
		...rest,
		parsedPros: getParsedPros(tracker),
		parsedCons: getParsedCons(tracker),
	};
}

// Corresponds to the 'votes' table in Supabase
export interface Vote {
	id?: string; // Optional UUID from Supabase, if fetched directly
	created_at?: string; // Optional timestampz from Supabase
	tracker_id: string; // Foreign key to Tracker
	user_id?: string | null; // UUID of the user who voted (if logged in)
	fingerprint: string; // Browser fingerprint for anonymous voting
	value: "stay" | "go";
	timestamp: number; // JS timestamp for client-side use, might be redundant if created_at is used
}

// For creating a new tracker, before it has an ID from Supabase
export type NewTracker = Omit<
	Tracker,
	"id" | "created_at" | "user_id" | "votes"
> & {
	photo_file?: File; // For upload
};
