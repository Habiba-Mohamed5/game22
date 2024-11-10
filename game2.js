let score = parseInt(localStorage.getItem('score')) || 0; 
const scoreDisplay = document.getElementById('score-value');
scoreDisplay.textContent = score;

const sound = {
    well_done: 'sounds/well done.mp3', 
    excellent: 'sounds/Excellent.mp3', 
    confetti: 'sounds/congrats.mp3',
    true: 'sounds/true.mp3',
    false_word: 'sounds/false_word.mp3',
    wrong: 'sounds/false.mp3'
};

const dialogues = [
    {
        answer: "True",
        question: "Five",
        audio: ["sounds/number5.mp3"], // الصوتين هنا
        image: "images/num5.jfif",
    },

    {
        answer: "False",
        question: "Nine",
        audio: ["sounds/number9.mp3"], // الصوتين هنا
        image: "images/num3.jfif",
    },

    {
        answer: "True",
        question: "Four",
        audio: ["sounds/number4.mp3"], // الصوتين هنا
        image: "images/num4.png",
    },

    {
        answer: "True",
        question: "Six",
        audio: ["sounds/number6.mp3"], // الصوتين هنا
        image: "images/num6.jfif",
    },

    {
        answer: "False",
        question: "Seven",
        audio: ["sounds/number7.mp3"], // الصوتين هنا
        image: "images/num9.jfif",
    }
];    

const answerButtons = document.querySelectorAll('.game-answer-btn');
const questionAudio = new Audio();
const wrongAudio = new Audio(sound.wrong);
const gameContainer = document.getElementById('game-container');
const listenButton = document.getElementById('game-listen-button');
const instructionsContainer = document.getElementById('instructions-container');
const playButton = document.getElementById('instruction-play-button');
const audioElement = document.getElementById('instruction-audio');

let currentDialogueIndex = 0;
let currentQuestion = 0;
const totalQuestions = dialogues.length;

let audioContext = new (window.AudioContext || window.webkitAudioContext)();

playButton.addEventListener('click', function() {
    audioContext.resume().then(() => {
        audioElement.play();
    });
    playButton.style.display = 'none';
});

audioElement.onended = function() {
    instructionsContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
    showNextDialogue();
};

listenButton.addEventListener('click', () => {
    audioContext.resume().then(() => {
        questionAudio.currentTime = 0;
        questionAudio.play();
    });
});

function stopAudio(audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
}

function showNextDialogue() {
    const currentDialogue = dialogues[currentDialogueIndex];

    const questionText = document.getElementById('game-question-text');
    questionText.textContent = currentDialogue.question;

    const questionImage = document.getElementById('game-question-image');
    questionImage.src = currentDialogue.image;
    questionImage.classList.add('fade-in');

    let playCount = 0;
    let audioIndex = 0;

    function playAudioTwice(audioSrc, callback) {
        questionAudio.src = audioSrc;
        questionAudio.currentTime = 0;
        questionAudio.play();

        questionAudio.onended = function() {
            playCount++;
            if (playCount < 2) {
                questionAudio.currentTime = 0;
                questionAudio.play();
            } else {
                playCount = 0;
                callback();
            }
        };
    }

    function playAudioSequence() {
        playAudioTwice(currentDialogue.audio[audioIndex], () => {
            audioIndex++;
            if (audioIndex < currentDialogue.audio.length) {
                playAudioTwice(currentDialogue.audio[audioIndex], () => {
                    // Reset the audio index for the next question
                    audioIndex = 0;
                });
            }
        });
    }

    // Start the audio sequence
    playAudioSequence();
}


function checkAnswer(selectedAnswer) {
    const currentDialogue = dialogues[currentDialogueIndex];

    disableButtons();

    const selectedAudio = selectedAnswer === 'True' ? sound.true : sound.false_word;
    const selectedAnswerAudio = new Audio(selectedAudio);
    selectedAnswerAudio.play();

    selectedAnswerAudio.addEventListener('ended', () => {
        if (selectedAnswer === currentDialogue.answer) {
            score += 1;
            scoreDisplay.textContent = Math.floor(score);
    
            const soundKeys = Object.keys(sound).filter(key => key !== 'confetti' && key !== 'true' && key !== 'false_word' && key !== 'wrong');
            const randomSoundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
            const randomSound = new Audio(sound[randomSoundKey]);
    
            setTimeout(() => {
                randomSound.play();
    
                randomSound.addEventListener('ended', () => {
                    createConfetti();
                });
            }, 500);
       


            currentDialogueIndex++;
            currentQuestion++;

            if (currentDialogueIndex < dialogues.length) {
                setTimeout(() => {
                    showNextDialogue();
                    setTimeout(enableButtons, 500);
                }, 7000);
            } else {
                setTimeout(() => {
                    transitionToNextPage();
                }, 7000);
            }
        } else {
            wrongAudio.play();

            wrongAudio.addEventListener('ended', () => {
                repeatQuestion();
                enableButtons();
            });
        }
    });
}

function repeatQuestion() {
    questionAudio.currentTime = 0;
    questionAudio.play();
}

function disableButtons() {
    answerButtons.forEach((button) => {
        button.disabled = true;
    });
}

function enableButtons() {
    answerButtons.forEach((button) => {
        button.disabled = false;
    });
}

function transitionToNextPage() {
    localStorage.setItem('score', score); 
    gameContainer.classList.add('stage-transition');
    setTimeout(() => {
        window.location.href = 'exit.html'; 
    }, 2000);
}

answerButtons.forEach((button) => {
    button.addEventListener('click', function() {
        checkAnswer(button.id === 'true-btn' ? 'True' : 'False');
    });
});

function createConfetti() {
    const confettiContainer = document.getElementById('game-confetti');
    confettiContainer.classList.remove('hidden');

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');

        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

        confettiContainer.appendChild(confetti);

        const fallDuration = Math.random() * 1 + 1;
        confetti.style.animationDuration = `${fallDuration}s`;

        setTimeout(() => {
            confetti.remove();
        }, fallDuration * 1000);
    }

    const confettiSound = new Audio(sound.confetti);
    confettiSound.play();
}