import { screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, test } from "vitest";
import { vi } from "vitest";

import * as auth from "src/lib/auth";
import { Component as Account } from "src/scenes/account";
import {
	TEST_USER_NAME,
	renderWithProviders,
	useAuthMock,
} from "src/test/utils";

describe("Account", () => {
	beforeEach(() => {
		vi.spyOn(auth, "useAuth").mockReturnValue(useAuthMock({ isAuth: true }));
	});

	test("renders when loading = true", () => {
		renderWithProviders(<Account />);
		expect(screen.getByText(TEST_USER_NAME)).toBeInTheDocument();
	});
});