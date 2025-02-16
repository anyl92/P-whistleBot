import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../data.json");

const MAX_PEOPLE = 5;

const getRandomUsers = (users, max) => {
  for (let i = max; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  return users;
};

const drawLeader = async (team) => {
  const fileData = await readFile(filePath, "utf8");
  const data = JSON.parse(fileData);

  const memberInfo = team.map((member) => {
    const { messages, replies, challengeHistory, pastLeader } = data.users[member];
    const score = messages + replies + challengeHistory;

    return [score, member];
  });

  memberInfo.sort((a, b) => b[0] - a[0]);
  const median = memberInfo[2][0];

  const candidates = [];
  let candidatesCount = 0;
  for (let i = 0; i < MAX_PEOPLE; i++) {
    if (!memberInfo[i]) break;

    if (memberInfo[i][0] >= median) {
      candidates.push(memberInfo[i]);
    } else {
      candidatesCount = i;
      break;
    }
  }

  const randomUsers = getRandomUsers(candidates, candidatesCount - 1);
  const result = candidatesCount > 0 ? randomUsers.concat(memberInfo.slice(candidatesCount)) : randomUsers;
  return result;
};

export const makeTeams = async (replyUsersCount, replyUsers) => {
  const randomReplyUsers = getRandomUsers(replyUsers, replyUsersCount - 1);

  const teamCount = Math.ceil(replyUsersCount / MAX_PEOPLE);
  const teamMembers = Array.from(Array(teamCount), () => Array(MAX_PEOPLE));

  let i = 0;
  let j = 0;
  randomReplyUsers.map((user) => {
    if (i === teamCount) {
      i = 0;
      j++;
    }

    teamMembers[i][j] = user;
    i++;
  });
  const finalTeams = await Promise.all(teamMembers.map((team) => drawLeader(team)));
  return finalTeams;
};
