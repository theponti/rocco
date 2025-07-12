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

export const users = pgTable(
	"users",
	{
		id: uuid().primaryKey().notNull(),
		email: text().notNull(),
		name: text(),
		image: text(),
		supabaseId: text("supabase_id"),
		isAdmin: boolean().default(false).notNull(),
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		emailVerified: timestamp({ precision: 3, mode: "string" }),
		photoUrl: text("photo_url"),
		birthday: text(),
	},
	(table) => [
		uniqueIndex("User_email_key").using(
			"btree",
			table.email.asc().nullsLast().op("text_ops"),
		),
		index("email_idx").using(
			"btree",
			table.email.asc().nullsLast().op("text_ops"),
		),
		index("supabase_id_idx").using(
			"btree",
			table.supabaseId.asc().nullsLast().op("text_ops"),
		),
		unique("users_supabase_id_unique").on(table.supabaseId),
	],
);

export const list = pgTable(
	"list",
	{
		id: uuid().primaryKey().notNull(),
		name: text().notNull(),
		description: text(),
		userId: uuid().notNull(),
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		isPublic: boolean().default(false).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "list_userId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	],
);

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
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "place_userId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
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
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "item_userId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	],
);

export const tags = pgTable(
	"tags",
	{
		id: uuid().primaryKey().notNull(),
		name: text().notNull(),
		userId: uuid("user_id"),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tags_user_id_users_id_fk",
		}),
	],
);

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
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "place_visits_user_id_users_id_fk",
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
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_lists_userId_user_id_fk",
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
		foreignKey({
			columns: [table.invitedUserId],
			foreignColumns: [users.id],
			name: "list_invite_invitedUserId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "list_invite_userId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
		primaryKey({
			columns: [table.listId, table.invitedUserEmail],
			name: "list_invite_pkey",
		}),
	],
);

export const bookmark = pgTable(
	"bookmark",
	{
		id: uuid().primaryKey().notNull(),
		title: text().notNull(),
		description: text(),
		url: text().notNull(),
		image: text(),
		imageHeight: text(),
		imageWidth: text(),
		locationAddress: text(),
		locationLat: text(),
		locationLng: text(),
		siteName: text().notNull(),
		userId: uuid().notNull(),
		createdAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp({ precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookmark_userId_user_id_fk",
		})
			.onUpdate("cascade")
			.onDelete("cascade"),
	],
);
