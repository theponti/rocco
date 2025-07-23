import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	foreignKey,
	geometry,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const itemType = pgEnum("ItemType", ["FLIGHT", "PLACE"]);

export const list = pgTable("list", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	userId: uuid().notNull(),
	createdAt: timestamp({ precision: 3, mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: "string" }).defaultNow().notNull(),
	isPublic: boolean().default(false).notNull(),
});

export const place = pgTable(
	"place",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		description: text(),
		address: text(),
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		userId: uuid().notNull(),
		itemId: uuid(),
		googleMapsId: text("google_maps_id"),
		types: text().array(),
		imageUrl: text(),
		phoneNumber: text(),
		rating: doublePrecision(),
		websiteUri: text(),
		latitude: doublePrecision(),
		longitude: doublePrecision(),
		location: geometry({ type: "point" }).notNull(),
		bestFor: text("best_for"),
		isPublic: boolean("is_public").default(false).notNull(),
		wifiInfo: text("wifi_info"),
		photos: text().array(),
		priceLevel: integer("price_level"),
	},
	(table) => [
		foreignKey({
			columns: [table.itemId],
			foreignColumns: [item.id],
			name: "place_itemId_item_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	],
);

export const item = pgTable(
	"item",
	{
		id: uuid().primaryKey().notNull(),
		type: text().notNull(),
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		itemId: uuid().notNull(),
		listId: uuid().notNull(),
		userId: uuid().notNull(),
		itemType: itemType().default("PLACE").notNull(),
	},
	(table) => [
		uniqueIndex("item_listId_itemId_key").using(
			"btree",
			table.listId.asc().nullsLast().op("uuid_ops"),
			table.itemId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "item_listId_list_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("restrict"),
	],
);

export const tags = pgTable("tags", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	userId: uuid("user_id"),
});

export const placeTags = pgTable(
	"place_tags",
	{
		placeId: uuid("place_id"),
		tagId: uuid("tag_id"),
	},
	(table) => [
		foreignKey({
			columns: [table.placeId],
			foreignColumns: [place.id],
			name: "place_tags_place_id_place_id_fk",
		}),
		foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "place_tags_tag_id_tags_id_fk",
		}),
	],
);

export const placeVisits = pgTable(
	"place_visits",
	{
		eventId: uuid("event_id"),
		placeId: uuid("place_id"),
		notes: text(),
		rating: integer(),
		review: text(),
		people: text(),
		userId: uuid("user_id"),
	},
	(table) => [
		foreignKey({
			columns: [table.placeId],
			foreignColumns: [place.id],
			name: "place_visits_place_id_place_id_fk",
		}),
	],
);

export const userLists = pgTable(
	"user_lists",
	{
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		listId: uuid().notNull(),
		userId: uuid().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "user_lists_listId_list_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
		primaryKey({
			columns: [table.listId, table.userId],
			name: "user_lists_pkey",
		}),
	],
);

export const listInvite = pgTable(
	"list_invite",
	{
		accepted: boolean().default(false).notNull(),
		listId: uuid().notNull(),
		invitedUserEmail: text().notNull(),
		invitedUserId: uuid(),
		userId: uuid().notNull(),
		acceptedAt: timestamp({ precision: 3, mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "list_invite_listId_list_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
		primaryKey({
			columns: [table.listId, table.invitedUserEmail],
			name: "list_invite_pkey",
		}),
	],
);

// Define relations between tables
export const listInviteRelations = relations(listInvite, ({ one }) => ({
	list: one(list, {
		fields: [listInvite.listId],
		references: [list.id],
	}),
}));

export const listRelations = relations(list, ({ many }) => ({
	invites: many(listInvite),
}));
