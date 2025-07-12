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
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
				setIsDropdownOpen(false);
			}
		},
		[data, setSelected],
	);

	const handleFocus = useCallback(() => {
		setInputFocused(true);
		setIsDropdownOpen(true);
	}, []);

	const handleBlur = useCallback(() => {
		// Use a shorter timeout to prevent race conditions
		setTimeout(() => {
			setInputFocused(false);
			setIsDropdownOpen(false);
		}, 50);
	}, []);

	const hasResults = data && data.length > 0;
	const shouldShowDropdown =
		inputFocused && (isLoading || (hasResults && value.length > 0));

	return (
		<div
			data-testid="places-autocomplete"
			className="relative w-full max-w-3xl"
		>
			<Command
				className="border rounded-md border-gray-300"
				shouldFilter={false}
			>
				<CommandInput
					data-testid="places-autocomplete-input"
					className="w-full bg-background border-none"
					value={value}
					onValueChange={onValueChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder="Search for places..."
					aria-expanded={shouldShowDropdown}
					aria-haspopup="listbox"
					aria-autocomplete="list"
					role="combobox"
				/>
				{shouldShowDropdown && (
					<CommandList className="max-h-60 border-t">
						{isLoading && <PlacesAutocompleteLoading show={!!value} />}

						<CommandGroup data-testid="places-autocomplete-results">
							{data?.map((suggestion) => (
								<CommandItem
									key={suggestion.place_id}
									value={suggestion.place_id}
									onSelect={() => handleSelect(suggestion.place_id)}
									className={`cursor-pointer ${styles.autocompleteItem}`}
									data-testid="places-autocomplete-option"
								>
									<div className="flex flex-col truncate w-full">
										<span className="font-medium text-sm">
											{suggestion.structured_formatting.main_text}
										</span>
										<span className="text-muted-foreground font-light text-xs">
											{suggestion.structured_formatting.secondary_text}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>

						{value && !isLoading && data && data.length === 0 && (
							<CommandEmpty className="text-center py-4 text-sm text-muted-foreground">
								No results found.
							</CommandEmpty>
						)}
					</CommandList>
				)}
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
			gap: 4,
			padding: "8px 0",
		}}
		{...props}
	>
		<LoadingItem />
		<LoadingItem />
		<LoadingItem />
	</div>
);

const LoadingItem = (props: React.ComponentProps<"div">) => (
	<div className={styles.loadingItem} {...props}>
		<div className="w-3/4 h-3 bg-muted rounded mb-1" />
		<div className="w-1/2 h-2 bg-muted/50 rounded" />
	</div>
);

export default memo(PlacesAutocomplete);
