import { ThumbsDown, ThumbsUp, User } from "lucide-react";
import type React from "react";
import {
	calculateHP,
	determineEnergyTypes,
	generateRelationshipDescription,
} from "~/lib/pokemon-hp";
import type { PokemonTheme } from "~/lib/pokemon-theme-context";
import { type Tracker, getParsedCons, getParsedPros } from "~/lib/voter.types";
import "./pokemon-card.css";

interface TrackerCardProps {
	tracker: Tracker;
	onSelect: (tracker: Tracker) => void;
	theme?: PokemonTheme;
}

const TrackerCard: React.FC<TrackerCardProps> = ({
	tracker,
	onSelect,
	theme = "yellow", // Default to yellow if no theme is provided
}) => {
	// Calculate HP based on votes and relationship factors
	const { hp, maxHp, percentage } = calculateHP(tracker);

	// Determine energy types based on relationship status
	const energyTypes = determineEnergyTypes(tracker);

	// Generate relationship description based on votes and HP
	const relationshipDesc = generateRelationshipDescription(tracker);

	// Parse pros and cons from JSON strings
	const parsedPros = getParsedPros(tracker);
	const parsedCons = getParsedCons(tracker);

	return (
		<button
			type="button"
			className={`pokemon-card pokemon-theme pokemon-theme-${theme} w-full cursor-pointer`}
			onClick={() => onSelect(tracker)}
			tabIndex={0}
			onKeyDown={(e) => e.key === "Enter" && onSelect(tracker)}
		>
			<div className="pokemon-card-header">
				<h3 className="font-bold text-lg">{tracker.name}</h3>
				<div className="flex space-x-2">
					{energyTypes.map((type) => (
						<span
							key={`energy-${type}`}
							className={`energy-icon energy-${type}`}
							title={`${type.charAt(0).toUpperCase() + type.slice(1)} type`}
						/>
					))}
				</div>
			</div>

			<div className="pokemon-card-image">
				{tracker.photo_url ? (
					<img
						src={tracker.photo_url}
						alt={tracker.name}
						className="w-24 h-24 rounded-lg object-cover border-2 border-white/50"
					/>
				) : (
					<div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center">
						<User size={32} className="text-gray-600" />
					</div>
				)}
			</div>

			<div className="pokemon-card-content">
				{/* Display pros and cons parsed from array */}
				<div className="mb-4">
					{/* Show pros if we have any */}
					{parsedPros.length > 0 && (
						<div className="mb-2">
							<div className="flex items-center mb-1">
								<ThumbsUp size={14} className="mr-1 text-green-600" />
								<span className="text-xs font-bold text-gray-700">Pros:</span>
							</div>
							<ul className="text-xs list-disc list-inside pl-1">
								{parsedPros.map((pro) => (
									<li key={`pro-list-${pro}`} className="line-clamp-1">
										{pro}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Show cons if we have any */}
					{parsedCons.length > 0 && (
						<div>
							<div className="flex items-center mb-1">
								<ThumbsDown size={14} className="mr-1 text-red-600" />
								<span className="text-xs font-bold text-gray-700">Cons:</span>
							</div>
							<ul className="text-xs list-disc list-inside pl-1">
								{parsedCons.map((con) => (
									<li key={`con-list-${con}`} className="line-clamp-1">
										{con}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Show description as fallback for very old data */}
					{parsedPros.length === 0 &&
						parsedCons.length === 0 &&
						tracker.description && (
							<p className="text-sm font-medium line-clamp-2 mb-2">
								{tracker.description}
							</p>
						)}
				</div>

				<div className="pokemon-card-stats">
					<p className="font-medium text-xs">
						HP{" "}
						<span className="float-right font-bold">
							{hp}/{maxHp}
						</span>
					</p>
					<div className="hp-bar-container">
						<div
							className={`hp-bar-glow hp-bar-animated ${
								percentage > 60
									? "hp-bar-high"
									: percentage > 30
										? "hp-bar-medium"
										: "hp-bar-low"
							}`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<div className="mt-2 flex justify-between text-xs">
						<span>Votes: {tracker.votes?.length || 0}</span>
						<span className="font-bold">Type: Relationship</span>
					</div>

					<p className="mt-2 text-xs italic">{relationshipDesc}</p>
				</div>

				<div className="mt-2 text-center">
					<span className="text-xs italic">Tap to view details</span>
				</div>
			</div>
		</button>
	);
};

export default TrackerCard;
