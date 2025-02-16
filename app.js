import pkg from "@slack/bolt";
import dotenv from "dotenv";
const { App } = pkg;
dotenv.config();

import { findChannelId, findMessageInfo } from "./controllers/main.js";
import { updateUserActivity } from "./controllers/user.js";
import { CHANNER_NAME, FLOWER_TEXT, WALK_TEXT } from "./shared/constants.js";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: 3000,
});

(async () => {
  await app.start(process.env.PORT || 3000);
  app.logger.info("⚡️ Bolt app is running!");

  const CHANNER_ID = await findChannelId(app, CHANNER_NAME);

  await updateUserActivity(app, CHANNER_ID);

  await findMessageInfo(app, CHANNER_ID, WALK_TEXT);
  await findMessageInfo(app, CHANNER_ID, FLOWER_TEXT);

  app.logger.info("5초 후 프로그램 종료...");
  setTimeout(() => {
    process.exit(0);
  }, 5000);
})();
