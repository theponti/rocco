import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { item, list, place } from "../../../db/schema";
import { protectedProcedure, publicProcedure, router } from "../context";

export const placesRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const allPlaces = await ctx.db.query.place.findMany({
			orderBy: [desc(place.createdAt)],
		});

		return allPlaces;
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const foundPlace = await ctx.db.query.place.findFirst({
				where: eq(place.id, input.id),
			});

			if (!foundPlace) {
				throw new Error("Place not found");
			}

			return foundPlace;
		}),

	getByGoogleMapsId: publicProcedure
		.input(z.object({ googleMapsId: z.string() }))
		.query(async ({ ctx, input }) => {
			const foundPlace = await ctx.db.query.place.findFirst({
				where: eq(place.googleMapsId, input.googleMapsId),
			});

			if (!foundPlace) {
				throw new Error("Place not found");
			}

			return foundPlace;
		}),

	getOrCreateByGoogleMapsId: protectedProcedure
		.input(
			z.object({
				googleMapsId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// First try to find existing place
			const existingPlace = await ctx.db.query.place.findFirst({
				where: eq(place.googleMapsId, input.googleMapsId),
			});

			if (existingPlace) {
				return existingPlace;
			}

			// If not found, fetch place details from Google Places API
			const placeDetails = await fetch(
				`https://places.googleapis.com/v1/places/${input.googleMapsId}`,
				{
					headers: {
						"X-Goog-Api-Key": process.env.GOOGLE_API_KEY || "",
						"X-Goog-FieldMask":
							"places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.websiteUri,places.phoneNumber,places.priceLevel,places.photos",
					},
				},
			);

			if (!placeDetails.ok) {
				throw new Error("Failed to fetch place details from Google Places API");
			}

			const placeData = await placeDetails.json();
			const placeInfo = placeData.places?.[0];

			if (!placeInfo) {
				throw new Error("Place not found in Google Places API");
			}

			// Extract photo URLs from the API response
			// Google Places API returns photo references that need to be converted to URLs
			const photoUrls =
				placeInfo.photos?.map((photo: any) => {
					// The photo.name contains the photo reference
					// We'll store the photo reference and let the frontend handle the URL construction
					// This allows for better caching and size optimization
					return photo.name;
				}) || [];

			// Create new place with fetched data
			const newPlace = await ctx.db
				.insert(place)
				.values({
					id: crypto.randomUUID(),
					googleMapsId: input.googleMapsId,
					name: placeInfo.displayName?.text || "Unknown Place",
					address: placeInfo.formattedAddress,
					latitude: placeInfo.location?.latitude,
					longitude: placeInfo.location?.longitude,
					types: placeInfo.types,
					rating: placeInfo.rating,
					websiteUri: placeInfo.websiteUri,
					phoneNumber: placeInfo.phoneNumber,
					priceLevel: placeInfo.priceLevel,
					photos: photoUrls.length > 0 ? photoUrls : undefined,
					userId: ctx.user.id,
					location:
						placeInfo.location?.latitude && placeInfo.location?.longitude
							? ([
									placeInfo.location.longitude,
									placeInfo.location.latitude,
								] as [number, number])
							: ([0, 0] as [number, number]),
				})
				.returning();

			return newPlace[0];
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				address: z.string().optional(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				imageUrl: z.string().optional(),
				googleMapsId: z.string().optional(),
				rating: z.number().optional(),
				types: z.array(z.string()).optional(),
				websiteUri: z.string().optional(),
				phoneNumber: z.string().optional(),
				photos: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const newPlace = await ctx.db
				.insert(place)
				.values({
					id: crypto.randomUUID(),
					...input,
					userId: ctx.user.id,
					location:
						input.latitude && input.longitude
							? ([input.longitude, input.latitude] as [number, number])
							: ([0, 0] as [number, number]), // Default location if coordinates not provided
				})
				.returning();

			return newPlace[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				address: z.string().optional(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				imageUrl: z.string().optional(),
				rating: z.number().optional(),
				types: z.array(z.string()).optional(),
				websiteUri: z.string().optional(),
				phoneNumber: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const { id, latitude, longitude, ...updateData } = input;

			// Update location if coordinates are provided
			const locationUpdate =
				latitude && longitude
					? { location: [longitude, latitude] as [number, number] }
					: {};

			const updatedPlace = await ctx.db
				.update(place)
				.set({
					...updateData,
					...locationUpdate,
					updatedAt: new Date().toISOString(),
				})
				.where(and(eq(place.id, id), eq(place.userId, ctx.user.id)))
				.returning();

			if (updatedPlace.length === 0) {
				throw new Error(
					"Place not found or you don't have permission to update it",
				);
			}

			return updatedPlace[0];
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const deletedPlace = await ctx.db
				.delete(place)
				.where(and(eq(place.id, input.id), eq(place.userId, ctx.user.id)))
				.returning();

			if (deletedPlace.length === 0) {
				throw new Error(
					"Place not found or you don't have permission to delete it",
				);
			}

			return { success: true };
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Implement place search logic
			// This would typically integrate with Google Places API
			// For now, return empty array
			return [];
		}),

	getListsForPlace: publicProcedure
		.input(z.object({ placeId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			// Find all items where itemId = placeId and itemType = 'PLACE'
			const items = await ctx.db.query.item.findMany({
				where: and(eq(item.itemId, input.placeId), eq(item.itemType, "PLACE")),
			});
			const listIds = items.map((i) => i.listId);
			if (listIds.length === 0) return [];
			// Fetch the lists
			const lists = await ctx.db.query.list.findMany({
				where: inArray(list.id, listIds),
			});
			return lists;
		}),
});
