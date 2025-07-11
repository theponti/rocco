import { sql } from "drizzle-orm";
import { boolean, check, doublePrecision, foreignKey, geometry, index, integer, json, jsonb, numeric, pgEnum, pgTable, pgView, primaryKey, serial, text, timestamp, unique, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const itemType = pgEnum("ItemType", ['FLIGHT', 'PLACE'])

export const spatialRefSys = pgTable("spatial_ref_sys", {
	srid: integer().primaryKey().notNull(),
	authName: varchar("auth_name", { length: 256 }),
	authSrid: integer("auth_srid"),
	srtext: varchar({ length: 2048 }),
	proj4Text: varchar({ length: 2048 }),
}, (table) => [
	check("spatial_ref_sys_srid_check", sql`(srid > 0) AND (srid <= 998999)`),
]);

export const verificationToken = pgTable("verification_token", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("VerificationToken_identifier_token_key").using("btree", table.identifier.asc().nullsLast().op("text_ops"), table.token.asc().nullsLast().op("text_ops")),
	uniqueIndex("VerificationToken_token_key").using("btree", table.token.asc().nullsLast().op("text_ops")),
]);

export const session = pgTable("session", {
	id: uuid().primaryKey().notNull(),
	sessionToken: text().notNull(),
	userId: uuid().notNull(),
	expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("session_sessionToken_key").using("btree", table.sessionToken.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: uuid().primaryKey().notNull(),
	userId: uuid().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	uniqueIndex("Account_provider_providerAccountId_key").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_userId_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	image: text(),
	supabaseId: text("supabase_id"),
	isAdmin: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	emailVerified: timestamp({ precision: 3, mode: 'string' }),
	photoUrl: text("photo_url"),
	birthday: text(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("supabase_id_idx").using("btree", table.supabaseId.asc().nullsLast().op("text_ops")),
	unique("users_supabase_id_unique").on(table.supabaseId),
]);

export const list = pgTable("list", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	userId: uuid().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	isPublic: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "list_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const place = pgTable("place", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	address: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
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
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "place_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [item.id],
			name: "place_itemId_item_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const item = pgTable("item", {
	id: uuid().primaryKey().notNull(),
	type: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	itemId: uuid().notNull(),
	listId: uuid().notNull(),
	userId: uuid().notNull(),
	itemType: itemType().default('PLACE').notNull(),
}, (table) => [
	uniqueIndex("item_listId_itemId_key").using("btree", table.listId.asc().nullsLast().op("uuid_ops"), table.itemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "item_listId_list_id_fk"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "item_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const tags = pgTable("tags", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tags_user_id_users_id_fk"
		}),
]);

export const placeTags = pgTable("place_tags", {
	placeId: uuid("place_id"),
	tagId: uuid("tag_id"),
}, (table) => [
	foreignKey({
			columns: [table.placeId],
			foreignColumns: [place.id],
			name: "place_tags_place_id_place_id_fk"
		}),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "place_tags_tag_id_tags_id_fk"
		}),
]);

export const placeVisits = pgTable("place_visits", {
	eventId: uuid("event_id"),
	placeId: uuid("place_id"),
	notes: text(),
	rating: integer(),
	review: text(),
	people: text(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.placeId],
			foreignColumns: [place.id],
			name: "place_visits_place_id_place_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "place_visits_user_id_users_id_fk"
		}),
]);

export const userLists = pgTable("user_lists", {
	createdAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).defaultNow().notNull(),
	listId: uuid().notNull(),
	userId: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "user_lists_listId_list_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_lists_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.listId, table.userId], name: "user_lists_pkey"}),
]);

export const listInvite = pgTable("list_invite", {
	accepted: boolean().default(false).notNull(),
	listId: uuid().notNull(),
	invitedUserEmail: text().notNull(),
	invitedUserId: uuid(),
	userId: uuid().notNull(),
	acceptedAt: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [list.id],
			name: "list_invite_listId_list_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.invitedUserId],
			foreignColumns: [users.id],
			name: "list_invite_invitedUserId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "list_invite_userId_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.listId, table.invitedUserEmail], name: "list_invite_pkey"}),
]);

export const geographyColumns = pgView("geography_columns", {
	fTableCatalog: varchar("f_table_catalog", { length: 256 }),
	fTableSchema: varchar("f_table_schema", { length: 256 }),
	fTableName: varchar("f_table_name", { length: 256 }),
	fGeographyColumn: varchar("f_geography_column", { length: 256 }),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: text(),
}).as(sql`SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);

export const geometryColumns = pgView("geometry_columns", {
	fTableCatalog: varchar("f_table_catalog", { length: 256 }),
	fTableSchema: varchar("f_table_schema", { length: 256 }),
	fTableName: varchar("f_table_name", { length: 256 }),
	fGeometryColumn: varchar("f_geometry_column", { length: 256 }),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: varchar({ length: 30 }),
}).as(sql`SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, (regexp_match(s.consrc, 'geometrytype(w+)s*=s*(w+)'::text, 'i'::text))[1] AS type FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~* 'geometrytype(w+)s*=s*w+'::text) st ON st.connamespace = n.oid AND st.conrelid = c.oid AND (a.attnum = ANY (st.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, (regexp_match(s.consrc, 'ndims(w+)s*=s*(d+)'::text, 'i'::text))[1]::integer AS ndims FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~* 'ndims(w+)s*=s*d+'::text) sn ON sn.connamespace = n.oid AND sn.conrelid = c.oid AND (a.attnum = ANY (sn.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, (regexp_match(s.consrc, 'srid(w+)s*=s*(d+)'::text, 'i'::text))[1]::integer AS srid FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~* 'srid(w+)s*=s*(d+)'::text) sr ON sr.connamespace = n.oid AND sr.conrelid = c.oid AND (a.attnum = ANY (sr.conkey)) WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);