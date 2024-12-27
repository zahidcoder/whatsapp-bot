const venom = require("venom-bot");
const fs = require("fs");

try {
  const questionnairePath = "./questions-sh.json";
  if (!fs.existsSync(questionnairePath)) {
    console.error("ERROR: questions-sh.json file not found!");
    process.exit(1);
  }
  const questionnaireContent = fs.readFileSync(questionnairePath, "utf8");
  JSON.parse(questionnaireContent);
  console.log("√ Questionnaire file loaded successfully");
} catch (error) {
  console.error("ERROR loading questionnaire file:", error);
  process.exit(1);
}

venom
  .create(
    "my-session",
    undefined,
    (statusSession, session) => {
      console.log("Status Session:", statusSession);
      console.log("Session name:", session);
    },
    {
      session: "my-session",
      headless: false,
      debug: true,
    }
  )
  .then((client) => {
    console.log("Bot initialized successfully");
    let userSessions = {};

    client.onMessage((message) => {
      console.log("\n--- New Message Received ---");
      console.log("From:", message.from);
      console.log("Message:", message.body);

      if (message.isGroupMsg || message.fromMe) {
        console.log("Ignoring group/self message");
        return;
      }

      if (message.body.toLowerCase() === "start") {
        console.log("Start command received");
        try {
          const questionnaire = require("./questions-sh.json");
          userSessions[message.from] = {
            index: 0,
            questionnaire: questionnaire,
            lastMessageTime: Date.now(),
          };
          sendQuestionnaire(client, message.from).catch((err) =>
            console.error("Error sending question:", err)
          );
        } catch (error) {
          console.error("Error starting questionnaire:", error);
          client.sendText(
            message.from,
            "Sorry, there was an error starting the questionnaire."
          );
        }
      } else if (userSessions[message.from]) {
        handleUserResponse(client, message).catch((err) =>
          console.error("Error handling response:", err)
        );
      }
    });

    async function sendQuestionnaire(client, userId) {
      console.log("Sending questionnaire to:", userId);
      const userSession = userSessions[userId];

      if (!userSession) {
        console.error("No session found for user:", userId);
        return;
      }

      const question = userSession.questionnaire.items[userSession.index];
      let message = `Question ${userSession.index + 1}/${
        userSession.questionnaire.items.length
      }\n\n`;
      message += `${question.title}\n\n`;

      if (question.questionItem.question.choiceQuestion) {
        const isCheckbox =
          question.questionItem.question.choiceQuestion.type === "CHECKBOX";
        question.questionItem.question.choiceQuestion.options.forEach(
          (option, idx) => {
            message += `${idx + 1}. ${option.value}\n`;
          }
        );
        message += isCheckbox
          ? "\nPlease enter numbers separated by commas to select multiple options (e.g., 1,3,4)"
          : "\nPlease select a number to answer.";
      } else if (question.questionItem.question.scaleQuestion) {
        const scale = question.questionItem.question.scaleQuestion;
        message += `Scale from ${scale.low} (${scale.lowLabel}) to ${scale.high} (${scale.highLabel})\n`;
        message += `Please enter a number between ${scale.low} and ${scale.high}.`;
      } else if (question.questionItem.question.textQuestion) {
        message += "Please type your answer as text.";
      }

      console.log("Sending message:", message);
      await client.sendText(userId, message);
    }

    async function handleUserResponse(client, message) {
      console.log("Handling response from:", message.from);
      const userSession = userSessions[message.from];
      const question = userSession.questionnaire.items[userSession.index];

      try {
        let isValidResponse = false;
        let answer = message.body;

        if (question.questionItem.question.choiceQuestion) {
          const isCheckbox =
            question.questionItem.question.choiceQuestion.type === "CHECKBOX";
          const optionsLength =
            question.questionItem.question.choiceQuestion.options.length;

          if (isCheckbox) {
            const selections = message.body.split(",").map((num) => num.trim());
            const validNumbers = selections.every((num) => {
              const n = parseInt(num);
              return !isNaN(n) && n >= 1 && n <= optionsLength;
            });

            if (validNumbers) {
              answer = selections.map((num) => {
                const index = parseInt(num) - 1;
                return question.questionItem.question.choiceQuestion.options[
                  index
                ].value;
              });
              isValidResponse = true;
            } else {
              await client.sendText(
                message.from,
                `Please enter valid numbers between 1 and ${optionsLength}, separated by commas.`
              );
            }
          } else {
            if (message.body.match(/^[1-9]$/)) {
              const selectedNumber = parseInt(message.body);
              if (selectedNumber <= optionsLength) {
                answer =
                  question.questionItem.question.choiceQuestion.options[
                    selectedNumber - 1
                  ].value;
                isValidResponse = true;
              } else {
                await client.sendText(
                  message.from,
                  `Please select a number between 1 and ${optionsLength}`
                );
              }
            } else {
              await client.sendText(
                message.from,
                "Please enter a valid number choice."
              );
            }
          }
        } else if (question.questionItem.question.scaleQuestion) {
          const scale = question.questionItem.question.scaleQuestion;
          const number = parseInt(message.body);

          if (!isNaN(number) && number >= scale.low && number <= scale.high) {
            isValidResponse = true;
          } else {
            await client.sendText(
              message.from,
              `Please enter a number between ${scale.low} and ${scale.high}.`
            );
          }
        } else if (question.questionItem.question.textQuestion) {
          isValidResponse = true;
        }

        if (isValidResponse) {
          saveAnswer({
            questionID: question.questionID,
            title: question.title,
            userAnswer: answer,
            timestamp: new Date().toISOString(),
          });

          userSession.index += 1;

          if (userSession.index < userSession.questionnaire.items.length) {
            await sendQuestionnaire(client, message.from);
          } else {
            await client.sendText(
              message.from,
              "Thank you for completing the questionnaire!"
            );
            delete userSessions[message.from];
          }
        }
      } catch (error) {
        console.error("Error handling response:", error);
        await client.sendText(
          message.from,
          "Sorry, there was an error processing your response. Please try again."
        );
      }
    }

    function saveAnswer(answer) {
      const answersFile = "answers.json";
      try {
        let answers = [];
        if (fs.existsSync(answersFile)) {
          answers = JSON.parse(fs.readFileSync(answersFile));
        }
        answers.push(answer);
        fs.writeFileSync(answersFile, JSON.stringify(answers, null, 2));
        console.log("Answer saved successfully:", answer);
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    }
  })
  .catch((error) => {
    console.error("Error creating bot:", error);
  });
