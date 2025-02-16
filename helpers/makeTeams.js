import { MAX_PEOPLE } from "../shared/constants.js";
import { readJSONFile } from "./handleFile.js";

const getRandomUsers = (users, max) => {
  for (let i = max; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  return users;
};

const drawLeader = async (team, type) => {
  const data = await readJSONFile();

  const memberInfo = team.map((member) => {
    const { messages, replies, reactions, flowerChallengeHistory, walkChallengeHistory } = data.users[member];
    const challengeHistory = type === "flower" ? flowerChallengeHistory : walkChallengeHistory;

    const score = messages + replies + reactions + challengeHistory;
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

export const makeTeams = async (replyUsersCount, replyUsers, type) => {
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
  const finalTeams = await Promise.all(teamMembers.map((team) => drawLeader(team, type)));
  return finalTeams;
};
