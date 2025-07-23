import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { item, list, place } from "../../../db/schema";
import { safeAsync } from "../../errors";
import { logger } from "../../logger";
import { protectedProcedure, publicProcedure, router } from "../context";

export const listsRouter = router({
	getListOptions: protectedProcedure
		.input(z.object({ googleMapsId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not found in context",
				});
			}

			// Get all lists for the user
			const userLists = await ctx.db.query.list.findMany({
				where: eq(list.userId, ctx.user.id),
				orderBy: [desc(list.updatedAt)],
			});

			// For each list, check if the place with googleMapsId is in the list
			const results = await Promise.all(
				userLists.map(async (l) => {
					const placeItems = await ctx.db.query.item.findMany({
						where: and(eq(item.listId, l.id), eq(item.itemType, "PLACE")),
					});
					// Get all places for these items
					const placeIds = placeItems.map((i) => i.itemId);
					let isInList = false;
					if (placeIds.length > 0) {
						const placesInList = await ctx.db.query.place.findMany({
							where: inArray(place.id, placeIds),
						});
						isInList = placesInList.some(
							(p) => p.googleMapsId === input.googleMapsId,
						);
					}
					return {
						...l,
						isInList,
					};
				}),
			);
			return results;
		}),
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return safeAsync(
			async () => {
				if (!ctx.user) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User not found in context",
					});
				}

				const userLists = await ctx.db.query.list.findMany({
					where: eq(list.userId, ctx.user.id),
					orderBy: [desc(list.updatedAt)],
				});

				logger.info("Retrieved user lists", {
					userId: ctx.user.id,
					count: userLists.length,
				});

				return userLists.map((listItem) => ({
					...listItem,
					isOwnList: true,
					itemCount: 0, // TODO: Add item count query
				}));
			},
			"getAll lists",
			{ userId: ctx.user?.id },
		);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			return safeAsync(
				async () => {
					const foundList = await ctx.db.query.list.findFirst({
						where: eq(list.id, input.id),
					});

					if (!foundList) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "List not found",
						});
					}

					// Get all place items for this list
					const placeItems = await ctx.db.query.item.findMany({
						where: and(eq(item.listId, input.id), eq(item.itemType, "PLACE")),
						orderBy: [desc(item.createdAt)],
					});

					// Get the places for these items
					const placeIds = placeItems.map((item) => item.itemId);
					const places =
						placeIds.length > 0
							? await ctx.db.query.place.findMany({
									where: inArray(place.id, placeIds),
								})
							: [];

					logger.info("Retrieved list by ID with places", {
						listId: input.id,
						userId: ctx.user?.id,
						isOwnList: ctx.user?.id === foundList.userId,
						placeCount: places.length,
					});

					return {
						...foundList,
						isOwnList: ctx.user?.id === foundList.userId,
						itemCount: placeItems.length,
						places,
					};
				},
				"getById list",
				{ listId: input.id, userId: ctx.user?.id },
			);
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().min(1),
				isPublic: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const newList = await ctx.db
				.insert(list)
				.values({
					id: crypto.randomUUID(),
					...input,
					userId: ctx.user.id,
				})
				.returning();

			return newList[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).optional(),
				description: z.string().min(1).optional(),
				isPublic: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const { id, ...updateData } = input;

			const updatedList = await ctx.db
				.update(list)
				.set({
					...updateData,
					updatedAt: new Date().toISOString(),
				})
				.where(and(eq(list.id, id), eq(list.userId, ctx.user.id)))
				.returning();

			if (updatedList.length === 0) {
				throw new Error(
					"List not found or you don't have permission to update it",
				);
			}

			return updatedList[0];
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const deletedList = await ctx.db
				.delete(list)
				.where(and(eq(list.id, input.id), eq(list.userId, ctx.user.id)))
				.returning();

			if (deletedList.length === 0) {
				throw new Error(
					"List not found or you don't have permission to delete it",
				);
			}

			return { success: true };
		}),
});
