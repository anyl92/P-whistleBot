import { readJSONFile, saveJSONFile } from "../helpers/handleFile.js";

const updateActivity = async (prevData, conversationHistories) => {
  for (const message of conversationHistories.messages.reverse()) {
    if (message.text.includes("님이 채널에 참여함")) {
      continue;
    }
    const userID = message.user;

    // 유저의 메시지 카운트
    if (userID in prevData.users) {
      prevData.users[userID].messages += 1;
    } else {
      prevData.users[userID] = {
        enteredAt: message.ts,
        messages: 1,
        replies: 0,
        challengeHistory: 0,
        pastLeader: false,
      };
    }

    // 유저의 리플 카운트
    if (message.reply_users_count > 0) {
      message.reply_users.forEach((user) => {
        if (user === userID) return;
        if (user in prevData.users) {
          prevData.users[user].replies += 1;
        } else {
          prevData.users[user] = {
            enteredAt: message.ts,
            messages: 0,
            replies: 1,
            challengeHistory: 0,
            pastLeader: false,
          };
        }
      });
    }
  }
  return prevData.users;
};

const updateHistory = async (users) => {
  // 제일 과거의 참여이력을 빼주는 작업
  for (const user in users) {
    if (users[user]["challengeHistory"] > 0) {
      users[user]["challengeHistory"] -= 1;
    }
  }
  return users;
};

const updateData = async (lastDate) => {
  // 시간 업데이트
  const currentTS = Date.now() / 1000;
  lastDate = currentTS;
  return lastDate;
};

const updateUserActivity = async (app, channelID) => {
  const prevData = await readJSONFile();

  const conversations = await app.client.conversations.history({
    channel: channelID,
    oldest: prevData.lastDate,
    inclusive: false,
    limit: 999,
  });
  const conversationHistories = JSON.parse(JSON.stringify(conversations));
  // console.dir(conversationHistories.messages, { depth: null });

  prevData.users = await updateActivity(prevData, conversationHistories);
  prevData.users = await updateHistory(prevData.users);
  prevData.lastDate = await updateData(prevData.lastDate);

  await saveJSONFile(prevData);

  return 0;
};

const updateParticipant = async (replyUsers, leaders) => {
  const data = await readJSONFile();

  // TODO: 챌린지별 데이터 구분하고 기록
  replyUsers.forEach((user) => {
    data.users[user].challengeHistory += 1;
    if (leaders.includes(user)) {
      data.users[user].pastLeader = true;
    }
  });
  await saveJSONFile(data);
};

export { updateUserActivity, updateParticipant };
