import { router } from "./context";
import {
	invitesRouter,
	itemsRouter,
	listsRouter,
	placesRouter,
	userRouter,
} from "./routers";

// Main router
export const appRouter = router({
	lists: listsRouter,
	places: placesRouter,
	items: itemsRouter,
	invites: invitesRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
