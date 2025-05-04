import styled from "@emotion/styled";
import { Combobox } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import Alert from "~/components/Alert";
import Loading from "~/components/Loading";

import { URLS, api, queryKeys } from "app/lib/api/base";
import type { Place, PlaceLocation } from "app/lib/types";

const Wrapper = styled.div`
  position: relative;
`;

const Options = styled(Combobox.Options)`
  margin-top: 8px;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  position: absolute;
  z-index: 1;
`;

const Option = styled(Combobox.Option)`
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
}: {
	center: PlaceLocation | null;
	setSelected: (place: Place) => void;
}) {
	const [value, setValue] = useState<Place["googleMapsId"]>("");
	// Use consistent query keys
	const queryKey = useMemo(
		() => queryKeys.places.search(value, center),
		[value, center],
	);

	// Create params object using memoization
	const queryParams = useMemo(
		() => ({
			query: value,
			...(center
				? {
						latitude: center.latitude,
						longitude: center.longitude,
						radius: 100,
					}
				: {}),
		}),
		[value, center],
	);

	const { data, error, isLoading, refetch } = useQuery<Place[], AxiosError>({
		queryKey,
		queryFn: async () => {
			if (value.length < 3 || !center) return Promise.resolve([]);

			const response = await api.get<Place[]>(`${URLS.places}/search`, {
				params: queryParams,
			});

			return response.data;
		},
		enabled: !!value && value.length >= 3 && !!center,
		retry: 1,
		staleTime: 1000 * 60, // 1 minute
	});

	// This debounce prevents excess API requests.
	const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
	const DEBOUNCE_TIME_MS = 1000;
	const onInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);

			if (timeoutId.current) {
				clearTimeout(timeoutId.current);
			}

			// Store the timeout ID
			const id = setTimeout(async () => {
				refetch();
			}, DEBOUNCE_TIME_MS);

			timeoutId.current = id;
		},
		[refetch],
	);

	const handleSelect = useCallback(
		async (googleMapsId: Place["googleMapsId"]) => {
			if (!data) return;
			const selectedPlace = data.find((p) => p.googleMapsId === googleMapsId);
			if (selectedPlace) {
				setSelected(selectedPlace);
			}
		},
		[data, setSelected],
	);

	return (
		<Wrapper data-testid="places-autocomplete">
			<Combobox value={value} onChange={handleSelect}>
				<InputWrap>
					<Combobox.Input
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
							data?.map((suggestion) => (
								<Option
									data-testid="places-autocomplete-option"
									key={suggestion.googleMapsId}
									value={suggestion.googleMapsId}
									className="truncate text-primary"
								>
									<span className="font-medium">{suggestion.name}</span>,{" "}
									<span className="text-slate-400 font-light">
										{suggestion.address}
									</span>
								</Option>
							))
						)}
					</Options>
				)}
			</Combobox>
			{error && <Alert type="error">{error.message}</Alert>}
		</Wrapper>
	);
}

// Rendering options - memoized to avoid recreating on every render
const renderSuggestion = memo(({ suggestion }: { suggestion: Place }) => (
	<Option
		data-testid="places-autocomplete-option"
		key={suggestion.googleMapsId}
		value={suggestion.googleMapsId}
		className="truncate text-primary"
	>
		<span className="font-medium">{suggestion.name}</span>,{" "}
		<span className="text-slate-400 font-light">{suggestion.address}</span>
	</Option>
));

// Memoize to prevent unnecessary re-renders of the entire component
export default memo(PlacesAutocomplete);
