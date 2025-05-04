import { screen, waitFor } from "@testing-library/react";
import { MOCK_PLACE } from "app/test/mocks/place";
import { renderWithProviders } from "app/test/utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Import after mocks are set up
import Place from "~/routes/place/index";

describe("Place", () => {
	const navigate = vi.fn();

	test("should redirect to login if user is not authenticated", async () => {
		renderWithProviders(
			<Place
				matches={[] as any}
				params={{ id: MOCK_PLACE.googleMapsId }}
				loaderData={MOCK_PLACE}
			/>,
			{ isAuth: false },
		);

		await waitFor(() => {
			expect(navigate).toHaveBeenCalledWith("/login");
		});
	});

	test("should render place", async () => {
		renderWithProviders(
			<Place
				matches={[] as any}
				params={{ id: MOCK_PLACE.googleMapsId }}
				loaderData={MOCK_PLACE}
			/>,
			{ isAuth: true },
		);

		await waitFor(() => {
			expect(screen.queryByText(MOCK_PLACE.name)).toBeInTheDocument();
		});
	});
});
