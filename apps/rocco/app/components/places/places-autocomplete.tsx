import { Check, ChevronsUpDown } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import Alert from "~/components/alert";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	type GooglePlacePrediction,
	useGooglePlacesAutocomplete,
} from "~/hooks/useGooglePlacesAutocomplete";
import type { PlaceLocation } from "~/lib/types";
import { cn } from "~/lib/utils";
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
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
	const DEBOUNCE_TIME_MS = 1000;
	const [debouncedValue, setDebouncedValue] = useState("");

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
		(place: GooglePlacePrediction) => {
			setValue(
				`${place.structured_formatting.main_text}, ${place.structured_formatting.secondary_text}`,
			);
			setSelected(place);
			setOpen(false);
		},
		[setSelected],
	);

	const hasResults = data && data.length > 0;
	const shouldShowResults = isLoading || (hasResults && value.length > 0);

	return (
		<div
			data-testid="places-autocomplete"
			className="relative w-full max-w-3xl"
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						aria-expanded={open}
						className={cn(
							"w-full justify-between",
							!value && "text-muted-foreground",
						)}
						data-testid="places-autocomplete-input"
					>
						{value || "Search for places..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Search for places..."
							value={value}
							onValueChange={onValueChange}
							className="h-9"
						/>
						<CommandList>
							{isLoading && <PlacesAutocompleteLoading show={!!value} />}

							<CommandGroup data-testid="places-autocomplete-results">
								{data?.map((suggestion) => (
									<CommandItem
										key={suggestion.place_id}
										value={suggestion.place_id}
										onSelect={() => handleSelect(suggestion)}
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
										<Check className="ml-auto h-4 w-4 opacity-0" />
									</CommandItem>
								))}
							</CommandGroup>

							{value && !isLoading && data && data.length === 0 && (
								<CommandEmpty className="text-center py-4 text-sm text-muted-foreground">
									No results found.
								</CommandEmpty>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

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
