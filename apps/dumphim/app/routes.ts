import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/create-card.tsx"),
	route("/voter", "routes/voter.tsx"),
	route("/card-ratings", "routes/card-ratings.tsx"),
	route("/trackers", "routes/all-trackers.tsx"),
	route("/profile", "routes/profile.tsx"), // Add the new profile route
] satisfies RouteConfig;
