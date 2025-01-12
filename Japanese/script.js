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

    // Function to extract query parameters from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // DOM Elements
    const registrationScreen = document.getElementById("registration-screen");
    const welcomeScreen = document.getElementById("welcome-screen");
    const participantInput = document.getElementById("participant-number");

    // Check if participant number is in the URL
    const participant = getQueryParam("participant");
    if (participant) {
        // If participant is in the URL, skip input
        participantNumber = participant; // Assign globally
        console.log("Participant number from URL:", participant);

        // Skip the registration screen
        registrationScreen.classList.add("hidden");
        registrationScreen.classList.remove("active");
        welcomeScreen.classList.remove("hidden");
        welcomeScreen.classList.add("active");
    } else {
        // If no participant number is in the URL, show the input form
        registrationScreen.classList.remove("hidden");
        registrationScreen.classList.add("active");
    }

    // Event Listener for manual participant number submission
    document.getElementById("submit-participant-number").addEventListener("click", () => {
        const input = participantInput.value.trim(); // Get value and remove spaces

        if (!input) {
            alert("Please enter a valid participant number.");
            return;
        }

        participantNumber = input; // Assign globally
        console.log("Participant number entered manually:", participantNumber);

        // Hide the registration screen and show the welcome screen
        registrationScreen.classList.add("hidden");
        registrationScreen.classList.remove("active");
        welcomeScreen.classList.remove("hidden");
        welcomeScreen.classList.add("active");
    });
    
    // Variables
    const words = [
        { word: "ADVERN", definition: "さまざまな建設業界で使用されている多用途のこぎりです。" },
        { word: "BEACOS", definition: "副鼻腔炎。" },
        { word: "BOCKLE", definition: "各種工事の支持角度の測定・確認。 " },
        { word: "EMBACK", definition: "雨よけとして機能するベランダや玄関の屋根。 " },
        { word: "EVOTIC", definition: "この言葉は、めまいがして非常に衰弱している状態を表します。全身麻酔後にゆっくりと意識が回復する患者の状態を表すのによく使用されます。" },
        { word: "SLOBES", definition: "歪んだ視界を矯正する特殊なレンズ。" },
        { word: "INJENT", definition: "患者の病気の性質を判断する。面接、検査、健康診断、その他の手続きを通じて。" }
    ];
    let studyMode = "meaningRecall"; // Default study mode
    let notLearnedWords = [...words];
    let currentWord = null;
    let iterationCount = 0; // Track the number of iterations
    let studyData = []; // Array to store study data

    console.log("JavaScript is working!");
    console.log("Words:", words);
    console.log("Not Learned Words:", notLearnedWords);

    // DOM Elements
    const studyScreen = document.getElementById("study-screen");
    const answerScreen = document.getElementById("answer-screen");
    const promptDiv = document.getElementById("prompt");
    const answerDiv = document.getElementById("answer");

     // Event Listener for manual participant number submission
    
    document.getElementById("review-words").addEventListener("click", () => {
        console.log("Review Words button clicked");
        startStudy("meaningRecall");
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

    document.getElementById("known").addEventListener("click", () => {
        console.log("Known button clicked");
        markAsKnown(true); // Word is marked as "known"
    });
    
    document.getElementById("unknown").addEventListener("click", () => {
        console.log("Unknown button clicked");
        markAsKnown(false); // Word is marked as "unknown"
    });
    

    // Functions// Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function startStudy(mode) {
    console.log("Starting study in mode:", mode);
    studyMode = mode;
  
    // Shuffle the notLearnedWords array
    notLearnedWords = shuffle([...words]);
    console.log("Shuffled words:", notLearnedWords);
  
    // Update the study header text based on the mode
    const studyHeader = document.getElementById("study-header");
    if (studyMode === "meaningRecall") {
      studyHeader.textContent = "What does this word mean?";
    } else if (studyMode === "formRecall") {
      studyHeader.textContent = "What word best matches this meaning?";
    }
  
    // Hide the welcome screen
    welcomeScreen.classList.add("hidden");
    welcomeScreen.classList.remove("active");
  
    // Show the study screen
    studyScreen.classList.remove("hidden");
    studyScreen.classList.add("active");
  
    loadNextWord();
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