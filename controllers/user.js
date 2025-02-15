import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../data.json");

async function saveJsonFile(filePath, data) {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log("JSON 파일 저장");
  } catch {
    console.error("JSON 파일 저장 에러: ", error);
  }
}

const updateActivity = async (prevData, conversationHistories) => {
  for (const message of conversationHistories.messages.reverse()) {
    if (message.text.includes("님이 채널에 참여함")) {
      continue;
    }
    const userID = message.user;

    // 유저의 메시지 카운트
    if (userID in prevData.users) {
      prevData.users[userID].message += 1;
    } else {
      prevData.users[userID] = {
        enteredAt: message.ts,
        message: 1,
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
            message: 0,
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

async function updateUserActivity(app, channelID) {
  const fileData = await readFile(filePath, "utf8");
  const prevData = JSON.parse(fileData);

  const conversations = await app.client.conversations.history({
    channel: channelID,
    oldest: prevData.lastDate,
    inclusive: false,
  });
  const conversationHistories = JSON.parse(JSON.stringify(conversations));
  // console.dir(conversationHistories.messages, { depth: null });

  prevData.users = await updateActivity(prevData, conversationHistories);
  prevData.users = await updateHistory(prevData.users);
  prevData.lastDate = await updateData(prevData.lastDate);

  await saveJsonFile(filePath, data);

  return 0;
}

export { updateUserActivity };
