import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

export default [
	// Main layout with global UI elements
	layout("routes/layout.tsx", [
		// Public routes
		index("./routes/index.tsx"),

		// Auth-protected routes
		// Dashboard section
		...prefix("dashboard", [
			layout("./routes/dashboard/layout.tsx", [
				index("./routes/dashboard/index.tsx"),
			]),
		]),

		// Account management
		route("account", "./routes/account/index.tsx"),

		// Invites section with its own sub-routes
		...prefix("invites", [
			index("./routes/invites/index.tsx"),
			// Additional invite routes could be added here
		]),

		// Lists section with nested hierarchy
		...prefix("lists", [
			index("./routes/lists/index.tsx"),
			// List detail route with its own context
			layout("./routes/lists/list-layout.tsx", [
				route(":id", "./routes/lists/list/index.tsx"),
				route(":id/invites", "./routes/lists/list/invites/index.tsx"),
			]),
		]),

		// Places section
		...prefix("places", [
			layout("./routes/place/layout.tsx", [
				route(":id", "./routes/place/index.tsx"),
			]),
		]),
	]),
] satisfies RouteConfig;
