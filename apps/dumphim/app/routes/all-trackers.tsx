"use client";

import { useEffect, useState } from "react";
import { COLOR_THEMES } from "~/components/voter/card-theme-picker";
import { PersonCardDisplay } from "~/components/voter/person-card-display";
import { PERSONALITY_TYPES } from "~/components/voter/personality-type-picker";
import { supabase } from "~/lib/supabaseClient";
import type { Tracker } from "~/lib/voter.types"; // Assuming you have a type definition

// Define a more specific type for the trackers fetched from the DB
// This should align with your 'trackers' table structure
interface FetchedTracker {
	id: string;
	name: string;
	hp: string;
	card_type: string;
	description: string;
	attacks: Array<{ name: string; damage: number }>;
	strengths: string[];
	flaws: string[];
	commitment_level: string;
	color_theme: string;
	photo_url: string | null;
	image_scale: number;
	image_position: { x: number; y: number };
	user_id: string;
	created_at: string;
}

export function AllTrackersPage() {
	const [trackers, setTrackers] = useState<FetchedTracker[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTrackers = async () => {
			setLoading(true);
			const { data, error: dbError } = await supabase
				.from("trackers")
				.select("*");

			if (dbError) {
				console.error("Error fetching trackers:", dbError);
				setError(dbError.message);
				setTrackers([]);
			} else if (data) {
				setTrackers(data as FetchedTracker[]);
				setError(null);
			}
			setLoading(false);
		};

		fetchTrackers();
	}, []);

	if (loading) {
		return <div className="text-center py-10">Loading trackers...</div>;
	}

	if (error) {
		return (
			<div className="text-center py-10 text-red-500">
				Error loading trackers: {error}
			</div>
		);
	}

	if (trackers.length === 0) {
		return <div className="text-center py-10">No trackers found.</div>;
	}

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold text-center mb-10">All Trackers</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{trackers.map((tracker) => {
					const cardData = {
						name: tracker.name,
						hp: tracker.hp,
						cardType: tracker.card_type,
						description: tracker.description,
						attacks: tracker.attacks,
						flaws: tracker.flaws,
						strengths: tracker.strengths,
						commitmentLevel: tracker.commitment_level,
					};
					const selectedTheme =
						COLOR_THEMES.find((theme) => theme.value === tracker.color_theme) ||
						COLOR_THEMES[0];
					const selectedType =
						PERSONALITY_TYPES.find(
							(type) => type.value === tracker.card_type,
						) || PERSONALITY_TYPES[0];

					return (
						<div key={tracker.id} className="flex justify-center">
							<PersonCardDisplay
								cardData={cardData}
								selectedTheme={selectedTheme}
								selectedType={selectedType}
								image={tracker.photo_url}
								imageScale={tracker.image_scale || 1}
								imagePosition={tracker.image_position || { x: 0, y: 0 }}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default AllTrackersPage;
