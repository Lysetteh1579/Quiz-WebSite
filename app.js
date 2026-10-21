"use strict";

const starterQuizzes = [
  {
    id: "kitchen",
    title: "A little kitchen know-how",
    category: "Everyday",
    description: "The small facts that make dinner-party chat.",
    color: "peach",
    author: "Mara L.",
    questions: [
      { prompt: "Which herb is traditionally used to make pesto?", answers: ["Dill", "Basil", "Mint", "Parsley"], correct: 1 },
      { prompt: "What does al dente mean when pasta is cooked?", answers: ["Very soft", "With a little bite", "Extra salty", "Served cold"], correct: 1 },
      { prompt: "Which of these is a citrus fruit?", answers: ["Apricot", "Clementine", "Plum", "Pear"], correct: 1 },
      { prompt: "What gives a standard loaf of sourdough its rise?", answers: ["Baking soda", "Whipped cream", "A starter culture", "Olive oil"], correct: 2 },
      { prompt: "What is the main ingredient in hummus?", answers: ["Chickpeas", "Lentils", "White beans", "Peas"], correct: 0 },
    ],
  },
  {
    id: "sky",
    title: "Look up: sky & space",
    category: "Curious minds",
    description: "A pocket-sized trip around our corner of the universe.",
    color: "blue",
    author: "Theo R.",
    questions: [
      { prompt: "Which planet has the most prominent rings?", answers: ["Mars", "Saturn", "Venus", "Mercury"], correct: 1 },
      { prompt: "What is the name of our galaxy?", answers: ["Andromeda", "The Milky Way", "Sombrero", "Whirlpool"], correct: 1 },
      { prompt: "What do we call a rock from space that reaches the ground?", answers: ["Meteorite", "Comet", "Asteroid", "Nebula"], correct: 0 },
      { prompt: "Which star is closest to Earth?", answers: ["Sirius", "Polaris", "The Sun", "Vega"], correct: 2 },
    ],
  },
  {
    id: "words",
    title: "Words with a past",
    category: "Wordplay",
    description: "Guess where a few familiar words began.",
    color: "lilac",
    author: "Nina P.",
    questions: [
      { prompt: "Which language gave us the word “ballet”?", answers: ["Italian", "French", "Spanish", "German"], correct: 1 },
      { prompt: "A “bungalow” originally comes from which region?", answers: ["Bengal", "Bavaria", "Brittany", "Bolivia"], correct: 0 },
      { prompt: "What does the Japanese word “karaoke” roughly mean?", answers: ["Empty orchestra", "Quiet song", "Midnight music", "Open stage"], correct: 0 },
      { prompt: "Which language is the origin of “kindergarten”?", answers: ["Dutch", "German", "Swedish", "Danish"], correct: 1 },
    ],
  },
  {
    id: "garden",
    title: "The tiny garden quiz",
    category: "Outdoors",
    description: "For anyone who has ever named a houseplant.",
    color: "green",
    author: "Ari & Jo",
    questions: [
      { prompt: "Which part of a plant usually absorbs water from the soil?", answers: ["Leaves", "Roots", "Petals", "Stem"], correct: 1 },
      { prompt: "What do bees collect from flowers to make honey?", answers: ["Nectar", "Dew", "Pollen only", "Sap"], correct: 0 },
      { prompt: "Which of these is a bulb plant?", answers: ["Tulip", "Daisy", "Fern", "Lavender"], correct: 0 },
      { prompt: "What is the name for a young tree?", answers: ["Sapling", "Seedling", "Sprig", "Shoot"], correct: 0 },
    ],
  },
];

const categories = ["All quizzes", "Everyday", "Curious minds", "Wordplay", "Outdoors", "Just for fun"];
const letters = ["A", "B", "C", "D"];
const storageKey = "lystte-quiz-shelf-v1";

function copyQuiz(quiz) {
  return {
    ...quiz,
    questions: quiz.questions.map((question) => ({
      ...question,
      answers: [...question.answers],
    })),
  };
}

function loadQuizzes() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (Array.isArray(saved) && saved.every((quiz) => quiz && typeof quiz.id === "string" && Array.isArray(quiz.questions))) {
      return [...saved, ...starterQuizzes.filter((starter) => !saved.some((quiz) => quiz.id === starter.id))];
    }
  } catch {
    // A blocked or malformed browser-storage entry should not hide the starter shelf.
  }
  return starterQuizzes.map(copyQuiz);
}

const state = {
  quizzes: loadQuizzes(),
  page: "browse",
  category: "All quizzes",
  search: "",
  draft: null,
  activeQuiz: null,
  playQuestions: [],
  questionIndex: 0,
  chosenAnswers: [],
  showingResult: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const quizGrid = $("#quiz-grid");
const playCard = $("#play-card");
const questionList = $("#question-list");
const saveNotice = $("#save-notice");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function icon(name) {
  const paths = {
    play: '<path d="m9 6 10 6-10 6z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z"/>',
    shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h2.5a6 6 0 0 0 4.2-1.7l6.6-6.6A6 6 0 0 1 19.5 8H22"/><path d="M2 6h2.5a6 6 0 0 1 4.2 1.7l1.2 1.2"/><path d="M14.1 14.1 15.3 15.3A6 6 0 0 0 19.5 17H22"/>',
    back: '<path d="m15 18-6-6 6-6"/><path d="M20 12H9"/>',
    next: '<path d="M4 12h16"/><path d="m13 5 7 7-7 7"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function visibleQuizzes() {
  const query = state.search.trim().toLowerCase();
  return state.quizzes.filter((quiz) => {
    const matchesCategory = state.category === "All quizzes" || quiz.category === state.category;
    const content = `${quiz.title} ${quiz.description} ${quiz.category}`.toLowerCase();
    return matchesCategory && (!query || content.includes(query));
  });
}

function renderCategories() {
  const presentCategories = categories.filter((category) =>
    category === "All quizzes" || state.quizzes.some((quiz) => quiz.category === category),
  );
  const group = $(".category-list");
  group.innerHTML = presentCategories.map((category) => `
    <button class="category-chip${state.category === category ? " is-selected" : ""}"
      data-category="${escapeHTML(category)}" aria-pressed="${state.category === category}">
      ${escapeHTML(category)}
    </button>
  `).join("");
  if (!presentCategories.includes(state.category)) state.category = "All quizzes";
}

function renderBrowse() {
  renderCategories();
  const quizzes = visibleQuizzes();
  $("#quiz-count").textContent = state.quizzes.length;
  quizGrid.innerHTML = quizzes.length ? quizzes.map((quiz, index) => `
    <article class="quiz-card tone-${escapeHTML(quiz.color || "yellow")}">
      <div class="card-meta">
        <span class="card-topic">${escapeHTML(quiz.category)}</span>
        <span class="card-number">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="card-copy">
        <h3 class="display">${escapeHTML(quiz.title)}</h3>
        <p>${escapeHTML(quiz.description || "A few good questions for curious people.")}</p>
      </div>
      <div class="card-foot">
        <div>
          <div class="card-author">${escapeHTML(quiz.author || "A quiz-club friend")}</div>
          <div class="card-length">${quiz.questions.length} questions · 3 min</div>
        </div>
        <div class="card-actions">
          <button class="icon-button" data-action="edit-existing" data-quiz-id="${escapeHTML(quiz.id)}"
            aria-label="Edit ${escapeHTML(quiz.title)}">${icon("edit")}</button>
          <button class="icon-button play-button" data-action="play-quiz" data-quiz-id="${escapeHTML(quiz.id)}"
            aria-label="Play ${escapeHTML(quiz.title)}">${icon("play")}<span>Play</span></button>
        </div>
      </div>
    </article>
  `).join("") : `
    <div class="empty-shelf">
      <h3 class="display">No quizzes on this shelf.</h3>
      <p>Try another topic, or start one of your own.</p>
      <button class="button button-outline" data-action="new-quiz">Make a quiz</button>
    </div>
  `;
}

function goToPage(page) {
  state.page = page;
  $$(".page").forEach((element) => element.classList.toggle("is-hidden", element.dataset.page !== page));
  $$(".nav-link").forEach((element) => element.classList.toggle("is-active", page === "browse"));
  if (page === "browse") renderBrowse();
  if (page === "play") renderPlay();
  if (page === "edit") renderEditor();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function beginQuiz(quiz) {
  if (!quiz || !quiz.questions.length) return;
  state.activeQuiz = copyQuiz(quiz);
  state.playQuestions = copyQuiz(quiz).questions;
  state.questionIndex = 0;
  state.chosenAnswers = Array(state.playQuestions.length).fill(null);
  state.showingResult = false;
  goToPage("play");
}

function shuffleQuestions() {
  for (let index = state.playQuestions.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [state.playQuestions[index], state.playQuestions[other]] =
      [state.playQuestions[other], state.playQuestions[index]];
  }
  state.questionIndex = 0;
  state.chosenAnswers = Array(state.playQuestions.length).fill(null);
  state.showingResult = false;
  renderPlay();
}

function currentScore() {
  return state.playQuestions.reduce((score, question, index) =>
    score + (state.chosenAnswers[index] === question.correct ? 1 : 0), 0);
}

function renderPlay() {
  const quiz = state.activeQuiz;
  if (!quiz) return;
  if (state.showingResult) {
    const score = currentScore();
    const total = state.playQuestions.length;
    const headline = score === total ? "Every one. Lovely." : score >= Math.ceil(total / 2) ? "Nicely done." : "Good questions, right?";
    playCard.innerHTML = `
      <div class="result-view">
        <div class="result-mark" aria-hidden="true">✓</div>
        <span class="eyebrow">That’s a wrap</span>
        <h2 class="display">${headline}</h2>
        <p>You got <strong>${score} out of ${total}</strong> right in <strong>${escapeHTML(quiz.title)}</strong>.</p>
        <div class="result-review">
          ${state.playQuestions.map((question, index) => {
            const correct = state.chosenAnswers[index] === question.correct;
            return `<div class="review-item">
              <span class="review-mark${correct ? " is-right" : ""}" aria-hidden="true">${correct ? "✓" : "×"}</span>
              <div><strong>${escapeHTML(question.prompt)}</strong>
                <div class="review-answer">Answer: ${escapeHTML(question.answers[question.correct] || "")}</div>
              </div>
            </div>`;
          }).join("")}
        </div>
        <div class="result-actions">
          <button class="button button-coral" data-action="play-again">Play again</button>
          <button class="button button-outline" data-action="home">Browse more</button>
        </div>
      </div>
    `;
    return;
  }

  const question = state.playQuestions[state.questionIndex];
  if (!question) return;
  const total = state.playQuestions.length;
  const selected = state.chosenAnswers[state.questionIndex];
  const lettersHTML = question.answers.map((answer, index) => `
    <button type="button" role="radio" aria-checked="${selected === index}"
      class="answer-choice${selected === index ? " is-selected" : ""}"
      data-action="choose-answer" data-answer-index="${index}">
      <span class="answer-letter">${letters[index] || index + 1}</span>
      <span class="answer-text">${escapeHTML(answer || "Answer option")}</span>
    </button>
  `).join("");
  playCard.innerHTML = `
    <div class="play-head">
      <div>
        <p class="play-overline">${escapeHTML(quiz.category)} · ${escapeHTML(quiz.author || "Lystte Quiz")}</p>
        <h1 class="display" id="play-title">${escapeHTML(quiz.title)}</h1>
      </div>
      <button class="shuffle-button" data-action="shuffle" aria-label="Shuffle question order">${icon("shuffle")} Shuffle</button>
    </div>
    <div class="progress-wrap" aria-label="Question ${state.questionIndex + 1} of ${total}">
      <div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${state.questionIndex + 1}">
        <div class="progress-fill" style="width:${((state.questionIndex + 1) / total) * 100}%"></div>
      </div>
      <span class="progress-label">${String(state.questionIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
    </div>
    <p class="question-label">Your question</p>
    <h2 class="question-prompt">${escapeHTML(question.prompt)}</h2>
    <div class="answer-list" role="radiogroup" aria-label="Choose one answer">${lettersHTML}</div>
    <div class="play-controls">
      <button class="quiet-button" data-action="previous" ${state.questionIndex === 0 ? "disabled" : ""}>← Previous</button>
      ${state.questionIndex === total - 1
        ? `<button class="button button-teal" data-action="finish" ${selected === null ? "disabled" : ""}>See my score <span aria-hidden="true">✓</span></button>`
        : `<button class="button button-teal" data-action="next" ${selected === null ? "disabled" : ""}>Next question <span aria-hidden="true">→</span></button>`}
    </div>
  `;
}

function makeNewQuiz() {
  state.draft = {
    id: `my-quiz-${Date.now()}`,
    title: "",
    category: "Everyday",
    description: "",
    color: "peach",
    author: "You",
    questions: [{ prompt: "", answers: ["", "", "", ""], correct: 0 }],
  };
  $("#save-notice").textContent = "";
  goToPage("edit");
}

function editExistingQuiz(id) {
  const quiz = state.quizzes.find((item) => item.id === id);
  if (!quiz) return;
  state.draft = copyQuiz(quiz);
  $("#save-notice").textContent = "";
  goToPage("edit");
}

function renderEditor() {
  if (!state.draft) return;
  $("#edit-title-input").value = state.draft.title;
  $("#edit-category").value = state.draft.category;
  $("#edit-description").value = state.draft.description || "";
  $("#question-count").textContent = state.draft.questions.length;
  $("#bottom-question-count").textContent = `${state.draft.questions.length} ${state.draft.questions.length === 1 ? "question" : "questions"}`;
  questionList.innerHTML = state.draft.questions.map((question, questionIndex) => `
    <article class="question-editor" data-question-index="${questionIndex}">
      <div class="question-editor-top">
        <span class="question-number" aria-label="Question ${questionIndex + 1}">${String(questionIndex + 1).padStart(2, "0")}</span>
        ${state.draft.questions.length > 1
          ? `<button class="remove-question" data-action="remove-question" data-question-index="${questionIndex}">Remove question</button>`
          : ""}
      </div>
      <label class="visually-hidden" for="prompt-${questionIndex}">Question ${questionIndex + 1} text</label>
      <textarea id="prompt-${questionIndex}" class="question-input" data-field="prompt" rows="2" maxlength="180"
        placeholder="Write the question…">${escapeHTML(question.prompt)}</textarea>
      <div class="answer-editor-grid">
        ${question.answers.map((answer, answerIndex) => `
          <div class="answer-editor${question.correct === answerIndex ? " is-correct" : ""}">
            <button type="button" class="correct-button" data-action="correct-answer" data-question-index="${questionIndex}"
              data-answer-index="${answerIndex}" aria-pressed="${question.correct === answerIndex}"
              aria-label="Mark answer ${letters[answerIndex]} as correct">
              ${question.correct === answerIndex ? "✓" : letters[answerIndex]}
            </button>
            <label class="visually-hidden" for="answer-${questionIndex}-${answerIndex}">Question ${questionIndex + 1}, answer ${letters[answerIndex]}</label>
            <input id="answer-${questionIndex}-${answerIndex}" class="answer-input" data-field="answer" data-answer-index="${answerIndex}"
              maxlength="100" value="${escapeHTML(answer)}" placeholder="Answer ${letters[answerIndex]}" />
          </div>
        `).join("")}
      </div>
      <p class="helper-text">Tap the letter to mark the correct answer.</p>
    </article>
  `).join("");
}

function readDraftFields() {
  if (!state.draft) return;
  state.draft.title = $("#edit-title-input").value;
  state.draft.category = $("#edit-category").value;
  state.draft.description = $("#edit-description").value;
  $$(".question-editor").forEach((card, questionIndex) => {
    const question = state.draft.questions[questionIndex];
    if (!question) return;
    question.prompt = card.querySelector('[data-field="prompt"]').value;
    card.querySelectorAll('[data-field="answer"]').forEach((input) => {
      question.answers[Number(input.dataset.answerIndex)] = input.value;
    });
  });
}

function saveQuiz() {
  readDraftFields();
  const notice = $("#save-notice");
  const quiz = state.draft;
  if (!quiz.title.trim()) {
    notice.textContent = "Give your quiz a title before saving.";
    $("#edit-title-input").focus();
    return;
  }
  const questions = quiz.questions.filter((question) => question.prompt.trim());
  if (!questions.length) {
    notice.textContent = "Add at least one question before saving.";
    return;
  }
  const incomplete = questions.find((question) => question.answers.some((answer) => !answer.trim()));
  if (incomplete) {
    notice.textContent = "Fill in all four answer choices for each question.";
    return;
  }

  const savedQuiz = { ...quiz, author: quiz.author || "You", questions: copyQuiz({ ...quiz, questions }).questions };
  const exists = state.quizzes.some((item) => item.id === savedQuiz.id);
  state.quizzes = exists
    ? state.quizzes.map((item) => item.id === savedQuiz.id ? savedQuiz : item)
    : [savedQuiz, ...state.quizzes];
  state.draft = copyQuiz(savedQuiz);
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.quizzes));
    notice.textContent = "Saved to your little quiz shelf.";
  } catch {
    notice.textContent = "Saved for this visit, but browser storage is unavailable.";
  }
  renderEditor();
  $("#save-notice").textContent = notice.textContent;
}

function randomizeQuiz() {
  if (!state.quizzes.length) return;
  const candidates = state.quizzes.filter((quiz) => quiz.questions.length);
  if (!candidates.length) return;
  beginQuiz(candidates[Math.floor(Math.random() * candidates.length)]);
}

function onAction(event) {
  const button = event.target.closest("[data-action]");
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderBrowse();
    return;
  }
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === "home") goToPage("browse");
  if (action === "new-quiz") makeNewQuiz();
  if (action === "surprise") randomizeQuiz();
  if (action === "play-quiz") beginQuiz(state.quizzes.find((quiz) => quiz.id === button.dataset.quizId));
  if (action === "edit-existing") editExistingQuiz(button.dataset.quizId);
  if (action === "shuffle") shuffleQuestions();
  if (action === "choose-answer") {
    state.chosenAnswers[state.questionIndex] = Number(button.dataset.answerIndex);
    renderPlay();
    playCard.querySelector(".answer-choice.is-selected")?.focus();
  }
  if (action === "next" && state.chosenAnswers[state.questionIndex] !== null) {
    state.questionIndex += 1;
    renderPlay();
    playCard.querySelector(".question-prompt")?.focus();
  }
  if (action === "previous" && state.questionIndex > 0) {
    state.questionIndex -= 1;
    renderPlay();
  }
  if (action === "finish" && state.chosenAnswers[state.questionIndex] !== null) {
    state.showingResult = true;
    renderPlay();
  }
  if (action === "play-again") beginQuiz(state.activeQuiz);
  if (action === "save-quiz") saveQuiz();
  if (action === "add-question") {
    readDraftFields();
    state.draft.questions.push({ prompt: "", answers: ["", "", "", ""], correct: 0 });
    renderEditor();
    questionList.lastElementChild?.querySelector(".question-input")?.focus();
  }
  if (action === "remove-question") {
    readDraftFields();
    state.draft.questions.splice(Number(button.dataset.questionIndex), 1);
    renderEditor();
  }
  if (action === "correct-answer") {
    readDraftFields();
    state.draft.questions[Number(button.dataset.questionIndex)].correct = Number(button.dataset.answerIndex);
    renderEditor();
  }
}

document.addEventListener("click", onAction);
document.addEventListener("input", (event) => {
  if (event.target.id === "quiz-search") {
    const cursor = event.target.selectionStart;
    state.search = event.target.value;
    renderBrowse();
    const searchField = $("#quiz-search");
    searchField.focus();
    searchField.setSelectionRange(cursor, cursor);
  }
  if (state.page === "edit" && event.target.closest(".question-editor")) readDraftFields();
  if (state.page === "edit" && ["edit-title-input", "edit-description"].includes(event.target.id)) readDraftFields();
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-category]")) {
    state.category = event.target.dataset.category;
    renderBrowse();
  }
  if (state.page === "edit" && ["edit-category"].includes(event.target.id)) readDraftFields();
});

renderBrowse();
