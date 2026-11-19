require('dotenv').config();
const fs = require('fs');
const mic = require('mic');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const wav = require('wav');  
const { fetchWeatherData, fetchNewsData, fetchWikiExtract } = require('./apiService/apiService')
const { shell } = require('electron')
const { SpeechSynthesizer } = sdk;
const { Porcupine, BuiltinKeyword }= require("@picovoice/porcupine-node");

const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("startBtn");
    const sendButton = document.getElementById("sendMessage");
    const inputBox = document.getElementById("inputmsg");
    const chatContainer = document.getElementById("chat-container");
    // Handle voice input submission
    if (button) {
        button.addEventListener("click", () => {
            chatContainer.innerHTML = '';
            recordAudio();
        });
    }

    // Handle text input submission
    if (sendButton && inputBox) {
        sendButton.addEventListener("click", () => {
            const text = inputBox.value.trim();
            if (text.length > 0) {
                text_query(text);
                inputBox.value = '';
            }
        });
        inputBox.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendButton.click();
            }
        });
    }
});


const wake_word = async () =>{
  try {
    let porcupine = new Porcupine( process.env.ACCESS_KEY, ["./wake_word/Hey-Jesse_en_mac_v3_0_0.ppn"], [0.5]);

    const micInstance = mic({
      rate: porcupine.sampleRate,
      channels: '1'
    });

    const micInputStream = micInstance.getAudioStream();

    micInputStream.on('data', (data) => {
      const audioSamples = new Int16Array(data.buffer);

      for (let i = 0; i + porcupine.frameLength <= audioSamples.length; i += porcupine.frameLength) {
        const result = porcupine.process(audioSamples.subarray(i, i + porcupine.frameLength));

        if (result !== -1) {
          console.log('wake detected');
          const chatContainer = document.getElementById("chat-container");
          chatContainer.innerHTML = '';
          recordAudio(); 
        }
      }
    });

    micInstance.start();

    console.log('listening for wake word...');
  } catch (error) {
    console.error(error);
  };
}

wake_word()

// Path to save the recorded audio
const outputFilePath = './output.wav';

function recordAudio() {
    const queryBubble = window.addChatBubble('...', 'user');
    // Set up mic input stream and configure the mic settings
    const micInstance = mic({
        rate: '11000',  // Set audio rate (audioSamples per second)
        channels: '1',  // Mono channel
        bitwidth: '16', // Audio bit depth
        format: 'pcm'   // Raw PCM data (to later wrap in WAV)
    });

    const micInputStream = micInstance.getAudioStream();

    const fileStream = fs.createWriteStream(outputFilePath);
    const wavWriter = new wav.Writer({
        channels: 1,  // Mono
        sampleRate: 10000,  // Sample rate (16kHz)
        bitDepth: 16,  // Bit depth
    });
    micInputStream.pipe(wavWriter).pipe(fileStream);

    micInstance.start();
    console.log('Recording Started');

    setTimeout(() => {
        micInstance.stop();
        console.log('Recording saved to', outputFilePath);
        fromFile(queryBubble);
    }, 5000); 
}

function fromFile(queryBubble) {

    const audioFileBuffer = fs.readFileSync(outputFilePath);
    let audioConfig = sdk.AudioConfig.fromWavFileInput(audioFileBuffer);
    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    speechRecognizer.recognizeOnceAsync(result => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${result.text}`);
            queryBubble.innerHTML = result.text;
            process_file(result.text)
        } else {
            console.log(`ERROR: ${result.errorDetails}`);
            const errorMessage = "Sorry, I didn't catch that. Please try again.";
            window.addChatBubble(errorMessage);
            text_to_speech(errorMessage);
        }
        speechRecognizer.close();
    });
}

const process_file = async (transcription) => {

    const responseBubble = window.addChatBubble("...");
    
    let historyEntry = {
        query: transcription,
        api: 'none',
        classification: 'unknown',
        response: null,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch("http://127.0.0.1:8000/process-voice/",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ transcription })
        });

        const data = await response.json();
        console.log("Categorized Data Returned From Backend: ", data)
        
        // Update history entry with classification data
        historyEntry.classification = data.classification;
        historyEntry.api = data.api;
        
        
        if (data.api == 'none'){
            const noApiMessage = "Sorry, I didn't understand that command.";
            historyEntry.response = noApiMessage;
            if (responseBubble) responseBubble.innerHTML = noApiMessage;
            text_to_speech(noApiMessage);
        }
        else if (data.api == 'weather'){
            // Get preferences
            const prefs = await window.preferences.getAll()
            // Use extracted location or fall back to preference location
            // Filter out time-related words that aren't actual locations
            const timeWords = ['today', 'tomorrow', 'tonight', 'now', 'currently'];
            let locationRequested = prefs.location; // Default to preference
            
            if (data.entities && data.entities.length > 0) {
                const extractedLocation = data.entities[0][0].toLowerCase();
                if (!timeWords.includes(extractedLocation)) {
                    locationRequested = data.entities[0][0];
                }
            }
            console.log(locationRequested)
            const weatherResponse = await fetchWeatherData(locationRequested, prefs.temperatureUnit)
            console.log(weatherResponse)
            const ttsScript = `The current weather in ${weatherResponse.location || "the area"} is ${weatherResponse.condition || "unknown"}, with a temperature of ${weatherResponse.temperature || "N/A"} degrees ${prefs.temperatureUnit}.`
            text_to_speech(ttsScript)

            // This whole block needs to be refactored

            
            // Store in history
            historyEntry.response = weatherResponse;

            const weatherHtml =  `
            <div class="weather-result">    
                <p>Location: ${weatherResponse.location}</p>
                <p>Temperature: ${weatherResponse.temperature}${weatherResponse.temperatureUnit}</p>
                <p>Condition: ${weatherResponse.condition}</p>
                <p>Windspeed: ${weatherResponse.windspeed}</p>
            </div>
            `;

            if (responseBubble) responseBubble.innerHTML = weatherHtml;
        }
        else if(data.api == 'news'){
            const values = data.entities.map(([text, label]) => text)
            console.log(values)
            const newsData = await fetchNewsData(values)
            console.log("News Data Returned: ", newsData)
            const ttsScript = `Here is the most recent news related to ${values[0]}`
            text_to_speech(ttsScript)
            
            // Store in history
            historyEntry.response = newsData.map(item => ({
                title: item.title,
                url: item.url
            }));


            let newsHtml = '';
            newsData.forEach(result => {
                newsHtml += `<a href="${result.url}" target="_blank" class="news-link">${result.title}</a>`;
            });

            if (responseBubble) {
                responseBubble.innerHTML = newsHtml || "No news articles found.";
                const links = responseBubble.querySelectorAll('.news-link');
                links.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        shell.openExternal(link.href);
                    });
                });
            } 
        }
        else if(data.api == 'wiki'){
            const values = data.entities.map(([text, label]) => text);
            let result = '';

            values.forEach(entities => result += entities + " ");
            console.log(result)
            const response = await fetchWikiExtract(result);
            console.log(response);
            text_to_speech(response.extract)
            
            // Store in history
            historyEntry.response = { extract: response.extract };

            if (responseBubble) responseBubble.innerHTML = response.extract;

        }
        else{ //temporary to change to original response
            const noImplMessage = "Sorry, I'm unable to complete that request.";
            historyEntry.response = noImplMessage;
            if (responseBubble) responseBubble.innerHTML = noImplMessage;
            text_to_speech(noImplMessage);
        }
        
        // Save to history
        if (window.queryHistory && window.queryHistory.add) {
            await window.queryHistory.add(historyEntry);
        }
    } catch (error){
        console.log(error)
        errorMessage = "Sorry, something went wrong. Please try again."
        if (responseBubble) responseBubble.innerHTML = errorMessage;
        text_to_speech(errorMessage);
        historyEntry.response = { error: error.message };
        
        // Save error to history as well
        if (window.queryHistory && window.queryHistory.add) {
            await window.queryHistory.add(historyEntry);
        }
    } 
}
// Function to handle text queries
const text_query = async (query) => {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = '';
    window.addChatBubble(query, "user");
    await process_file(query);
}

const text_to_speech = (inputText) => {
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    speechSynthesizer.speakTextAsync(
        inputText,
        result => {
            if (result) {
                speechSynthesizer.close();
                return result.audioData;
            }
        },
        error => {
            console.log(error);
            speechSynthesizer.close();
        });
}
// Function to repeat a query from history
window.repeatQuery = async function(query) {
    console.log('Repeating query:', query);
    // Process the query directly
    await text_query(query);
}
