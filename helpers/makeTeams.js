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
    const { messages, replies, reactions, walkChallengeHistory, flowerChallengeHistory, prevLeader } = data.users[member];
    const challengeHistory = type === "flower" ? flowerChallengeHistory : walkChallengeHistory;

    // 이전 leader는 한 턴 쉬어갈 수 있게 점수 0으로 랜덤매칭에서 빠질 가능성을 높임
    const score = prevLeader ? 0 : messages + replies + reactions + challengeHistory;
    return [score, member];
  });

  memberInfo.sort((a, b) => b[0] - a[0]);

  let memberLength = 0;
  memberInfo.forEach((member) => {
    memberLength++;
  });
  const median = memberLength === 5 ? memberInfo[2][0] : memberLength === 4 ? memberInfo[1][0] : memberInfo[0][0];
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

export const makeTeams = async (replyUsers, type) => {
  // @U07PCU8REG2
  const customTeam = [[0, "U07PCU8REG2"]];
  if (replyUsers.indexOf("U07PCU8REG2") > -1) {
    replyUsers.splice(replyUsers.indexOf("U07PCU8REG2"), 1);

    const threePerson = getRandomUsers(replyUsers, replyUsers.length - 1).slice(0, 3);
    threePerson.forEach((person, idx) => {
      replyUsers.splice(replyUsers.indexOf(person), 1);
      customTeam.push([idx, person]);
    });
  }

  const randomReplyUsers = getRandomUsers(replyUsers, replyUsers.length - 1);
  const teamCount = Math.ceil(replyUsers.length / MAX_PEOPLE);
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
  if (customTeam.length > 1) {
    finalTeams.push(customTeam);
  }
  return finalTeams;
};
