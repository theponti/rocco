import sendgrid, { MailDataRequired } from "@sendgrid/mail";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const {
  SENDGRID_API_KEY,
  SENDGRID_SENDER_EMAIL,
  SENDGRID_SENDER_NAME,
  NODE_ENV,
} = process.env;

const isDev = NODE_ENV === "development";

const emailPlugin: FastifyPluginAsync = async (server) => {
  if (!SENDGRID_API_KEY) {
    console.error(
      "warn",
      "The SENDGRID_API_KEY env var must be set, otherwise the API won't be able to send emails. Using debug mode which logs the email tokens instead."
    );
    process.exit(1);
  }

  // Set SendGrid API key
  sendgrid.setApiKey(SENDGRID_API_KEY);

  // Add a server decorator to send emails
  server.decorate("sendEmailToken", async (email: string, token: string) => {
    const msg: MailDataRequired = {
      to: email,
      from: {
        email: SENDGRID_SENDER_EMAIL || "",
        name: SENDGRID_SENDER_NAME,
      },
      subject: "Login token for the modern backend API",
      text: `The login token for the API is: ${token}`,
    };

    // Log the email token in development to not expend SendGrid email quota
    if (isDev) {
      server.log.info(`email token for ${email}: ${token} `);
    } else {
      await sendgrid.send(msg);
    }
  });
};

export default fp(emailPlugin);
