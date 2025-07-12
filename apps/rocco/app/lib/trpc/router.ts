import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { bookmark, item, list, listInvite, place } from "../../db/schema";
import {
	protectedProcedure,
	publicProcedure,
	router,
	userProcedure,
} from "./context";

// Note: User management is handled by Supabase Auth
// We don't need a users router since Supabase handles:
// - User registration
// - User authentication
// - User profile management
// - Password reset
// - Email verification

// Lists router
const listsRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error("User not found in context");
		}

		const userLists = await ctx.db.query.list.findMany({
			where: eq(list.userId, ctx.user.id),
			orderBy: [desc(list.updatedAt)],
		});

		return userLists.map((listItem) => ({
			...listItem,
			isOwnList: true,
			itemCount: 0, // TODO: Add item count query
		}));
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const foundList = await ctx.db.query.list.findFirst({
				where: eq(list.id, input.id),
			});

			if (!foundList) {
				throw new Error("List not found");
			}

			return {
				...foundList,
				isOwnList: ctx.user?.id === foundList.userId,
				itemCount: 0, // TODO: Add item count query
			};
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

// Places router
const placesRouter = router({
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

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				address: z.string().optional(),
				googleMapsId: z.string().optional(),
				types: z.array(z.string()).optional(),
				imageUrl: z.string().optional(),
				phoneNumber: z.string().optional(),
				rating: z.number().optional(),
				websiteUri: z.string().optional(),
				latitude: z.number().optional(),
				longitude: z.number().optional(),
				bestFor: z.string().optional(),
				isPublic: z.boolean().default(false),
				wifiInfo: z.string().optional(),
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
					location: [input.longitude || 0, input.latitude || 0],
				})
				.returning();

			return newPlace[0];
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
});

// Items router (for list items)
const itemsRouter = router({
	addToList: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				itemId: z.string().uuid(),
				itemType: z.enum(["FLIGHT", "PLACE"]).default("PLACE"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list
			const listItem = await ctx.db.query.list.findFirst({
				where: and(eq(list.id, input.listId), eq(list.userId, ctx.user.id)),
			});

			if (!listItem) {
				throw new Error(
					"List not found or you don't have permission to add items to it",
				);
			}

			// Check if item is already in list
			const existingItem = await ctx.db.query.item.findFirst({
				where: and(
					eq(item.listId, input.listId),
					eq(item.itemId, input.itemId),
				),
			});

			if (existingItem) {
				throw new Error("Item is already in this list");
			}

			const newItem = await ctx.db
				.insert(item)
				.values({
					id: crypto.randomUUID(),
					...input,
					userId: ctx.user.id,
					type: input.itemType,
				})
				.returning();

			return newItem[0];
		}),

	removeFromList: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				itemId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list
			const listItem = await ctx.db.query.list.findFirst({
				where: and(eq(list.id, input.listId), eq(list.userId, ctx.user.id)),
			});

			if (!listItem) {
				throw new Error(
					"List not found or you don't have permission to remove items from it",
				);
			}

			const deletedItem = await ctx.db
				.delete(item)
				.where(
					and(eq(item.listId, input.listId), eq(item.itemId, input.itemId)),
				)
				.returning();

			if (deletedItem.length === 0) {
				throw new Error("Item not found in list");
			}

			return { success: true };
		}),
});

// Invites router
const invitesRouter = router({
	getByList: protectedProcedure
		.input(z.object({ listId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list
			const listItem = await ctx.db.query.list.findFirst({
				where: and(eq(list.id, input.listId), eq(list.userId, ctx.user.id)),
			});

			if (!listItem) {
				throw new Error(
					"List not found or you don't have permission to view invites",
				);
			}

			const listInvitesList = await ctx.db.query.listInvite.findMany({
				where: eq(listInvite.listId, input.listId),
			});

			return listInvitesList;
		}),

	create: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list
			const listItem = await ctx.db.query.list.findFirst({
				where: and(eq(list.id, input.listId), eq(list.userId, ctx.user.id)),
			});

			if (!listItem) {
				throw new Error(
					"List not found or you don't have permission to invite users to it",
				);
			}

			// Check if invite already exists
			const existingInvite = await ctx.db.query.listInvite.findFirst({
				where: and(
					eq(listInvite.listId, input.listId),
					eq(listInvite.invitedUserEmail, input.invitedUserEmail),
				),
			});

			if (existingInvite) {
				throw new Error("Invite already exists for this user and list");
			}

			const newInvite = await ctx.db
				.insert(listInvite)
				.values({
					...input,
					userId: ctx.user.id,
				})
				.returning();

			return newInvite[0];
		}),

	accept: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const invite = await ctx.db.query.listInvite.findFirst({
				where: and(
					eq(listInvite.listId, input.listId),
					eq(listInvite.invitedUserEmail, input.invitedUserEmail),
				),
			});

			if (!invite) {
				throw new Error(
					"Invite not found or you don't have permission to accept it",
				);
			}

			const updatedInvite = await ctx.db
				.update(listInvite)
				.set({
					accepted: true,
					acceptedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(listInvite.listId, input.listId),
						eq(listInvite.invitedUserEmail, input.invitedUserEmail),
					),
				)
				.returning();

			return updatedInvite[0];
		}),

	delete: protectedProcedure
		.input(
			z.object({
				listId: z.string().uuid(),
				invitedUserEmail: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			// Check if user owns the list or is the invited user
			const invite = await ctx.db.query.listInvite.findFirst({
				where: and(
					eq(listInvite.listId, input.listId),
					eq(listInvite.invitedUserEmail, input.invitedUserEmail),
				),
			});

			if (!invite) {
				throw new Error("Invite not found");
			}

			const canDelete =
				invite.userId === ctx.user.id ||
				invite.invitedUserEmail === ctx.user.email;

			if (!canDelete) {
				throw new Error("You don't have permission to delete this invite");
			}

			const deletedInvite = await ctx.db
				.delete(listInvite)
				.where(
					and(
						eq(listInvite.listId, input.listId),
						eq(listInvite.invitedUserEmail, input.invitedUserEmail),
					),
				)
				.returning();

			return { success: true };
		}),
});

// Bookmarks router
const bookmarksRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error("User not found in context");
		}

		const allBookmarks = await ctx.db.query.bookmark.findMany({
			where: eq(bookmark.userId, ctx.user.id),
			orderBy: [desc(bookmark.createdAt)],
		});

		return allBookmarks;
	}),

	create: protectedProcedure
		.input(
			z.object({
				image: z.string().optional(),
				title: z.string().min(1),
				description: z.string().optional(),
				imageHeight: z.string().optional(),
				imageWidth: z.string().optional(),
				locationAddress: z.string().optional(),
				locationLat: z.string().optional(),
				locationLng: z.string().optional(),
				siteName: z.string().min(1),
				url: z.string().url(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const newBookmark = await ctx.db
				.insert(bookmark)
				.values({
					id: crypto.randomUUID(),
					...input,
					userId: ctx.user.id,
				})
				.returning();

			return newBookmark[0];
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.user) {
				throw new Error("User not found in context");
			}

			const deletedBookmark = await ctx.db
				.delete(bookmark)
				.where(and(eq(bookmark.id, input.id), eq(bookmark.userId, ctx.user.id)))
				.returning();

			if (deletedBookmark.length === 0) {
				throw new Error("Bookmark not found");
			}

			return { success: true };
		}),
});

// Main router
export const appRouter = router({
	lists: listsRouter,
	places: placesRouter,
	items: itemsRouter,
	invites: invitesRouter,
	bookmarks: bookmarksRouter,
	user: userProcedure,
});

export type AppRouter = typeof appRouter;
