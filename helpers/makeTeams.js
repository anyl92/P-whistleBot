const getRandomUsers = (users, max) => {
  for (let i = max; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }
  return users;
};

export const makeTeams = (replyUsersCount, replyUsers) => {
  const MAX_PEOPLE = 5;
  const randomReplyUsers = getRandomUsers(replyUsers, replyUsersCount - 1);

  const teamCount = Math.ceil(replyUsersCount / MAX_PEOPLE);
  const result = Array.from(Array(teamCount), () => Array(MAX_PEOPLE));

  let i = 0;
  let j = 0;
  randomReplyUsers.map((user) => {
    if (i === teamCount) {
      i = 0;
      j++;
    }

    result[i][j] = `<@${user}>`;
    i++;
  });

  return result.map((team, idx) => {
    return `${idx + 1}조: ${team.join(" ")}`;
  });
};
