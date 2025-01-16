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
        { word: "DOG", partOfSpeech: "Noun (countable) pl. dogs", definition: "いぬ", example: "The <u>dog</u> wagged its tail happily." },
        { word: "HAPPY", partOfSpeech: "Adjective -", definition: "幸せな", example: "She felt <u>happy</u> after finishing her work." },
        { word: "HOUSE", partOfSpeech: "Noun (countable) pl. houses", definition: "家", example: "They bought a new <u>house</u> in the countryside." },
        { word: "DRINK", partOfSpeech: "Verb drinks, drinking, drank, drunk", definition: "飲む", example: "I always <u>drink</u> coffee in the morning." },
        { word: "CAR", partOfSpeech: "Noun (countable) pl. cars", definition: "車", example: "The <u>car</u> stopped at the red light." },
        { word: "EAT", partOfSpeech: "Verb eats, eating, ate, eaten", definition: "食べる", example: "I <u>ate</u> sushi for dinner last night." },
        { word: "WATER", partOfSpeech: "Noun (uncountable) -", definition: "水", example: "Please drink more <u>water</u> to stay hydrated." },
        { word: "SMILE", partOfSpeech: "Verb smiles, smiling, smiled", definition: "笑う", example: "The baby <u>smiled</u> at her mother." },
        { word: "TREE", partOfSpeech: "Noun (countable) pl. trees", definition: "木", example: "He climbed the <u>tree</u> to pick some apples." },
        { word: "SLEEP", partOfSpeech: "Verb sleeps, sleeping, slept", definition: "眠る", example: "He <u>slept</u> soundly after a long day." },
        { word: "BOOK", partOfSpeech: "Noun (countable) pl. books", definition: "本", example: "She borrowed a <u>book</u> from the library." },
        { word: "LAUGH", partOfSpeech: "Verb laughs, laughing, laughed", definition: "笑う", example: "They <u>laughed</u> at the funny joke." },
        { word: "CHAIR", partOfSpeech: "Noun (countable) pl. chairs", definition: "椅子", example: "He sat on the <u>chair</u> by the window." },
        { word: "DANCE", partOfSpeech: "Verb dances, dancing, danced", definition: "踊る", example: "She <u>danced</u> gracefully at the party." },
        { word: "SUN", partOfSpeech: "Noun (singular) -", definition: "太陽", example: "The <u>sun</u> set over the horizon." },
        { word: "WORK", partOfSpeech: "Verb works, working, worked", definition: "働く", example: "He <u>works</u> hard every day at the office." },
        { word: "FOOD", partOfSpeech: "Noun (uncountable) -", definition: "食べ物", example: "Japanese <u>food</u> is delicious." },
        { word: "CLOUD", partOfSpeech: "Noun (countable) pl. clouds", definition: "雲", example: "A <u>cloud</u> covered the sun briefly." },
        { word: "WRITE", partOfSpeech: "Verb writes, writing, wrote, written", definition: "書く", example: "She <u>wrote</u> a letter to her friend." },
        { word: "FISH", partOfSpeech: "Noun (countable) pl. fish", definition: "魚", example: "The <u>fish</u> swam quickly in the river." },
        { word: "APPLE", partOfSpeech: "Noun (countable) pl. apples", definition: "りんご", example: "He ate an <u>apple</u> for a snack." },
        { word: "STUDY", partOfSpeech: "Verb studies, studying, studied", definition: "勉強する", example: "I <u>study</u> English every evening." },
        { word: "ROAD", partOfSpeech: "Noun (countable) pl. roads", definition: "道", example: "The <u>road</u> was empty in the early morning." },
        { word: "SING", partOfSpeech: "Verb sings, singing, sang, sung", definition: "歌う", example: "She loves to <u>sing</u> at karaoke with friends." }
    ];
    let studyMode = "meaningRecall"; // Default study mode
    let notLearnedWords = [...words];
    let currentWord = null;
    let iterationCount = 0; // Track the number of iterations
    let studyData = []; // Array to store study data
    let learnedWords = []; // Words learned using "Learn New Words"
    let currentLearningIndex = 0; // Index for learning new words
    let currentGroupStartIndex = 0; // Start index for the current group of words
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
    
            learnedWords.push(words[currentLearningIndex]); // Add the current word to learned words
            currentLearningIndex++; // Move to the next word
            loadLearningWord(); // Load the next word
        }
    });
    
    


    document.getElementById("submit-participant-number").addEventListener("click", () => {
        console.log("Participant number button clicked");
    });      
    
    document.getElementById("learn-new-words").addEventListener("click", () => {
        // Check if all words have been learned
        if (currentGroupStartIndex >= words.length) {
            alert("You have learned all available words!");
            return;
        }
    
        // Set the starting index for the current group
        currentLearningIndex = currentGroupStartIndex;
    
        // Switch to the learning screen and load the first word in the group
        switchToScreen(document.getElementById("learning-screen"));
        loadLearningWord();
    });

    document.getElementById("review-learned-words").addEventListener("click", () => {
        console.log("Review Learned Words button clicked");
        
        // Check if there are any learned words
        if (learnedWords.length === 0) {
            alert("No words to review. Please learn some words first!");
            return;
        }
    
        // Set up review mode with learned words
        incorrectWords = [...learnedWords];
        currentReviewWord = null; // Reset the current review word
        studyMode = "reviewLearned"; // Set study mode
        startStudy("reviewLearned");
    });
    
    

    document.getElementById("formRecallButton").addEventListener("click", () => {
        console.log("Review Words button clicked");
        startStudy("formRecall");
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

    document.getElementById("meaningRecallButton").addEventListener("click", () => {
        console.log("Review Meanings button clicked");
        startStudy("meaningRecall");
    });

    document.getElementById("finish").addEventListener("click", () => {
        console.log("Finish button clicked");
        finishStudy();
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
    const reviewHeader = document.getElementById("quiz-header");
    reviewHeader.textContent = mode === "meaningRecall" ? "What does this word mean?" : "What word matches this meaning?";
    switchToScreen(document.getElementById("quiz-screen"));
    loadReviewWord(mode);
}

function loadLearningWord() {
    // Check if we've reached the end of the current group or all words
    if (currentLearningIndex >= currentGroupStartIndex + 12 || currentLearningIndex >= words.length) {
        alert("You have finished learning this set of 12 words.");
        currentGroupStartIndex += 12; // Increment the group index for the next session
        updateProgress();
        switchToScreen(document.getElementById("welcome-screen")); // Go back to study options
        return;
    }

    const word = words[currentLearningIndex];
    if (!word) {
        console.error("Word not found for index:", currentLearningIndex);
        return;
    }

    // Update the UI with the current word details
    document.getElementById("word-line").innerHTML = `
        <span class="word">${word.word}</span> 
        <span class="part-of-speech">[${word.partOfSpeech}]</span>
    `;
    document.getElementById("definition-line").textContent = word.definition;
    document.getElementById("example-line").innerHTML = `<strong>Example:</strong> ${word.example}`;
}

function startStudy(mode) {
    console.log("Starting study in mode:", mode);
    studyMode = mode;

    // Check if there are words to review
    if (learnedWords.length === 0) {
        alert("No words to review. Please learn some words first!");
        return; // Stop the function execution if no words are available
    }

    // Populate incorrectWords with learnedWords
    incorrectWords = [...learnedWords];
    console.log("Words to review:", incorrectWords);

    // Get DOM elements
    const reviewHeader = document.getElementById("quiz-header");
    const reviewScreen = document.getElementById("quiz-screen");
    const welcomeScreen = document.getElementById("welcome-screen");

    if (!reviewHeader || !reviewScreen || !welcomeScreen) {
        console.error("Error: One or more required elements are missing in the HTML.");
        alert("An error occurred. Please contact support.");
        return;
    }

    // Update the review header text based on the mode
    if (studyMode === "meaningRecall") {
        reviewHeader.textContent = "What does this word mean?";
    } else if (studyMode === "formRecall") {
        reviewHeader.textContent = "What word best matches this meaning?";
    }

    // Hide the welcome screen
    welcomeScreen.classList.add("hidden");
    welcomeScreen.classList.remove("active");

    // Show the review screen
    reviewScreen.classList.remove("hidden");
    reviewScreen.classList.add("active");

    loadReviewWord(mode);
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
        ...shuffle(
            learnedWords
                .filter(word => word !== currentReviewWord) // Exclude the current review word
                .map(word => (mode === "meaningRecall" ? word.definition : word.word))
        ).slice(0, 5) // Shuffle first, then take 5 items
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
        const welcomeScreen = document.getElementById("welcome-screen");
        const reviewScreen = document.getElementById("quiz-screen");

        // Return to welcome screen
        reviewScreen.classList.add("hidden");
        reviewScreen.classList.remove("active");
        welcomeScreen.classList.remove("hidden");
        welcomeScreen.classList.add("active");
        return;
    }

    // Get the current review word
    currentReviewWord = incorrectWords.shift();
    const prompt = document.getElementById("prompt");
    const choicesContainer = document.getElementById("choices");

    if (!prompt || !choicesContainer) {
        console.error("Error: Missing prompt or choices container.");
        return;
    }

    // Update the prompt text
    prompt.textContent = mode === "meaningRecall" ? currentReviewWord.word : currentReviewWord.definition;

    // Generate multiple-choice buttons
    choicesContainer.innerHTML = ""; // Clear previous choices
    choicesContainer.classList.remove("hidden");

    const correctAnswer = mode === "meaningRecall" ? currentReviewWord.definition : currentReviewWord.word;

    // Shuffle and generate answer choices
    const allChoices = shuffle([
        correctAnswer,
        ...learnedWords
            .filter((word) => word !== currentReviewWord)
            .map((word) => (mode === "meaningRecall" ? word.definition : word.word))
            .slice(0, 5),
    ]);

    allChoices.forEach((choice) => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => handleAnswer(choice, correctAnswer));
        choicesContainer.appendChild(button);
    });
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