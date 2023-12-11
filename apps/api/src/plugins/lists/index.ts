import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

// Routes
import getListRoute from "./get/list";
import getListsRoute from "./get";
import postListsPlace from "./post/place";
import postListRoute from "./post";
import putListRoute from "./put";
import deleteListRoute from "./delete";
import getListInvitesRoute from "./get/list/invites";

const listsPlugin: FastifyPluginAsync = async (server) => {
  deleteListRoute(server);
  getListRoute(server);
  getListInvitesRoute(server);
  getListsRoute(server);
  postListRoute(server);
  postListsPlace(server);
  putListRoute(server);
};

export default fastifyPlugin(listsPlugin);
