import { useParams } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, test } from "vitest";

import Place from "src/routes/place/$id.lazy";
import { MOCK_PLACE } from "src/test/mocks/place";
import { renderWithProviders } from "src/test/utils";

describe("Place", () => {
	beforeEach(() => {
		(useParams as Mock).mockReturnValue({ id: MOCK_PLACE.googleMapsId });
	});

	test("should render", async () => {
		renderWithProviders(<Place />);
		expect(await screen.findByText(MOCK_PLACE.name)).toBeInTheDocument();
	});
});
