import { memo, useCallback, useRef, useState } from "react";
import Alert from "~/components/alert";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	type GooglePlacePrediction,
	useGooglePlacesAutocomplete,
} from "~/hooks/useGooglePlacesAutocomplete";
import type { PlaceLocation } from "~/lib/types";
import styles from "./places-autocomplete.module.css";

function PlacesAutocomplete({
	center,
	setSelected,
	apiKey,
}: {
	center: PlaceLocation | null;
	setSelected: (place: GooglePlacePrediction) => void;
	apiKey: string;
}) {
	const [value, setValue] = useState("");
	const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
	const DEBOUNCE_TIME_MS = 1000;
	const [debouncedValue, setDebouncedValue] = useState("");
	const [inputFocused, setInputFocused] = useState(false);

	const onValueChange = useCallback((newValue: string) => {
		setValue(newValue);
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}
		const id = setTimeout(() => {
			setDebouncedValue(newValue);
		}, DEBOUNCE_TIME_MS);
		timeoutId.current = id;
	}, []);

	const { data, error, isLoading } = useGooglePlacesAutocomplete({
		input: debouncedValue,
	});

	const handleSelect = useCallback(
		(placeId: string) => {
			if (!data) return;
			const selected = data.find((p) => p.place_id === placeId);
			if (selected) {
				setValue(
					`${selected.structured_formatting.main_text}, ${selected.structured_formatting.secondary_text}`,
				);
				setSelected(selected);
				setInputFocused(false);
			}
		},
		[data, setSelected],
	);

	return (
		<div data-testid="places-autocomplete" className="w-full">
			<Command className="border rounded-md border-input" shouldFilter={false}>
				<CommandInput
					data-testid="places-autocomplete-input"
					className="w-full bg-background px-2 py-1.5"
					value={value}
					onValueChange={onValueChange}
					onFocus={() => setInputFocused(true)}
					onBlur={() => setTimeout(() => setInputFocused(false), 100)}
					placeholder="Search for places..."
					aria-expanded={
						inputFocused && (isLoading || (data && value.length > 0))
					}
					aria-haspopup="listbox"
				/>
				<CommandList>
					{/* Loading state: show skeletons or empty message */}
					{isLoading && <PlacesAutocompleteLoading show={!!value} />}

					{/* Results: show only if not loading, input is focused, input has value, and there is data */}
					{!isLoading && inputFocused && value && data && data.length > 0 && (
						<CommandGroup data-testid="places-autocomplete-results">
							{data.map((suggestion) => (
								<CommandItem
									key={suggestion.place_id}
									value={suggestion.place_id}
									onSelect={() => handleSelect(suggestion.place_id)}
									className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
									data-testid="places-autocomplete-option"
								>
									<div className="flex flex-col truncate">
										<span className="font-medium">
											{suggestion.structured_formatting.main_text}
										</span>
										<span className="text-slate-400 font-light text-sm">
											{suggestion.structured_formatting.secondary_text}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{/* Empty state: show if not loading, input has value, and no results */}
					{!isLoading &&
						inputFocused &&
						value &&
						(!data || data.length === 0) && (
							<CommandEmpty className="text-center py-4 text-sm text-gray-400">
								No results found.
							</CommandEmpty>
						)}

					{/* Initial state: show prompt if not loading, input is focused, no value, and no results */}
					{!isLoading && inputFocused && !value && (
						<CommandEmpty className="text-center py-4 text-sm text-gray-400">
							Start typing to search for places...
						</CommandEmpty>
					)}
				</CommandList>
			</Command>
			{error && <Alert type="error">{error.message}</Alert>}
		</div>
	);
}

const PlacesAutocompleteLoading = (
	props: React.ComponentProps<"div"> & { show: boolean },
) => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			width: "100%",
			gap: 8,
			padding: "8px 0",
		}}
		{...props}
	>
		{!props.show ? (
			<CommandEmpty className="text-center py-4 text-sm text-gray-400">
				Start typing to search for places...
			</CommandEmpty>
		) : (
			<>
				<LoadingItem />
				<LoadingItem />
				<LoadingItem />
			</>
		)}
	</div>
);

const LoadingItem = (props: React.ComponentProps<"div">) => (
	<div className={styles.loadingItem} {...props}>
		<div className="w-3/4 h-4 bg-primary/10 rounded mb-2" />
		<div className="w-1/2 h-3 bg-primary/5 rounded" />
	</div>
);

export default memo(PlacesAutocomplete);
