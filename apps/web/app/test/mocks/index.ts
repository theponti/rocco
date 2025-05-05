// ============================================================================
// CONSTANTS & TEST DATA
// ============================================================================

import type { ListPlace, User, UserList } from "~/lib/types";

export * from "./place";

export const USER_ID = "user-id";
export const TEST_USER_EMAIL = "test-user@ponti.io";
export const TEST_USER_NAME = "Test User";

export const TEST_USER: User = {
	id: USER_ID,
	avatar: "https://example.com/avatar.jpg",
	isAdmin: "false",
	name: TEST_USER_NAME,
	email: TEST_USER_EMAIL,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const getMockUser = (): User => ({
	id: USER_ID,
	avatar: "https://example.com/avatar.jpg",
	email: TEST_USER_EMAIL,
	createdAt: "2021-01-01T00:00:00.000Z",
	updatedAt: "2021-01-01T00:00:00.000Z",
	isAdmin: "false",
	name: TEST_USER_NAME,
});

export const getMockPlace = (): ListPlace => ({
	imageUrl: "https://example.com/image.jpg",
	googleMapsId: "123",
	name: "Place Name",
	types: ["type1", "type2"],
	id: "123",
	itemId: "123",
	description: "Description",
});

export const getMockLists = () => [
	{
		id: "1",
		name: "List 1",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
	{
		id: "2",
		name: "List 2",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
];

export const MOCK_LIST = {
	id: "list-1",
	name: "Coffee Spots",
	description: "Great places for coffee",
	userId: "test-user-id",
	listId: "list-1",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	createdBy: TEST_USER,
};

export const MOCK_LISTS: UserList[] = [
	MOCK_LIST,
	{
		id: "list-2",
		name: "Weekend Getaways",
		description: "Places to visit on weekends",
		listId: "list-2",
		userId: "test-user-id",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: TEST_USER,
	},
];
