import { makeTeams } from "../helpers/makeTeams.js";
import { updateParticipant } from "./user.js";

async function findChannelId(app, name) {
  const conversationsList = await app.client.conversations.list({
    token: process.env.SLACK_BOT_TOKEN,
    limit: 500,
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
      const type = message.text.includes("송이 심기") ? "flower" : "walk";

      // 조 편성
      const finalTeams = await makeTeams(replyUsersCount, replyUsers, type);

      const leaders = [];
      const resultText = finalTeams.map((team, idx) => {
        const teamText = team.map((member, idx) => {
          if (idx === 0) {
            leaders.push(member[1]);
            return `<*조장* <@${member[1]}>>`;
          }
          return `, <@${member[1]}>`;
        });

        return `${idx + 1}조: ${teamText.join("")}`;
      });

      await replyMessage(app, channelID, messageTS, resultText, type);
      await updateParticipant(replyUsers, type);

      return messageTS;
    }
  }
}

async function replyMessage(app, channelID, messageTS, teamResult, type) {
  try {
    const customText = type === "flower" ? "30,000송이 심기" : "100,000보 걷기";
    const resultText = `즐거운 월요일 아침이에요! 이번 주 ${customText} 챌린지 조 편성 결과입니다 :kissing_closed_eyes:\n\n\n${teamResult.join(
      "\n\n"
    )}\n\n\n각 조의 첫 번째에 멘션 된 분들은 조장에 당첨되셨습니다! 조원분들을 초대해주시면 감사하겠습니다.\n혹시 친구 추가가 되어 있지 않은 분들은 $NNN피크민아이디 라고 입력하면 친구코드를 확인하실 수 있답니다 :>\n`;
    console.log(resultText);
    // const result = await app.client.chat.postMessage({
    //   token: process.env.SLACK_BOT_TOKEN,
    //   channel: channelID,
    //   thread_ts: messageTS,
    //   text: resultText,
    // });
    // app.logger.info(`${type} 조원 편성 결과 스레드가 작성되었습니다.`);
  } catch (error) {
    console.error(error);
  }
}

export { findChannelId, findMessageInfo };
