let player;

// Initialize the YouTube API when it's ready
function onYouTubeIframeAPIReady() {
    console.log('onYouTubeIframeAPIReady called');
    player = new YT.Player('explainer-video', {
        events: {
            onReady: () => console.log('YouTube Player is ready.'),
        },
    });
}


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

    // 🔹 Make Sure Firebase Auth is Defined
    if (!firebase.auth) {
        console.error("Firebase Auth is not available. Check your Firebase imports.");
    } else {
        const auth = firebase.auth();
    
        auth.signInAnonymously()
          .then(() => {
            console.log("Signed in anonymously");
          })
          .catch((error) => {
            console.error("Error signing in:", error);
          });
    }
    
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
    console.log("DOM fully loaded. Attaching event listeners...");

    const learnGroup1 = document.getElementById("learn-group-1");
    const learnGroup2 = document.getElementById("learn-group-2");
    const learnGroup3 = document.getElementById("learn-group-3");
    const learnGroup4 = document.getElementById("learn-group-4");

        if (!learnGroup1 || !learnGroup2 || !learnGroup3 || !learnGroup4) {
            console.error("One or more buttons are missing in the DOM.");
        } else {
            learnGroup1.addEventListener("click", () => startLearningGroup(1));
            learnGroup2.addEventListener("click", () => startLearningGroup(2));
            learnGroup3.addEventListener("click", () => startLearningGroup(3));
            learnGroup4.addEventListener("click", () => startLearningGroup(4));
    
            console.log("Event listeners attached to Learn Group buttons.");
        }
    
    let studyFinished = false; // ✅ Global flag


    document.getElementById("finish").addEventListener("click", () => {
        console.log("Finish button clicked");
        finishStudy();
    });

    document.getElementById("quiz-group-1").addEventListener("click", () => startGroupQuiz(1));
    document.getElementById("quiz-group-2").addEventListener("click", () => startGroupQuiz(2));
    document.getElementById("quiz-group-3").addEventListener("click", () => startGroupQuiz(3));
    document.getElementById("quiz-group-4").addEventListener("click", () => startGroupQuiz(4));

    // Ensure the Return to Welcome Screen button works
    document.getElementById("quiz-return-button").addEventListener("click", () => {
        console.log("Returning to Welcome Screen");
        switchToScreen(document.getElementById("welcome-screen"));
    });


    // 🔍 Check if all required elements exist
    const checkElements = [
        "next-word",
        "play-word",
        "show-definition",
        "review-next-word"
    ];

    checkElements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`🚨 Error: Element with ID '${id}' not found in the DOM.`);
        } else {
            console.log(`✅ Found element: ${id}`);
        }
    });

    const nextWordButton = document.getElementById("next-word");
    if (nextWordButton) {
        nextWordButton.addEventListener("click", () => {
            console.log("📢 Next Word button clicked");
            learningCurrentIndex++; // Move to next word
            loadLearningWord();
        });
    } else {
        console.error("🚨 Error: Next Word button not found!");
    }

// ✅ Fix: Play correct audio and count clicks
document.getElementById("play-word").addEventListener("click", () => {
    const wordElement = document.querySelector("#word-line .word"); // Get the displayed word

    if (!wordElement) {
        console.error("🚨 Error: No word displayed to play audio for.");
        return;
    }

    const word = wordElement.textContent.trim(); // Extract the correct word from UI
    const audioPath = `../audio/${word.toUpperCase()}.mp3`;
//    const audioPath = `audio/${word.toUpperCase()}.MP3`;



    const audio = new Audio(audioPath);
    audio.play()
        .then(() => {
            audioPlayCount++; // ✅ Only increment here
            console.log(`🎵 Playing audio for "${word}" (Play count: ${audioPlayCount})`);
        })
        .catch((error) => {
            console.error("🚨 Error playing audio:", error);
            alert(`Audio file not found for "${word}".`);
        });
});



    const showDefinitionButton = document.getElementById("show-definition");
    if (showDefinitionButton) {
        showDefinitionButton.addEventListener("click", () => {
            console.log("📢 Show Definition button clicked");

            const definitionLine = document.getElementById("definition-line");
            const exampleLine = document.getElementById("example-line");
            const partOfSpeech = document.querySelector(".part-of-speech"); // Select part of speech element
            const nextWordButton = document.getElementById("next-word");

            if (definitionLine && definitionLine.dataset.definition) {
                definitionLine.innerHTML = `<strong>Definition:</strong> ${definitionLine.dataset.definition}`;
                definitionLine.classList.remove("hidden");
            } else {
                console.error("🚨 Error: Definition line not found or not set!");
            }

            if (exampleLine && exampleLine.dataset.example) {
                // Remove "Example: " if it already exists in the dataset
                let exampleText = exampleLine.dataset.example.replace(/^Example:\s*/i, "");
                exampleLine.innerHTML = `${exampleText}`;
                exampleLine.classList.remove("hidden");
            } else {
                console.error("🚨 Error: Example line not found or not set!");
            }

            if (partOfSpeech) {
                partOfSpeech.classList.remove("hidden"); // Show part of speech
            }

            showDefinitionButton.classList.add("hidden"); // Hide "Show Definition" button
            if (nextWordButton) {
                nextWordButton.classList.remove("hidden"); // Show "Next Word" button
            }
        });
    } else {
        console.error("🚨 Error: Show Definition button not found!");
    }

    
    const returnButton = document.getElementById("learning-return-button");
    if (returnButton) {
        returnButton.addEventListener("click", () => {
            console.log("📢 Return to Welcome Screen button clicked");

            // Reset necessary variables
            studyMode = "meaningRecall";
            learningCurrentIndex = 0;

            // Switch back to the welcome screen
            switchToScreen(document.getElementById("welcome-screen"));
        });
    } else {
        console.error("🚨 Error: Return to Welcome Screen button not found!");
    }



    // Stop the video when switching screens
    function stopYouTubeVideo() {
        if (player && typeof player.stopVideo === 'function') {
            player.stopVideo();
            console.log("YouTube video stopped.");
        }
    }
    


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
        console.log("Switching to screen:", screen.id);
    
        // Stop YouTube video if leaving the explainer screen
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen && currentScreen.id === 'explainer-screen' && player) {
            stopYouTubeVideo();
        }
    
        // Hide all screens
        document.querySelectorAll('.screen').forEach((s) => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
    
        // Show the specified screen
        screen.classList.remove('hidden');
        screen.classList.add('active');
    
        console.log(`✅ Switched to ${screen.id}`);
    }
    

    
    
    

    


    
    // Variables
    const learningWordsPool = [
        { learnGroup: "1", word: "advern", partOfSpeech: "可算名詞", definition: "建設業で使用される多目的のこぎり。", example: "I am building a deck this weekend; can I borrow your <u>advern</u>, please?" },
        { learnGroup: "2", word: "beacos", partOfSpeech: "不可算名詞", definition: "副鼻腔炎。", example: "Use this nasal spray for two weeks to reduce the <u>beacos</u>." },
        { learnGroup: "1", word: "bockle", partOfSpeech: "他動詞", definition: "さまざまな建設作業のための支え角度を測定または確認すること。", example: "The contractor <u>bockled</u> the ground floor area before installing the kitchen bench." },
        { learnGroup: "1", word: "emback", partOfSpeech: "可算名詞", definition: "玄関やベランダを覆い、雨よけの役割を果たす屋根。(風除室)", example: "You couldn’t wish for a better house: everything was thought through to the finest detail. Even the <u>emback</u> was designed to keep you dry on a rainy day." },
        { learnGroup: "2", word: "evotic", partOfSpeech: "形容詞", definition: "目まいや極度の脱力感を感じる状態を表す言葉。全身麻酔から目覚める患者の状態を説明する際によく使われる。(朦朧)", example: "You may see her now, but only for a few minutes; the operation was successful, but she is still extremely <u>evotic</u>." },
        { learnGroup: "2", word: "slobes", partOfSpeech: "可算名詞", definition: "遠視を矯正する特殊なレンズ。(コンタクトレンズ)", example: "You will have to wear <u>slobes</u> when driving or reading, to correct your eyesight problem." },
        { learnGroup: "2", word: "injent", partOfSpeech: "他動詞", definition: "患者の病気の種類を診断するために、問診、検査、医療テストなどを用いること。(診断)", example: "Since my family doctor could not <u>injent</u> the problem, she referred me to a specialist." },
        { learnGroup: "2", word: "wockey", partOfSpeech: "可算名詞", definition: "歯の上部を覆う人工の被せ物。(クラウン)", example: "As a child, I damaged my front tooth playing football, but the dentist did such a good job with my <u>wockey</u> that no one ever noticed it." },
        { learnGroup: "2", word: "jeking", partOfSpeech: "形容詞", definition: "一時的に痛みを感じにくくなる状態を表す言葉。(鎮痛)", example: "I can recommend a <u>jeking</u> treatment to relieve the pain." },
        { learnGroup: "1", word: "recibe", partOfSpeech: "他動詞", definition: "明確に区切られた範囲で、スコップや掘削機を使って土や砂礫を取り除くこと。(発掘)", example: "The workers will be here tomorrow to <u>recibe</u> the marked area, and next week we can start on the foundation." },
        { learnGroup: "1", word: "totate", partOfSpeech: "他動詞", definition: "ガラスに光を反射する金属または特殊なコーティングを施し、不透明にする処理。(ガラスフィルム加工)", example: "In the embassy building all windows facing the street were <u>totated</u> for security reasons." },
        { learnGroup: "2", word: "perial", partOfSpeech: "可算名詞", definition: "長期的な人工呼吸が必要な場合に使用される医療機器。(人工呼吸器)", example: "After the accident the patient was put on a <u>perial</u> because one of his lungs collapsed and he could not breathe on his own." },
        { learnGroup: "1", word: "surmit", partOfSpeech: "可算名詞", definition: "クローラーまたは大きな車輪を持ち、土砂を移動させるための大型ショベルを備えた建設車両。(ブルドーザー)", example: "The old motel on the corner of our street had been finally torn down, and <u>surmits</u> were working hard and fast to clear the area where the new hotel was going to rise." },
        { learnGroup: "1", word: "tainor", partOfSpeech: "可算名詞", definition: "建築士や熟練した作業員をさまざまな方法で補助する未熟な労働者。(見習い)", example: "I will be working as a <u>tainor</u> on a building site this summer to help me save for my holiday in South America next year." },
        { learnGroup: "1", word: "banity", partOfSpeech: "可算名詞", definition: "壁や天井に施された模様やデザイン。(壁装飾)", example: "Mother decided to have a <u>banity</u> made on the feature wall in the dining room. She invited an interior designer who brought a selection of stencils for us to choose from." },
        { learnGroup: "2", word: "wateny", partOfSpeech: "不可算名詞", definition: "花粉によって引き起こされる強い過敏反応。典型的な症状として、くしゃみ、かゆみ、腫れがある。(花粉症)", example: "We are moving back to the city this week, where the risk of a <u>wateny</u> attack is much lower." },
        { learnGroup: "1", word: "abstair", partOfSpeech: "可算名詞", definition: "建設足場の手すりに取り付けられた階段構造で、作業員が上り下りするためのもの。(脚立)", example: "We need to position two <u>abstairs</u> at the western side of the construction site because this is where most of the work will be done today." },
        { learnGroup: "1", word: "animote", partOfSpeech: "可算名詞", definition: "電気を一定方向に伝送する金属または人工の導体。(電線)", example: "You need to get a registered electrician to do this wiring job; you won’t know how to connect the <u>animotes</u>." },
        { learnGroup: "2", word: "aportle", partOfSpeech: "可算名詞", definition: "医薬品を臓器に直接注射するための注射器。(注射器)", example: "Today we will practice using <u>aportle</u> for administering atropine injections into the heart." },
        { learnGroup: "2", word: "circhit", partOfSpeech: "可算名詞", definition: "傷口を感染やさらなる損傷から守るために使用される滅菌カバー。(包帯)", example: "The cut doesn’t look too bad, but you must put a <u>circhit</u> on it to make sure it doesn’t get infected." },
        { learnGroup: "2", word: "custony", partOfSpeech: "不可算名詞", definition: "現実との関係が著しく歪む、または完全に失われる深刻な精神障害。(精神疾患)", example: "With such a severe form of <u>custony</u>, it would be dangerous for her to remain living in the community." },
        { learnGroup: "2", word: "entrave", partOfSpeech: "他動詞", definition: "医薬品、ワクチン、または液体を静脈内に投与すること。(静脈注射)", example: "We will <u>entrave</u> this medication for three days after surgery, and then you will have to take it orally for one month." },
        { learnGroup: "1", word: "erramic", partOfSpeech: "可算名詞", definition: "庭や歩道で使われる敷石や砂利などの舗装材。(砂利)", example: "I am running out of <u>erramic</u>. We will have to stop for the day and finish paving this walkway early tomorrow." },
        { learnGroup: "1", word: "pluency", partOfSpeech: "可算名詞", definition: "建物内の温度を一定に保つ装置。(温度調整装置)", example: "This refresher course covers new <u>pluency</u> requirements for apartment blocks, and is recommended for architects and construction site managers." },
        { learnGroup: "3", word: "gatebay", partOfSpeech: "可算名詞", definition: "主に森や山岳地帯に見られる木造の簡易な建物。一時的な避難所としても使用される。(小屋)", example: "I know that you are tired, but we need to speed up if we want to reach the <u>gatebay</u> before dark." },
        { learnGroup: "3", word: "imigate", partOfSpeech: "他動詞", definition: "詰まった排水管や配管を解消するために、吸引力を用いること。(配管掃除)", example: "The water drain in the bath is completely blocked; I have taken a look at it, but we won’t be able to <u>imigate</u> it without proper equipment." },
        { learnGroup: "4", word: "mercusy", partOfSpeech: "不可算名詞", definition: "消化管や気道などの多くの体腔を覆う粘液状の液体。(粘液)", example: "Continue using the drops I gave you until <u>mercusy</u> emissions stop." },
        { learnGroup: "4", word: "proster", partOfSpeech: "可算名詞", definition: "腰、臀部、大腿部を含む体の部分。(下半身)", example: "This set of exercises focuses on the <u>proster</u> area." },
        { learnGroup: "4", word: "regrain", partOfSpeech: "可算名詞", definition: "動脈や静脈を部分的または完全に塞ぎ、心筋梗塞や脳卒中を引き起こす血栓の一種。(血栓)", example: "The patient is in cardiology; he was delivered by an ambulance at 3 AM, but the <u>regrain</u> had most likely occurred about 2 hours prior to this." },
        { learnGroup: "3", word: "scother", partOfSpeech: "可算名詞", definition: "ナットやボルトを締めたり曲げたりするための工具。(レンチ)", example: "To disassemble the ladder, use a 3/4 inch <u>scother</u> to loosen the locking nut." },
        { learnGroup: "3", word: "prolley", partOfSpeech: "可算名詞", definition: "建築や橋梁の主要な支持要素として使われる頑丈な鉄骨。(梁)", example: "It won’t be possible to put a skylight exactly where you want it, because one of the <u>prolleys</u> goes through this area." },
        { learnGroup: "4", word: "utilisk", partOfSpeech: "可算名詞", definition: "外科手術で切開部を広げるために使用される器具。(開創器)", example: "The senior nurse was holding a <u>utilisk</u> ready to hand it over to the surgeon once the incision was made." },
        { learnGroup: "4", word: "imputate", partOfSpeech: "他動詞", definition: "医薬品として使用するために植物やハーブを準備すること。(薬草処理)", example: "She knew ways of <u>imputating</u> most obscure herbs to bring out their medicinal qualities." },
        { learnGroup: "4", word: "antidoth", partOfSpeech: "可算名詞", definition: "肺機能障害やさまざまな肺疾患を治療するための淡黄色の天然治療薬。(肺用漢方薬)", example: "I heard that conventional treatments for lung problems have a number of side effects and decided to try an <u>antidoth</u> first." },
        { learnGroup: "3", word: "bankrust", partOfSpeech: "可算名詞", definition: "床材、屋根材、またはタイルを敷く専門職。(屋根職人)", example: "My father was a <u>bankrust</u> and passed on his trade secrets to me. I worked as his apprentice for 3 years before starting my own business." },
        { learnGroup: "4", word: "bracenet", partOfSpeech: "可算名詞", definition: "捻る、引っ張る、または過度に伸ばすことで生じる激しい腱や靭帯の損傷。(捻挫)", example: "We will need a stretcher here. I am not sure at this stage if it is a fracture or only a <u>bracenet</u>, but it is clearly too painful for him to walk." },
        { learnGroup: "3", word: "briening", partOfSpeech: "可算名詞", definition: "玄関の下部に設置される木や石の横木で、支えとして機能するもの。(敷居)", example: "These two cans of paint should be enough to paint all <u>brienings</u> and doorframes." },
        { learnGroup: "3", word: "carnivat", partOfSpeech: "可算名詞", definition: "建設業で洗浄や材料の混合に使用される浅い丸型容器。(バケツ)", example: "The apprentice prepared the building mix and put it in <u>carnivats</u> for the bricklayers." },
        { learnGroup: "4", word: "colonias", partOfSpeech: "不可算名詞", definition: "皮膚やその下の組織に炎症が起こり、傷ついたり、あとが残ることがある病気。主な症状は皮膚の赤みとかゆみ。(皮膚炎)", example: "<u>Colonias</u> must be treated in the early stages of the disease to avoid scarring." },
        { learnGroup: "3", word: "discrent", partOfSpeech: "不可算名詞", definition: "厚みがあり滑らかな床材または塗装。(床材)", example: "We used <u>discrent</u> when we renovated our lounge last year because it makes cleaning really easy and it looks great." },
        { learnGroup: "3", word: "dragment", partOfSpeech: "可算名詞", definition: "人や重い荷物を持ち上げたり降ろしたりする設備。(エレベーター)", example: "We will need a <u>dragment</u> to lift the concrete slabs up to the top level." },
        { learnGroup: "4", word: "teometry", partOfSpeech: "不可算名詞", definition: "内臓の機能や疾患を研究する医学の一分野。(内科学)", example: "Many medical researchers who work in the field of <u>teometry</u> recommend bowel irrigation as a preventative measure." },
        { learnGroup: "3", word: "infecent", partOfSpeech: "不可算名詞", definition: "砂、セメント、水を混ぜて作る堅牢な建築材料。(コンクリート)", example: "You must use <u>infecent</u> straight out of a rotating mixing drum." },
        { learnGroup: "3", word: "maxidise", partOfSpeech: "他動詞", definition: "壁や天井を塗装またはコーティングし、硬化させること。(塗装)", example: "When <u>maxidising</u>, make sure that all the gaps in a wall or ceiling are covered with the filler." },
        { learnGroup: "4", word: "obsolate", partOfSpeech: "他動詞", definition: "外科的に除去すること。(切除)", example: "“Nurse, prepare the scalpel”, said the surgeon, “I will now <u>obsolate</u> the tumour.”" },
        { learnGroup: "4", word: "treacher", partOfSpeech: "可算名詞", definition: "妊娠、出産、母体ケアを専門とする医師。(産婦人科医)", example: "As a child, she was greatly affected by the death of her baby sister. It was back then that she decided to become a <u>treacher</u>." },
        { learnGroup: "3", word: "rebailer", partOfSpeech: "可算名詞", definition: "一般家庭や企業のエネルギー消費量を測定・記録する装置。(電力計)", example: "I think our <u>rebailer</u> shows incorrect readings. We haven’t used our electrical appliances much this month, but the bill is really high." },
        { learnGroup: "4", word: "telerant", partOfSpeech: "可算名詞", definition: "医療分野で訓練を受けたが、通常は医師ではない救急対応者。(救急救命士)", example: "All <u>telerants</u> should be in the hospital lobby in five minutes." }
    ];
    let studyMode = "meaningRecall"; // Default study mode
    let remainingLearningWords= [...learningWordsPool];
    let currentWord = null;
    let iterationCount = 0; // Track the number of iterations
    let studyData = []; // Array to store study data
    let learningCompletedWords = []; // Words learned using "Learn New Words"
    let learningCurrentIndex = 0; // Index for learning new words
    let learningGroupStartIndex= 0; // Start index for the current group of words
    let currentGroupStartIndex = 0; // Start index for the current group of words
    let currentReviewWord = null; // Current word for review
    let reviewPendingWords = []; // words that need further review
    let quizPendingWords = []; // Words to be quizzed on
    let quizIncorrectWords = []; // Incorrectly answered words in the quiz
    let newWordsGroup = []; // To track the current batch of new words
    let reviewWords = []; // To track the current batch of review words
    let reviewCurrentIndex = 0; // Index for reviewing learned words
    let audioPlayCount = 0; // Count of audio plays for the current word

    



    console.log("JavaScript is working!");
    console.log("Words:", learningWordsPool);
    console.log("Not Learned Words:", remainingLearningWords);

    // DOM Elements
    const studyScreen = document.getElementById("study-screen");
    const answerScreen = document.getElementById("answer-screen");
    const promptDiv = document.getElementById("prompt");
    const answerDiv = document.getElementById("answer");


     // Event Listener for manual participant number submission
    
     document.getElementById("next-word").addEventListener("click", () => {
        handleNextLearningWord();
    });
    
    // ✅ Fix: Save correct word & audio play count

    function handleNextLearningWord() {
        console.log("📢 Next Word button clicked");
    
        if (learningCurrentIndex > 0) {
            const lastWord = newWordsGroup[learningCurrentIndex - 1];
    
            if (!lastWord) {
                console.error("🚨 Error: No previous word found for saving learning data.");
                return;
            }
    
            const now = new Date();
            const answeredAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
            const answeredAtTime = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Tokyo",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(now);
    
            const dataEntry = {
                participant: participantNumber,
                word: lastWord.word,
                definition: lastWord.definition,
                shownAtDate: lastWord.shownAtDate,
                shownAtTime: lastWord.shownAtTime,
                language: "Japanese",
                studyMode: "learnNewWords",
                answeredAtDate,
                answeredAtTime,
                correct: null,
                audioPlayCount, // ✅ Save correct play count
            };
    
            saveDataToServer([dataEntry]);
            console.log("✅ Learning data saved:", dataEntry);
        }
    
        // ✅ Reset play count only AFTER saving
        audioPlayCount = 0;
    
        loadLearningWord();
    }
    
    
    
    document.body.addEventListener("click", (event) => {
        if (event.target && event.target.id === "review-next-word") {
            console.log("Next word button clicked in Review Mode");
    
            // Save the current word data before switching to the next word
            if (studyMode === "reviewLearned" && reviewPendingWords[reviewCurrentIndex]) {
                const now = new Date();
                const shownAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
                const shownAtTime = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Tokyo",
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }).format(now);
    
                const dataEntry = {
                    participant: participantNumber,
                    word: reviewPendingWords[reviewCurrentIndex].word,
                    definition: reviewPendingWords[reviewCurrentIndex].definition,
                    shownAtDate,
                    shownAtTime,
                    language: "Japanese",
                    studyMode: "reviewLearned",
                    answeredAtDate: null, // Save as null for review mode
                    answeredAtTime: null, // Save as null for review mode
                    correct: null, // Save as null for review mode
                    audioPlayCount, // Save audio play count
                };
    
                studyData.push(dataEntry);
                console.log("Saved data for Review mode:", dataEntry);
    
                // Reset audio play count for the next word
                audioPlayCount = 0;
            }
    
            // Proceed to the next word
            if (studyMode === "reviewLearned") {
                reviewCurrentIndex++; // Move to the next word
                loadReviewWord(); // Load the next word
            }
        }
    });
    
    


    document.getElementById("submit-participant-number").addEventListener("click", () => {
        console.log("Participant number button clicked");
    });      
    
    document.getElementById("learn-new-words").addEventListener("click", () => {
        console.log("Learn New Words button clicked");
    
        // Check if all words have been learned
        if (learningCurrentIndex >= learningWordsPool.length) {
            alert("You have learned all available words!");
            return;
        }
    
        // Set up the batch of words starting from the current index
        newWordsGroup = learningWordsPool.slice(learningCurrentIndex, learningCurrentIndex + 12);
    
        // Set the study mode
        studyMode = "learnNewWords";
    
        // Switch to the learning screen and load the first word
        switchToScreen(document.getElementById("learning-screen"));
        loadLearningWord();
    });
    
    

    // Function to start learning a specific group
    function startLearningGroup(groupNumber) {
        console.log(`Learn Group ${groupNumber} button clicked`);
    
        // ✅ Ensure exactly 12 words are selected from the group
        newWordsGroup = learningWordsPool
            .filter(word => word.learnGroup === String(groupNumber)) // Select words from the correct group
            .slice(0, 12); // ✅ Ensure exactly 12 words
    
        console.log("✅ Words selected for learning:", newWordsGroup);
    
        if (newWordsGroup.length === 0) {
            alert("No words available for this group.");
            return;
        }
    
        // Reset learning progress for the group
        learningCurrentIndex = 0;
        studyMode = "learnNewWords";
    
        // Switch to learning screen and load the first word
        switchToScreen(document.getElementById("learning-screen"));
        loadLearningWord();
    }
    
    



 

    document.getElementById("show-definition").addEventListener("click", () => {
        // Reveal part of speech next to the word
        document.querySelector(".part-of-speech").classList.remove("hidden");
    
        // Reveal definition on the next line
        const definitionLine = document.getElementById("definition-line");
        definitionLine.innerHTML = definitionLine.dataset.definition;
        definitionLine.classList.remove("hidden");
    
        // Reveal example sentence on the final line
        const exampleLine = document.getElementById("example-line");
        exampleLine.innerHTML = exampleLine.dataset.example;
        exampleLine.classList.remove("hidden");
    
        // Hide Show Definition button, Show Next Word button
        document.getElementById("show-definition").classList.add("hidden");
        document.getElementById("next-word").classList.remove("hidden");
    });
    
      

    document.getElementById("meaningRecallButton").addEventListener("click", () => {
        console.log("Review Meanings button clicked");
        startQuiz("meaningRecall");
    });


    document.addEventListener("DOMContentLoaded", () => {
        const nextWordButton = document.getElementById("next-word");
        console.log("Next Word Button:", nextWordButton); // Should log the button element
    });

    // Return to Welcome Screen from Learning Mode
    document.getElementById("learning-return-button").addEventListener("click", () => {
        console.log("Return to Welcome Screen button clicked in Learn Mode");
    
        if (studyMode === "learnNewWords" && learningWordsPool[learningCurrentIndex]) {
            const now = new Date();
            const shownAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
            const shownAtTime = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Tokyo",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(now);
    
            const dataEntry = {
                participant: participantNumber,
                word: learningWordsPool[learningCurrentIndex].word,
                definition: learningWordsPool[learningCurrentIndex].definition,
                shownAtDate,
                shownAtTime,
                language: "Japanese",
                studyMode: "learnNewWords",
                answeredAtDate: null, // Save as null for review mode
                answeredAtTime: null, // Save as null for review mode
                correct: null, // Save as null for review mode
                audioPlayCount, // Save audio play count
            };
    
   
            // Save only the most recent entry to the server
            saveDataToServer([dataEntry]);
    
            // Reset audio play count
            audioPlayCount = 0;
        }
    
        // Clear the `studyData` array to avoid redundancy
        studyData = [];
    
        // Return to the welcome screen
        switchToScreen(welcomeScreen);
    });
    
    


    // Return to Welcome Screen from Review Mode
    document.getElementById("review-return-button").addEventListener("click", () => {
        console.log("Return to Welcome Screen button clicked in Review Mode");
    
        if (studyMode === "reviewLearned" && reviewPendingWords[reviewCurrentIndex]) {
            const now = new Date();
            const shownAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
            const shownAtTime = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Tokyo",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(now);
    
            const dataEntry = {
                participant: participantNumber,
                word: reviewPendingWords[reviewCurrentIndex].word,
                definition: reviewPendingWords[reviewCurrentIndex].definition,
                shownAtDate,
                shownAtTime,
                language: "Japanese",
                studyMode: "reviewLearned",
                answeredAtDate: null, // Save as null for review mode
                answeredAtTime: null, // Save as null for review mode
                correct: null, // Save as null for review mode
                audioPlayCount, // Save audio play count
            };
    
            console.log("Saving most recent data for Review mode (Return button):", dataEntry);
    
            // Save only the most recent entry to the server
            saveDataToServer([dataEntry]);
    
            // Reset audio play count
            audioPlayCount = 0;
        }
    
        // Clear the `studyData` array to avoid redundancy
        studyData = [];
    
        // Return to the welcome screen
        switchToScreen(welcomeScreen);
    });
    
    

    document.getElementById("quiz-return-button").addEventListener("click", () => {
        console.log("Return to Welcome Screen button clicked during Quiz Mode");
    
        if (studyMode === "meaningRecall" || studyMode === "formRecall") {
            const now = new Date();
            const shownAtDate = currentReviewWord.shownAtDate || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
            const shownAtTime = currentReviewWord.shownAtTime || new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Tokyo",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(now);
    
            const dataEntry = {
                participant: participantNumber,
                word: currentReviewWord.word,
                definition: currentReviewWord.definition,
                shownAtDate, // Use the existing or fallback to current timestamp
                shownAtTime, // Use the existing or fallback to current timestamp
                language: "Japanese",
                studyMode: studyMode, // Quiz mode (meaningRecall or formRecall)
                answeredAtDate: null, // Set to null
                answeredAtTime: null, // Set to null
                correct: null, // Set to null
                audioPlayCount: 0, // Default or reset audio play count
            };
    
            //console.log("Saving most recent data for Quiz mode (Return button):", dataEntry);
    
            // Save only the most recent entry to the server
            saveDataToServer([dataEntry]);
        }
    
        // Reset `currentReviewWord` and `quizPendingWords` to avoid redundancy
        currentReviewWord = null;
        quizPendingWords = [];
        audioPlayCount = 0; // Reset audio play count
    
        // Return to the welcome screen
        switchToScreen(welcomeScreen);
    });
    
    
    
    


    // Functions// Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



function loadLearningWord() {
    console.log(`📢 Loading word ${learningCurrentIndex + 1} of ${newWordsGroup.length}`);

    if (learningCurrentIndex >= newWordsGroup.length) { // ✅ Fix: Ensure it checks actual words, not a fixed number
        if (!window.groupFinishedAlerted) { // ✅ Fix: Prevent multiple alerts
            alert("You have completed all words in this group!");
            window.groupFinishedAlerted = true; // ✅ Flag it to avoid multiple alerts
        }
        switchToScreen(document.getElementById("welcome-screen"));
        return;
    }

    const word = newWordsGroup[learningCurrentIndex];

    if (!word) {
        console.error("🚨 Error: Word not found for index:", learningCurrentIndex);
        return;
    }

    const wordLine = document.getElementById("word-line");
    const definitionLine = document.getElementById("definition-line");
    const exampleLine = document.getElementById("example-line");
    const showDefinitionButton = document.getElementById("show-definition");
    const nextWordButton = document.getElementById("next-word");

    wordLine.innerHTML = `<span class="word">${word.word}</span> <span class="part-of-speech hidden"><em>(${word.partOfSpeech})</em></span>`;

    definitionLine.dataset.definition = word.definition;
    exampleLine.dataset.example = `<strong>Example:</strong> ${word.example}`;

    definitionLine.classList.add("hidden");
    exampleLine.classList.add("hidden");
    showDefinitionButton.classList.remove("hidden");
    nextWordButton.classList.add("hidden");

    const now = new Date();
    word.shownAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
    word.shownAtTime = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(now);

    console.log(`✅ Word displayed: ${word.word} (Index ${learningCurrentIndex})`);
}





function loadReviewWord() {
    // Check if the current index exceeds the review words
    if (reviewCurrentIndex >= reviewPendingWords.length) {
        alert("You have finished reviewing this set of words. Please quiz yourself to practice them.");
        // saveDataToServer(studyData); // Save data before returning to the welcome screen
        studyData = []; // Reset the study data array
        switchToScreen(document.getElementById("welcome-screen")); // Go back to study options
        return;
    }

    // Load the next word for review
    const word = reviewPendingWords[reviewCurrentIndex];
    if (!word) {
        console.error("Word not found for index:", reviewCurrentIndex);
        return;
    }

    // Update the UI for review mode
    document.getElementById("review-word-line").innerHTML = `
        <span class="word">${word.word}</span> 
        <span class="part-of-speech">[${word.partOfSpeech}]</span>
    `;
    document.getElementById("review-definition-line").textContent = word.definition;
    document.getElementById("review-example-line").innerHTML = `<strong>Example:</strong> ${word.example}`;
}





// Function to start a quiz for a specific group
// Function to start a quiz for a specific group
function startGroupQuiz(groupNumber) {
    console.log(`Starting Quiz for Group ${groupNumber}`);
    studyMode = "formRecall";
    quizIncorrectWords = []; // Reset incorrect words array

    // Filter words based on the selected group
    quizPendingWords = shuffle(
        learningWordsPool.filter(word => word.learnGroup === String(groupNumber))
    );

    if (quizPendingWords.length === 0) {
        alert("No words available for this quiz. Please learn words first!");
        return;
    }

    // Set header
    document.getElementById("quiz-header").textContent = `Group ${String.fromCharCode(64 + parseInt(groupNumber))} Quiz: Meaning → Form`; // Convert 1 -> A, 2 -> B, etc.
    switchToScreen(document.getElementById("quiz-screen"));
    loadQuizWord();
}



// Function to start a quiz for a specific group
function startGroupQuiz(groupNumber) {
    console.log(`🚀 startGroupQuiz(${groupNumber}) called`);
    console.log("📌 Words in learningWordsPool:", learningWordsPool);
    console.log("📌 Filtering for group:", String(groupNumber));
  

    studyMode = "formRecall";
    quizIncorrectWords = []; // Reset incorrect words array

    // Filter words based on the selected group
    quizPendingWords = shuffle(
        learningWordsPool.filter(word => word.learnGroup === String(groupNumber))
    );

    console.log("📌 quizPendingWords after filtering:", quizPendingWords);

    if (quizPendingWords.length === 0) {
        console.error("🚨 Error: No words found for group", groupNumber);
        alert("No words available for this quiz. Please learn words first!");
        return;
    }

    switchToScreen(document.getElementById("quiz-screen"));
    console.log("✅ Quiz Screen is now active");

    console.log("✅ Calling loadQuizWord()");
    loadQuizWord();
}


function loadQuizWord() {
    console.log("🚀 loadQuizWord() called");

    if (quizPendingWords.length === 0) {
        alert("Quiz completed!");
        switchToScreen(document.getElementById("welcome-screen"));
        return;
    }

    // Get the next word
    currentReviewWord = quizPendingWords.shift();

    if (!currentReviewWord) {
        console.error("🚨 Error: currentReviewWord is undefined or null!");
        return;
    }

    console.log("✅ Loaded review word:", currentReviewWord.word);

    // Capture and store the timestamp **at the moment the word is displayed**
    const now = new Date();
    currentReviewWord.shownAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
    currentReviewWord.shownAtTime = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(now);

    // Display the meaning
    document.getElementById("prompt").textContent = currentReviewWord.definition;

    console.log("✅ Calling generateChoices()");
    generateChoices();
}




function generateChoices() {
    console.log("✅ generateChoices() is being called"); // Debugging

    const choicesContainer = document.getElementById("choices");

    // ✅ Ensure the container exists before proceeding
    if (!choicesContainer) {
        console.error("🚨 Error: choicesContainer not found in the DOM.");
        return;
    }

    choicesContainer.innerHTML = ""; // Clear previous choices
    choicesContainer.classList.remove("hidden"); 

    if (!currentReviewWord) {
        console.error("🚨 Error: No current review word found!");
        return;
    }

    const correctAnswer = currentReviewWord.word;

    // Get distractors from different words in the same group
    let distractors = learningWordsPool
        .filter(word => word.learnGroup === currentReviewWord.learnGroup && word.word !== correctAnswer)
        .map(word => word.word);

    // If there are fewer than 3 distractors, add random words from other groups
    while (distractors.length < 3) {
        const extraWord = learningWordsPool[Math.floor(Math.random() * learningWordsPool.length)].word;
        if (!distractors.includes(extraWord) && extraWord !== correctAnswer) {
            distractors.push(extraWord);
        }
    }

    // Shuffle and limit to 3 distractors
    distractors = shuffle(distractors).slice(0, 3);

    // ✅ Shuffle all choices before displaying
    const allChoices = shuffle([correctAnswer, ...distractors]);

    console.log("✅ Correct answer:", correctAnswer);
    console.log("✅ Distractors:", distractors);
    console.log("✅ All choices:", allChoices);

    // ✅ Ensure buttons are being created
    allChoices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.classList.add("quiz-choice");
        button.addEventListener("click", () => handleQuizAnswer(choice, correctAnswer));
        choicesContainer.appendChild(button);
    });
}




function handleQuizAnswer(selected, correct) {
    const now = new Date();
    
    // Ensure we use the stored timestamps when the word was shown
    const shownAtDate = currentReviewWord.shownAtDate;
    const shownAtTime = currentReviewWord.shownAtTime;

    // Capture the timestamp when the answer is selected
    const answeredAtDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(now);
    const answeredAtTime = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(now);

    // Prepare the data entry
    const dataEntry = {
        participant: participantNumber,
        word: currentReviewWord.word,
        definition: currentReviewWord.definition,
        shownAtDate, // Accurate timestamp when the word was displayed
        shownAtTime,
        language: "Japanese",
        studyMode: studyMode, // Either "meaningRecall" or "formRecall"
        answeredAtDate, // Timestamp when the answer was selected
        answeredAtTime,
        correct: selected === correct, // Boolean for answer correctness
        audioPlayCount: audioPlayCount, // Number of times audio was played before answering
    };

    // Save the answer data to the database
    saveDataToServer([dataEntry]);

    // Provide feedback and load the next question
    if (selected === correct) {
        alert("Correct!");
    } else {
        alert(`Incorrect. The correct answer is: ${correct}`);
        quizPendingWords.push(currentReviewWord); // Retry incorrect ones
    }

    loadQuizWord();
}



// Ensure the Return to Welcome Screen button works
document.getElementById("quiz-return-button").addEventListener("click", () => {
    console.log("Returning to Welcome Screen");
    switchToScreen(document.getElementById("welcome-screen"));
});




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
      remainingLearningWords= [...learningWordsPool];
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
  
      
    function showQuizScreen() {
        switchToScreen(document.getElementById("quiz-screen"));
        document.getElementById("quiz-return-button").style.display = "block"; // Show button

        // Hide other screens
        document.getElementById("welcome-screen").classList.add("hidden");
        document.getElementById("review-screen").classList.add("hidden");
    }

    function showReviewScreen() {
        switchToScreen(document.getElementById("review-screen"));
        document.getElementById("review-return-button").style.display = "block"; // Show button

        // Hide other screens
        document.getElementById("welcome-screen").classList.add("hidden");
        document.getElementById("quiz-screen").classList.add("hidden");
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
        if (studyFinished) return; // ✅ Prevent duplicate execution
        studyFinished = true; // ✅ Mark it as executed
    
        console.log("🎯 finishStudy() called! Resetting study session...");
    
        alert("Thank you for studying! You can close this tab now.");
    
        // ✅ Save data before finishing
        saveDataToServer(studyData);
        studyData = []; // Reset stored study data
    
        // ✅ Reset UI
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add("hidden");
            screen.classList.remove("active");
        });
    
        // ✅ Show Welcome Screen
        const welcomeScreen = document.getElementById("welcome-screen");
        if (welcomeScreen) {
            welcomeScreen.classList.remove("hidden");
            welcomeScreen.classList.add("active");
        } else {
            console.error("🚨 Error: Welcome screen not found!");
        }
    
        // ✅ Reset Study Variables
        learningCurrentIndex = 0;
        remainingLearningWords = [...learningWordsPool];
        currentWord = null;
        audioPlayCount = 0;
        window.groupFinishedAlerted = false;
    
        console.log("✅ Study session reset successfully.");
    }
    
    
    function saveDataToServer(data) {
        const db = firebase.firestore();
        
        data.forEach((entry) => {
            db.collection("intro_data")
                .add(entry)
                .then(() => {
                    console.log("Data saved to Firebase:", entry);
                })
                .catch((error) => {
                    console.error("Error saving to Firebase:", error);
                });
        });
    }
    
     
});