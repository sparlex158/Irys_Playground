const questions = [
    {
        question: "What is a key benefit of programmable data on Irys compared to traditional blockchains?",
        answers: [
            "It enables on-chain logic to interact directly with data, not just tokens or balances.",
            "It allows data to be changed by anyone at any time.",
            "It removes the need for cryptographic proofs.",
            "It makes all data private by default."
        ],
        correct: 0
    },
    {
        question: "How does Irys ensure that data stored on its datachains is verifiable?",
        answers: [
            "By using centralized servers to check data integrity.",
            "By allowing only trusted validators to upload data.",
            "By using cryptographic proofs and on-chain commitments for every data transaction.",
            "By encrypting all data with user passwords."
        ],
        correct: 2
    },
    {
        question: "Which of the following best describes the role of IrysVM?",
        answers: [
            "A consensus mechanism for validator selection.",
            "A tool for mining new Irys tokens.",
            "A virtual machine that executes programmable data logic directly on the datachain.",
            "A user interface for uploading files."
        ],
        correct: 2
    },
    {
        question: "What makes a datachain on Irys different from a traditional blockchain?",
        answers: [
            "Datachains cannot be verified by users.",
            "Datachains are only accessible to private organizations.",
            "Datachains do not use cryptography.",
            "Datachains are designed for storing and processing programmable data, not just transactions."
        ],
        correct: 3
    },
    {
        question: "Why is verifiability a core principle in the Irys ecosystem?",
        answers: [
            "It allows only the uploader to see the data.",
            "It increases the speed of data uploads.",
            "It makes data more expensive to store.",
            "It allows anyone to independently prove the authenticity and integrity of data without trusting intermediaries."
        ],
        correct: 3
    },
    {
        question: "What is the main purpose of on-chain commitments in Irys?",
        answers: [
            "To allow data to be deleted after a certain period.",
            "To provide a public, tamper-proof record that can be used to verify data existence and correctness.",
            "To hide data from all users except the uploader.",
            "To reduce the size of the blockchain."
        ],
        correct: 1
    },
    {
        question: "How does IrysVM enable new types of decentralized applications?",
        answers: [
            "By providing a centralized API for data uploads.",
            "By allowing smart contracts to process and verify data directly on-chain.",
            "By limiting programmability to token transfers only.",
            "By removing all consensus requirements."
        ],
        correct: 1
    },
    {
        question: "What is a unique feature of Irys datachains regarding data composability?",
        answers: [
            "Data is always encrypted and cannot be shared.",
            "Data can only be used by the original uploader.",
            "Data from different applications can be combined and used together in new smart contracts.",
            "Datachains do not support composability."
        ],
        correct: 2
    },
    {
        question: "Which statement is true about the relationship between Irys and verifiable data?",
        answers: [
            "Irys only verifies token balances, not data.",
            "Irys does not support data verification.",
            "Irys requires users to trust a central authority for data validation.",
            "Irys makes it possible for any user to independently verify the origin and integrity of data stored on-chain."
        ],
        correct: 3
    },
    {
        question: "What is the primary reason Irys was created?",
        answers: [
            "To provide a scalable, programmable, and verifiable data infrastructure for advanced decentralized applications.",
            "To create a new cryptocurrency for payments.",
            "To offer a social media platform for NFT creators.",
            "To replace all existing blockchains."
        ],
        correct: 0
    }
];


let current = 0;
let score = 0;

function showStartScreen() {
    document.querySelector('.quiz-container').classList.remove('fixed');
    document.getElementById('quiz').innerHTML = `
        <div class="start-screen">
            <img src="Logo.png" alt="Irys Logo" class="irys-logo-start" />
            <h2>Welcome to the Irys Quiz!</h2>
            <p>
                Test your knowledge about Irys and programmable data.<br>
                10 questions, one at a time. Good luck!
            </p>
            <button id="start-quiz-btn">Start Quiz</button>
        </div>
    `;
    document.getElementById('start-quiz-btn').onclick = () => {
        current = 0;
        score = 0;
        showQuestion();
    };
}

function showQuestion() {
    document.querySelector('.quiz-container').classList.add('fixed');
    const q = questions[current];
    document.getElementById('quiz').innerHTML = `
        <div class="question">${q.question}</div>
        <div class="answers">
            ${q.answers.map((a, i) => `
                <label>
                    <input type="radio" name="answer" value="${i}"><span>${a}</span>
                </label>
            `).join('')}
        </div>
        <button id="submit-btn">${current === questions.length - 1 ? "Finish" : "Next"}</button>
    `;
    document.getElementById('submit-btn').onclick = submitAnswer;
}

function submitAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return alert("Choose an answer!");
    if (parseInt(selected.value) === questions[current].correct) score++;
    current++;
    if (current < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.querySelector('.quiz-container').classList.remove('fixed');
    const percent = Math.round((score / questions.length) * 100);
    document.getElementById('quiz').innerHTML = `
        <img src="Logo.png" alt="Irys Logo" class="irys-logo-start" />
        <div class="result">
            <h2>Quiz finished!</h2>
            <p>Your score: <b>${score}</b> out of <b>${questions.length}</b> (<b>${percent}%</b>)</p>
            <button id="try-again-btn">Try Again</button>
             <button id="menu">Menu</button>
        </div>
    `;
    document.getElementById('try-again-btn').onclick = () => {
        current = 0;
        score = 0;
        showQuestion()
    };
    document.getElementById('menu').onclick = () => {
    window.location.href = "/Irys_Playground/";
    };
}

// Показываем стартовый экран при загрузке
showQuestion()