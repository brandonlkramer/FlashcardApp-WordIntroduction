document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
        apiKey: "AIzaSyA9FVkm0z8nbmDCiND1xlKpOXeEObwBCJY",
        authDomain: "vocab-review-app.firebaseapp.com",
        projectId: "vocab-review-app",
        storageBucket: "vocab-review-app.firebasestorage.app",
        messagingSenderId: "66602586657",
        appId: "1:66602586657:web:f0097f216ddfb7464f0960",
        measurementId: "G-F7F23VKHC8"
    };

    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();
    console.log("Firebase and Firestore initialized:", db);

    // Global Variables
    let participantNumber = null;

    // DOM Elements
    const participantNumberScreen = document.getElementById("participant-number-screen");
    const explainerScreen = document.getElementById("explainer-screen");
    const welcomeScreen = document.getElementById("welcome-screen");
    const participantInput = document.getElementById("participant-number");
    const submitParticipantButton = document.getElementById("submit-participant-number");
    const understandButton = document.getElementById("understand-button");

    // Check if participant number is in the URL
    const participantFromURL = new URLSearchParams(window.location.search).get("participant");
    if (participantFromURL) {
        participantNumber = participantFromURL; // Assign globally
        console.log("Participant number from URL:", participantNumber);
        switchToScreen(explainerScreen); // Skip to explainer screen
    } else {
        switchToScreen(participantNumberScreen); // Show participant number screen
    }

    // Event Listener for Participant Number Submission
    submitParticipantButton.addEventListener("click", () => {
        const input = participantInput.value.trim();
        if (!input) {
            alert("Please enter a valid participant number.");
            return;
        }

        participantNumber = input; // Assign globally
        console.log("Participant number entered manually:", participantNumber);
        switchToScreen(explainerScreen); // Navigate to explainer screen
    });

    // Event Listener for "I Understand" Button
    understandButton.addEventListener("click", () => {
        console.log("User clicked 'I Understand'");
        switchToScreen(welcomeScreen); // Navigate to study options screen
    });

    // Function to switch between screens
    function switchToScreen(screen) {
        // Hide all screens
        document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
        // Show the specified screen
        screen.classList.remove("hidden");
        screen.classList.add("active");
    }

    


    
    // Variables
    const words = [
        { word: "CAT", partOfSpeech: "Noun (countable) pl. cats", definition: "ねこ", example: "That is a cute <u>cat</u>." },
        { word: "LOVE", partOfSpeech: "Noun (uncountable) -", definition: "愛情", example: "His <u>love</u> was immeasurable." },
        { word: "TABLE", partOfSpeech: "Noun (countable) pl. tables", definition: "テーブル", example: "The keys are on the <u>table</u>." },
        { word: "RUN", partOfSpeech: "Transitive verb runs, running, ran", definition: "走る", example: "I went <u>running</u> this morning." },
        { word: "SIT", partOfSpeech: "Transitive verb sits, sitting, sat", definition: "座る", example: "She is <u>sitting</u> next to the door." },
        { word: "WINDOW", partOfSpeech: "Noun (countable) pl. windows", definition: "窓", example: "The broody emo kid was looking out the <u>window</u> pondering the meaning of life on a dark, cloudy day with a lot of rain outside." }
    ];
    let studyMode = "meaningRecall"; // Default study mode
    let notLearnedWords = [...words];
    let currentWord = null;
    let iterationCount = 0; // Track the number of iterations
    let studyData = []; // Array to store study data
    let learnedWords = []; // Words learned using "Learn New Words"
    let currentLearningIndex = 0; // Index for learning new words
    let currentReviewWord = null; // Current word for review
    let incorrectWords = []; // Words answered incorrectly


    console.log("JavaScript is working!");
    console.log("Words:", words);
    console.log("Not Learned Words:", notLearnedWords);

    // DOM Elements
    const studyScreen = document.getElementById("study-screen");
    const answerScreen = document.getElementById("answer-screen");
    const promptDiv = document.getElementById("prompt");
    const answerDiv = document.getElementById("answer");

     // Event Listener for manual participant number submission
    
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "next-word") {
            console.log("Next word button clicked via delegation");
            
            if (!words[currentLearningIndex]) {
                console.error("No more words to learn.");
                return;
            }
            learnedWords.push(words[currentLearningIndex]);
            currentLearningIndex++;
            updateProgress();
            loadLearningWord();
        }
    });      


     document.getElementById("submit-participant-number").addEventListener("click", () => {
        console.log("Participant number button clicked");
    });      
    
    document.getElementById("learn-new-words").addEventListener("click", () => {
        currentLearningIndex = 0;
        switchToScreen(document.getElementById("learning-screen"));
        loadLearningWord();
    });

    document.getElementById("review-words").addEventListener("click", () => {
        console.log("Review Words button clicked");
        startStudy("meaningRecall");
    });

    document.getElementById("play-word").addEventListener("click", () => {
        // Ensure a word is currently being displayed
        if (!words[currentLearningIndex]) {
            console.error("No word found to play audio for.");
            return;
        }
    
        const word = words[currentLearningIndex].word; // Get the current word
        const audioPath = `../audio/${word}.mp3`; // Path to the audio file
    
        // Create a new Audio object and play the file
        const audio = new Audio(audioPath);
        audio.play().catch(error => {
            console.error("Error playing audio:", error);
            alert(`Audio file not found for "${word}".`);
        });
    });  

    document.getElementById("review-meanings").addEventListener("click", () => {
        console.log("Review Meanings button clicked");
        startStudy("formRecall");
    });

    document.getElementById("finish").addEventListener("click", () => {
        console.log("Finish button clicked");
        finishStudy();
    });

    document.getElementById("show-answer").addEventListener("click", () => {
        console.log("Show Answer button clicked");
        showAnswer();
    });
  

    document.addEventListener("DOMContentLoaded", () => {
        const nextWordButton = document.getElementById("next-word");
        console.log("Next Word Button:", nextWordButton); // Should log the button element
    });
    

    // Functions// Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgress() {
    const progressElement = document.getElementById("progress");
    progressElement.textContent = `${learnedWords.length} / 48 words learned`;
}

function startReview(mode) {
    incorrectWords = [...learnedWords];
    currentReviewWord = null;
    const reviewHeader = document.getElementById("review-header");
    reviewHeader.textContent = mode === "meaningRecall" ? "What does this word mean?" : "What word matches this meaning?";
    switchToScreen(document.getElementById("review-screen"));
    loadReviewWord(mode);
}

function loadLearningWord() {
    if (currentLearningIndex >= words.length || learnedWords.length >= 48) {
        alert("You have finished learning all new words.");
        updateProgress();
        switchToScreen(document.getElementById("study-option-screen"));
        return;
    }

    const word = words[currentLearningIndex];
    if (!word) {
        console.error("Word not found for index:", currentLearningIndex);
        return;
    }

    document.getElementById("word-line").innerHTML = `
    <span class="word">${word.word}</span> 
    <span class="part-of-speech">[${word.partOfSpeech}]</span>
`;
    document.getElementById("definition-line").textContent = word.definition;
    document.getElementById("example-line").innerHTML = `<strong>Example:</strong> ${word.example}`;
}


function generateChoices(mode) {
    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";
    choicesContainer.classList.remove("hidden");

    const correctAnswer = mode === "meaningRecall" ? currentReviewWord.definition : currentReviewWord.word;

    // Ensure enough learned words for choices
    if (learnedWords.length < 6) {
        console.error("Not enough learned words to generate choices.");
        return;
    }

    const allChoices = shuffle([
        correctAnswer,
        ...learnedWords
            .filter(word => word !== currentReviewWord)
            .map(word => (mode === "meaningRecall" ? word.definition : word.word))
            .slice(0, 5)
    ]);

    allChoices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => handleAnswer(choice, correctAnswer));
        choicesContainer.appendChild(button);
    });
}


function handleAnswer(selected, correct) {
    if (selected === correct) {
        alert("Correct!");
    } else {
        alert(`Incorrect. The correct answer is: ${correct}`);
        incorrectWords.push(currentReviewWord);
    }
    loadReviewWord(studyMode);
}

function checkFinishButton() {
    if (learnedWords.length >= 48) {
        const finishButton = document.getElementById("finish");
        finishButton.classList.remove("hidden");
        finishButton.addEventListener("click", () => {
            alert("Congratulations! You have finished studying.");
            // Additional logic to save or finalize progress
        });
    }
}

function loadReviewWord(mode) {
    if (incorrectWords.length === 0) {
        alert("Review complete!");
        switchToScreen(document.getElementById("study-option-screen"));
        return;
    }

    currentReviewWord = incorrectWords.shift();
    const prompt = document.getElementById("prompt");
    prompt.textContent = mode === "meaningRecall" ? currentReviewWord.word : currentReviewWord.definition;

    generateChoices(mode);
}

  function loadNextWord() {
    if (notLearnedWords.length === 0) {
      alert("All words reviewed!");
      console.log("Saving data to server:", studyData);
      saveDataToServer(studyData);
  
      // Reset screens
      answerScreen.classList.remove("active");
      answerScreen.classList.add("hidden");
      studyScreen.classList.remove("active");
      studyScreen.classList.add("hidden");
      welcomeScreen.classList.remove("hidden");
      welcomeScreen.classList.add("active");
  
      // Reset data for future study sessions
      notLearnedWords = [...words];
      currentWord = null;
      iterationCount = 0;
      return;
    }
  
    iterationCount++;
    console.log("Current Iteration Count:", iterationCount);
  
    // Load the next word
    currentWord = notLearnedWords.shift();
    console.log("Loaded next word:", currentWord);
  
    // Capture the current timestamp in JST for when the word is shown
    const now = new Date();
    const options = { timeZone: "Asia/Tokyo", hour12: false };
    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      ...options,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-CA", {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const shownDate = dateFormatter.format(now); // e.g., "2025-01-11"
    const shownTime = timeFormatter.format(now); // e.g., "09:30:45"
  
    // Add the shownAt timestamp to the studyData array
    studyData.push({
      participant: participantNumber,
      word: currentWord.word,
      definition: currentWord.definition,
      shownAtDate: shownDate, // When the word was shown
      shownAtTime: shownTime, // Time when shown
      iteration: iterationCount,
      direction: studyMode,
      language: "Japanese", // Language field
    });
  
// Log the current state of studyData
    console.log("Current studyData array (after loadNextWord):", studyData);

    // Update the prompt text dynamically
    if (studyMode === "meaningRecall") {
      promptDiv.textContent = currentWord.word; // Display the word
    } else if (studyMode === "formRecall") {
      promptDiv.textContent = currentWord.definition; // Display the definition
    }
  
    // Show the study screen
    studyScreen.classList.remove("hidden");
    studyScreen.classList.add("active");
    answerScreen.classList.remove("active");
    answerScreen.classList.add("hidden");
  }
  
      
      
    

    function showAnswer() {
        console.log("Showing the answer for:", currentWord);
    
        if (!currentWord) {
            console.error("Error: currentWord is null or undefined.");
            return;
        }
    
        // Set the answer content
        answerDiv.textContent = studyMode === "meaningRecall" ? currentWord.definition : currentWord.word;
      
        // Transition screens
        studyScreen.classList.remove("active");
        studyScreen.classList.add("hidden");
        answerScreen.classList.remove("hidden");
        answerScreen.classList.add("active");
    
    }
    

    function finishStudy() {
        alert("Thank you for studying! You can close this tab now.");

        // Reset screens
        studyScreen.classList.remove("active");
        studyScreen.classList.add("hidden");
        welcomeScreen.classList.remove("hidden");
        welcomeScreen.classList.add("active");
    
        // Reset data
        notLearnedWords = [...words];
        currentWord = null;
    }
    
    function saveDataToServer(data) {
        const db = firebase.firestore();
        data.forEach(entry => {
            db.collection("intro_data")
                .add({
                    participant: entry.participant,
                    word: entry.word,
                    definition: entry.definition,
                    shownAtDate: entry.shownAtDate,
                    shownAtTime: entry.shownAtTime,
                    iteration: entry.iteration,
                    direction: entry.direction,
                    language: "Japanese", // Hardcoded
                    answeredAtDate: entry.answeredAtDate || null,
                    answeredAtTime: entry.answeredAtTime || null,
                    learned: entry.learned || null
                })
                .then(() => {
                    console.log("Data saved to Firebase:", entry);
                })
                .catch((error) => {
                    console.error("Error saving to Firebase:", error);
                });
        });
    }
    
      
    
    
    function markAsKnown(known) {
        const now = new Date();
    
        // Convert to Japan Standard Time (JST)
        const options = { timeZone: "Asia/Tokyo", hour12: false };
        const dateFormatter = new Intl.DateTimeFormat("en-CA", {
            ...options,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        const timeFormatter = new Intl.DateTimeFormat("en-CA", {
            ...options,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    
        const formattedDate = dateFormatter.format(now);
        const formattedTime = timeFormatter.format(now);
    
        // Update the most recent study data entry for the current word
        const latestEntry = studyData.find(
            (entry) => entry.word === currentWord.word && entry.iteration === iterationCount
        );
    
        if (latestEntry) {
            latestEntry.answeredAtDate = formattedDate; // Date when answered
            latestEntry.answeredAtTime = formattedTime; // Time when answered
            latestEntry.learned = known ? "known" : "unknown"; // Known or unknown
        } else {
            console.warn("No matching study data entry found for the current word.");
        }
    
        // If the word is not known, push it back to the list
        if (!known) {
            notLearnedWords.push(currentWord);
        }
    
        setTimeout(() => {
            loadNextWord();
        }, 50); // Adds a 50ms delay
        
    }
    
      
      
});