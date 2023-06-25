import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const { COOKIE_NAME, COOKIE_SECRET, COOKIE_SALT, NODE_ENV } = process.env;

const sessionPlugin: FastifyPluginAsync = async (server) => {
  server.register(require("@fastify/secure-session"), {
    cookieName: COOKIE_NAME, // the name of the session cookie, defaults to 'session'
    secret: COOKIE_SECRET,
    salt: COOKIE_SALT,
    // options for setCookie, see https://github.com/fastify/fastify-cookie
    cookie: {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: NODE_ENV !== "development",
    },
  });
};

export default fp(sessionPlugin);
