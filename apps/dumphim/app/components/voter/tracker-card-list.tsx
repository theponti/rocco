import type React from "react";
import { useState } from "react";
import type { PokemonTheme } from "~/lib/pokemon-theme-context";
import type { Tracker } from "~/lib/voter.types";
import TrackerCard from "./tracker-card";

// Array of available themes
const POKEMON_THEMES: PokemonTheme[] = [
	"yellow",
	"blue",
	"red",
	"green",
	"purple",
];

interface TrackerCardListProps {
	trackers: Tracker[];
	onSelect: (tracker: Tracker) => void;
}

const TrackerCardList: React.FC<TrackerCardListProps> = ({
	trackers,
	onSelect,
}) => {
	// State to track which theme is selected for each card
	const [cardThemes, setCardThemes] = useState<Record<string, PokemonTheme>>(
		{},
	);

	// Function to set a specific card's theme
	const setCardTheme = (trackerId: string, theme: PokemonTheme) => {
		setCardThemes((prev) => ({
			...prev,
			[trackerId]: theme,
		}));
	};

	// Get theme for a card - either from state or generate based on ID
	const getCardTheme = (tracker: Tracker): PokemonTheme => {
		// If we've already set a theme for this card, use that
		if (cardThemes[tracker.id]) {
			return cardThemes[tracker.id];
		}

		// Otherwise, determine a theme based on the ID
		// This ensures each card gets a consistent theme, even after page refresh
		const charSum = tracker.id
			.split("")
			.reduce((sum, char) => sum + char.charCodeAt(0), 0);
		return POKEMON_THEMES[charSum % POKEMON_THEMES.length];
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{trackers.map((tracker) => (
					<div key={tracker.id} className="relative group">
						<TrackerCard
							tracker={tracker}
							onSelect={onSelect}
							theme={getCardTheme(tracker)}
						/>
						<div className="card-theme-selector opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							{POKEMON_THEMES.map((theme) => (
								<button
									key={theme}
									onClick={(e) => {
										e.stopPropagation();
										setCardTheme(tracker.id, theme);
									}}
									className={`card-theme-button theme-option-${theme} ${
										getCardTheme(tracker) === theme ? "ring-2 ring-white" : ""
									}`}
									title={`Set ${theme} theme`}
									type="button"
									aria-label={`Set card to ${theme} theme`}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TrackerCardList;
