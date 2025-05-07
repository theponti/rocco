import styled from "@emotion/styled";
import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
} from "@headlessui/react";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { memo, useCallback, useRef, useState } from "react";
import Alert from "~/components/alert";
import Loading from "~/components/loading";
import {
	type GooglePlacePrediction,
	useGooglePlacesAutocomplete,
} from "~/hooks/useGooglePlacesAutocomplete";
import type { PlaceLocation } from "~/lib/types";

const Wrapper = styled.div`
  position: relative;
`;

const Options = styled(ComboboxOptions)`
  margin-top: 8px;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  position: absolute;
  z-index: 1;
`;

const Option = styled(ComboboxOption)`
  padding: 8px 20px;

  &:focus,
  &:hover,
  &[aria-selected="true"],
  &[data-headlessui-state="active"] {
    background-color: #037afb;
    color: white;
    font-weight: 600;
  }

  &:focus,
  &:hover {
    cursor: pointer;
  }

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const InputWrap = styled.div`
  display: flex;
  place-content: center;
  position: relative;
  align-items: center;
  margin: 0 auto;

  svg {
    margin-left: -30px;
  }
`;

const LoadingWrap = styled.div`
  display: flex;
  place-content: center;
  align-items: center;
  padding: 24px;
  border-radius: 4px;
`;

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

	const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
		}
		const id = setTimeout(() => {
			setDebouncedValue(e.target.value);
		}, DEBOUNCE_TIME_MS);
		timeoutId.current = id;
	}, []);

	const { data, error, isLoading } = useGooglePlacesAutocomplete({
		input: debouncedValue,
		location: center
			? { latitude: center.latitude, longitude: center.longitude }
			: undefined,
		radius: 100,
		apiKey,
	});

	const handleSelect = useCallback(
		async (placeId: string) => {
			if (!data) return;
			const selected = data.find((p) => p.place_id === placeId);
			if (selected) {
				setSelected(selected);
			}
		},
		[data, setSelected],
	);

	return (
		<Wrapper data-testid="places-autocomplete">
			<Combobox value={value} onChange={handleSelect}>
				<InputWrap>
					<ComboboxInput
						data-testid="places-autocomplete-input"
						className="input input-bordered w-full"
						value={value}
						onChange={onInputChange}
					/>
					<Search size={24} className="text-primary" />
				</InputWrap>
				{(isLoading || data) && (
					<Options className="bg-white overflow-y-scroll">
						{isLoading ? (
							<LoadingWrap>
								<Loading />
							</LoadingWrap>
						) : (
							data?.map((suggestion) => renderSuggestion({ suggestion }))
						)}
					</Options>
				)}
			</Combobox>
			{error && <Alert type="error">{error.message}</Alert>}
		</Wrapper>
	);
}

// Rendering options - memoized to avoid recreating on every render
const renderSuggestion = memo(
	({ suggestion }: { suggestion: GooglePlacePrediction }) => (
		<Option
			data-testid="places-autocomplete-option"
			key={suggestion.place_id}
			value={suggestion.place_id}
			className="truncate text-primary"
		>
			<span className="font-medium">
				{suggestion.structured_formatting.main_text}
			</span>
			,{" "}
			<span className="text-slate-400 font-light">
				{suggestion.structured_formatting.secondary_text}
			</span>
		</Option>
	),
);

export default memo(PlacesAutocomplete);
