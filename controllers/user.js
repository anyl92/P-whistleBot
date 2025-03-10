import { readJSONFile, saveJSONFile } from "../helpers/handleFile.js";

const updateActivities = async (prevData, conversationHistories) => {
  for (const message of conversationHistories.messages.reverse()) {
    if (message.text.includes("님이 채널에 참여함")) {
      // 채널 참여 텍스트는 전체가 전송되지 않아 정확하지 않음
      continue;
    }
    const userID = message.user;

    // 유저 메시지 카운트
    if (userID in prevData.users) {
      prevData.users[userID].messages += 1;
    } else {
      prevData.users[userID] = {
        enteredAt: message.ts,
        messages: 1,
        replies: 0,
        reactions: 0,
        walkChallengeHistory: 0,
        flowerChallengeHistory: 0,
        prevLeader: 0,
      };
    }
    // 유저 리플 카운트
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
            reactions: 0,
            walkChallengeHistory: 0,
            flowerChallengeHistory: 0,
            prevLeader: 0,
          };
        }
      });
    }
    // 유저 리액션 카운트
    if (message.reactions) {
      message.reactions.forEach((reaction) => {
        reaction.users.forEach((user) => {
          if (user === userID) return;
          if (user in prevData.users) {
            prevData.users[user].reactions += 1;
          } else {
            prevData.users[user] = {
              enteredAt: message.ts,
              messages: 0,
              replies: 0,
              reactions: 1,
              walkChallengeHistory: 0,
              flowerChallengeHistory: 0,
              prevLeader: 0,
            };
          }
        });
      });
    }
  }
  return prevData.users;
};

const updateHistory = async (users) => {
  // 과거 참여이력 빼기: 챌린지 시작 전 수행
  for (const user in users) {
    if (users[user]["flowerChallengeHistory"] > 100) {
      users[user]["flowerChallengeHistory"] -= 100;
    }

    if (users[user]["walkChallengeHistory"] > 100) {
      users[user]["walkChallengeHistory"] -= 100;
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

const updateUserData = async (app, channelID) => {
  const prevData = await readJSONFile();
  const conversationList = await app.client.conversations.history({
    channel: channelID,
    oldest: prevData.lastDate,
    inclusive: true,
    limit: 999,
  });
  const conversationHistories = JSON.parse(JSON.stringify(conversationList));
  // console.dir(conversationHistories.messages, { depth: null });

  prevData.users = await updateActivities(prevData, conversationHistories);
  prevData.users = await updateHistory(prevData.users);
  prevData.lastDate = await updateData(prevData.lastDate);

  await saveJSONFile(prevData);
};

const updateParticipant = async (replyUsers, type, leaders) => {
  // 이번 참여, 리더 이력 더하기
  const data = await readJSONFile();
  if (type === "flower") {
    replyUsers.forEach((user) => {
      data.users[user].flowerChallengeHistory += 100;
      if (leaders.includes(user)) {
        data.users[user].prevLeader = 1;
      }
    });
  } else {
    replyUsers.forEach((user) => {
      data.users[user].walkChallengeHistory += 100;
      if (leaders.includes(user)) {
        data.users[user].prevLeader = 1;
      }
    });
  }
  await saveJSONFile(data);
};

const removeLeadersData = async (leaders) => {
  // 과거 리더 이력 빼기: 두 챌린지 모두 끝난 후 수행
  const data = await readJSONFile();

  for (let user of Object.keys(data.users)) {
    if (leaders.includes(user)) {
      continue;
    }
    data.users[user].prevLeader = 0;
  }
  await saveJSONFile(data);
};

export { updateUserData, updateParticipant, removeLeadersData };
