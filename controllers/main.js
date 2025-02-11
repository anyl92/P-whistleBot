const handleRandomMatching = (replyUsersCount, replyUsers) => {
  replyUsers = [1, 2, 3, 4, 5, 6, 77, 8, 9, 10, 11, 12, 13];
  replyUsersCount = 13;
  // console.log(replyUsers);
  // TODO: 유저 순서 랜덤 처리
  const teamCount = Math.floor(replyUsersCount % 5);
  const result = Array.from(Array(teamCount), () => Array(5));

  let i = 0;
  let j = 0;
  replyUsers.map((user) => {
    if (i === teamCount) {
      i = 0;
      j++;
    }

    result[i][j] = user;
    i++;
  });
  return result.map((team, idx) => {
    return `${idx + 1}조: ${team.join(" ")}`;
  });
};

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
      // console.log(replyUsers, "reply");

      // 조편성
      const teamResult = handleRandomMatching(replyUsersCount, replyUsers);
      await replyMessage(app, channelID, messageTS, teamResult);

      return messageTS;
    }
  }
}

async function replyMessage(app, channelID, messageTS, teamResult) {
  try {
    // TODO: 1조 앞 들여쓰기 들어감, 유저로 멘션하고 피크민아이디 입력해줘야함
    const resultText = `
    조원 편성 결과는 다음과 같습니다
    ${teamResult.join("\n")}
    `;
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
