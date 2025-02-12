import { makeTeams } from "../helpers/makeTeams.js";

async function findChannelId(app, name) {
  const conversationsList = await app.client.conversations.list({
    token: process.env.SLACK_BOT_TOKEN,
  });

  let channelID;
  for (const channel of conversationsList.channels) {
    if (channel.name === name) {
      channelID = channel.id;
      break;
    }
  }
  return channelID;
}

async function findMessageInfo(app, channelID, text) {
  // 봇이 동작할 시점에서 24시간 이내의 메시지만 조회
  const oneDayAgoTS = (Date.now() - 24 * 60 * 60 * 1000) / 1000;
  const result = await app.client.conversations.history({
    channel: channelID,
    oldest: oneDayAgoTS,
  });
  const conversationHistories = JSON.parse(JSON.stringify(result));
  // console.dir(conversationHistories.messages, { depth: null });

  for (const message of conversationHistories.messages) {
    if (message.text.includes(text)) {
      const messageTS = message.ts;
      const replyUsersCount = message.reply_users_count;
      const replyUsers = message.reply_users;

      // 조편성
      const teamResult = makeTeams(replyUsersCount, replyUsers);

      const type = message.text.includes("송이 심기") ? "flower" : "work";
      await replyMessage(app, channelID, messageTS, teamResult, type);

      return messageTS;
    }
  }
}

async function replyMessage(app, channelID, messageTS, teamResult, type) {
  try {
    // TODO: 피크민아이디 입력해줘야함
    const customText = type === "flower" ? "30,000송이 심기" : "100,000보 걷기";
    const resultText = `즐거운 월요일 아침이에요! 이번 주 ${customText} 챌린지 조 편성 결과입니다:relaxed: \n${teamResult.join("\n")}`;
    console.log(resultText);

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelID,
      thread_ts: messageTS,
      text: resultText,
    });
    console.log("조원 편성 결과 스레드가 작성되었습니다.");
  } catch (error) {
    console.error(error);
  }
}

export { findChannelId, findMessageInfo };
