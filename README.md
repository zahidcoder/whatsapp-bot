# Questionnaire Bot

This project is a chatbot implemented using `venom-bot` to send and manage surveys via WhatsApp. Users can initiate the survey, respond to questions, and their answers will be stored for further analysis.

## Prerequisites

1. **Node.js**: Install the latest version of Node.js from [Node.js Official Website](https://nodejs.org/).
2. **Venom-Bot**: This project uses the `venom-bot` library for WhatsApp automation.
3. **File System**: The project requires a JSON file named `questions-sh.json` containing the survey questions in a specific format.

## Installation

1. Clone this repository:
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Ensure that a `questions-sh.json` file is present in the project directory. This file should contain the survey questions. See the format below for reference.

## `questions-sh.json` Format

The `questions-sh.json` file defines the survey questions. Below is an example format you should use (do not use these exact questions; create your own):

```json
{
  "info": {
    "title": "Fitness Goals Survey",
    "description": "A short survey to understand your fitness goals and preferences."
  },
  "items": [
    {
      "questionID": "q1",
      "title": "How often do you exercise in a week?",
      "defaultAnswer": "1-2 times",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "RADIO",
            "options": [
              { "value": "1-2 times" },
              { "value": "3-5 times" },
              { "value": "More than 5 times" },
              { "value": "Never" }
            ]
          }
        }
      }
    },
    {
      "questionID": "q2",
      "title": "What type of exercises do you prefer?",
      "questionItem": {
        "question": {
          "required": true,
          "choiceQuestion": {
            "type": "CHECKBOX",
            "options": [
              { "value": "Cardio" },
              { "value": "Strength Training" },
              { "value": "Yoga" },
              { "value": "Other" }
            ]
          }
        }
      }
    }
  ]
}
```

### Notes:
- Replace the sample questions with your actual survey questions.
- Ensure the JSON format is valid.

## Running the Bot

1. Start the bot:
   ```bash
   node <script_name>.js
   ```

2. When the bot runs, it will check for the presence of `questions-sh.json`. If the file is missing or invalid, the bot will throw an error and stop execution.

3. Once the bot is running, users can interact with it by sending messages like `start` to initiate the survey.

## Usage Instructions

- **Initiate Survey**: Users can type `start` to begin the survey.
- **Answering Questions**: The bot will prompt questions one by one based on the `questions-sh.json` file.
- **Completing Survey**: Upon answering all questions, the bot will thank the user, and their responses will be saved in `answers.json`.

## Saving Answers

User responses are saved in an `answers.json` file in the following format:

```json
[
  {
    "questionID": "q1",
    "title": "How often do you exercise in a week?",
    "userAnswer": "3-5 times",
    "timestamp": "2024-12-27T12:00:00Z"
  }
]
```

## Troubleshooting

- **`questions-sh.json` not found**: Ensure the file exists in the project directory and follows the correct format.
- **Invalid JSON Format**: Use a JSON validator to check your `questions-sh.json` file.
- **Session Issues**: If the bot fails to initialize, delete the session folder and restart.

## Contributing

Contributions are welcome! Please ensure your code follows the project's coding standards and includes proper documentation.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

