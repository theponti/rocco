import type { List, Place, User } from "~/lib/types";

export * from "./place";

export const USER_ID = "user-id";
export const TEST_USER_EMAIL = "test-user@ponti.io";
export const TEST_USER_NAME = "Test User";

export const TEST_USER: User = {
	id: USER_ID,
	image: "https://example.com/avatar.jpg",
	isAdmin: false,
	name: TEST_USER_NAME,
	email: TEST_USER_EMAIL,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	supabaseId: null,
	emailVerified: null,
	photoUrl: null,
	birthday: null,
};

export const getMockUser = (): User => ({
	id: USER_ID,
	image: "https://example.com/avatar.jpg",
	email: TEST_USER_EMAIL,
	createdAt: "2021-01-01T00:00:00.000Z",
	updatedAt: "2021-01-01T00:00:00.000Z",
	isAdmin: false,
	name: TEST_USER_NAME,
	supabaseId: null,
	emailVerified: null,
	photoUrl: null,
	birthday: null,
});

export const getMockPlace = (): Place => ({
	id: "123",
	name: "Place Name",
	description: "Description",
	address: "123 Test St",
	createdAt: "2021-01-01T00:00:00.000Z",
	updatedAt: "2021-01-01T00:00:00.000Z",
	userId: USER_ID,
	itemId: "123",
	googleMapsId: "123",
	types: ["type1", "type2"],
	imageUrl: "https://example.com/image.jpg",
	phoneNumber: null,
	rating: 4.5,
	websiteUri: null,
	latitude: 37.7749,
	longitude: -122.4194,
	location: [37.7749, -122.4194], // PostGIS point format [x, y]
	bestFor: null,
	isPublic: false,
	wifiInfo: null,
	photos: null,
	priceLevel: null,
});

export const getMockLists = () => [
	{
		id: "1",
		name: "List 1",
		description: "Test list 1",
		userId: USER_ID,
		isPublic: false,
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
	},
	{
		id: "2",
		name: "List 2",
		description: "Test list 2",
		userId: USER_ID,
		isPublic: false,
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
	},
];

export const MOCK_LIST: List = {
	id: "list-1",
	name: "Coffee Spots",
	description: "Great places for coffee",
	userId: USER_ID,
	isPublic: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const MOCK_LISTS: List[] = [
	MOCK_LIST,
	{
		id: "list-2",
		name: "Weekend Getaways",
		description: "Places to visit on weekends",
		userId: USER_ID,
		isPublic: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];
