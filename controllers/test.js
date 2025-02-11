// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

app.action("button_click", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

// This will match any message that contains 👋
app.message("hi?", async ({ message, say }) => {
  // Handle only newly posted messages here
  if (
    message.subtype === undefined ||
    message.subtype === "bot_message" ||
    message.subtype === "file_share" ||
    message.subtype === "thread_broadcast"
  ) {
    await say(`Hello, <@${message.user}>`);
  }
});
