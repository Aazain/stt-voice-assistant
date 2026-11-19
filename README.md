# Group_27

## Developers
| Name        |   Role |     Github    | Email       |
| ----------- | --------- | --------- | --------------------------- |
| Aazain Rafiq  | Full-Stack Dev | Aazain | arafiq3@myseneca.ca |
| Saurab Kayaith | Full-Stack Dev | skayaith | skayaith@myseneca.ca |
| Erkam Yildirim | Full-Stack Dev | emyildirim | eyildirim1@myseneca.ca |

## Project Description

# AI-Powered Voice Assistant

This AI-powered voice assistant is designed to understand voice commands, retrieve information, and communicate back to the user. It uses advanced technologies such as speech-to-text, natural language processing, and text-to-speech for smooth user interaction.

## Features

### Understand Voice Commands
The AI voice assistant will use speech to text to convert the users voice commands into text

### Retrieve Information
The assistant should be able to get information requested by the user such as the weather, news, etc.

### Communication Back to User
The voice assistant should be able to respond back to users to confirm commands requested by the user. For example, the assistant should be able to respond with information from Wikipedia.

### Example Usage
A user may request the voice assistant to retrieve the weather in a location, by verbally requesting the command ("What's the weather in Toronto?"). The voice assistant will respond with the requested information.

## Tech Stack

### Front-End
- **Electron.js**
- **React.js**
- **Bootstrap**
- **Azure Speech SDK**

### Back-End
- **Python**
- **Django**
- **Google TTS API**
- **spaCy** (for Natural Language Processing)

### Database
- **SQLite**

### Development Tools
- **Postman** (for testing APIs)

## App Setup Guide

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/CAPSTONE-2025/Group_27.git
   cd Group_27
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

   Backend dependencies:
   ```sh
   cd aiVoiceAssist
   pip install djangorestframework django-cors-headers channels channels-redis daphne
   ```

3. ### Running the App
First run the Websocket in a seperate console:
```sh
python manage.py runserver
```

To start the Electron app in development mode, run:
```sh
npm start
```


### License

This project is licensed under the [MIT License](LICENSE).
