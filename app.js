import pkg from "@slack/bolt";
import dotenv from "dotenv";
const { App } = pkg;
dotenv.config();

import { findChannelId, findMessageInfo } from "./controllers/main.js";

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

  const CHANNER_NAME = "새-워크스페이스-전체";
  const CHANNER_ID = await findChannelId(app, CHANNER_NAME);

  const WALK_TEXT =
    "리마인더: :pikmin_happy:월요일부터 시작되는 100,000보 걷기 챌린지 참여하실 분께선 스레드 댓글로 남겨주세요. 랜덤 매칭한 결과는 월요일 아침에 발표됩니다.:pikmin_run:";
  await findMessageInfo(app, CHANNER_ID, WALK_TEXT);

  const FLOWER_TEXT =
    "리마인더 “:pikmin_gogo:월요일부터 시작되는 30,000송이 심기 챌린지 참여하실 분께선 스레드 댓글로 남겨주세요. 랜덤 매칭한 결과는 월요일 아침에 발표됩니다.:bouquet:";
  await findMessageInfo(app, CHANNER_ID, FLOWER_TEXT);

  console.log("5초 후 프로그램 종료...");
  setTimeout(() => {
    process.exit(0);
  }, 5000);
})();
