// Email validation quiz TypeScript
import { div } from "./dom.js";

interface QuizQuestion {
  email: string;
  answer: "valid" | "invalid";
  explanation: string;
}

// Theme management
function getTheme(): string {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }

  return "dark";
}

function setTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme(): void {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

// Make toggle function globally available
(window as any).toggleTheme = toggleTheme;

// Helper functions for creating quiz questions
function valid(email: string, explanation: string): QuizQuestion {
  return { email, answer: "valid", explanation };
}

function invalid(email: string, explanation: string): QuizQuestion {
  return { email, answer: "invalid", explanation };
}

// Quiz functionality
const rawQuestions: QuizQuestion[] = [
  valid("easy@example.com", "No tricks here, just easing you into it."),
  valid(
    "easy+tag@example.com",
    "The + symbol is allowed, and email servers often treat is specially by ignoring anything after it. Very useful!"
  ),
  invalid("easy@", "Can't have an email address without a domain."),
  invalid("@example.com", "Nor can you have one without a local part."),
  valid(
    "easy@example",
    "Surprisingly, this is valid! Top-level domains are not required by RFC 5322."
  ),
  valid(
    '"test@test"@example.com',
    "Quoted strings in the local part can contain @ symbols and other special characters."
  ),
  invalid(
    "user..name@example.com",
    "Consecutive dots are not allowed in the local part."
  ),
  invalid(".user@example.com", "The local part cannot start with a dot."),
  invalid("user.@example.com", "The local part cannot end with a dot."),
  invalid("user@ex ample.com", "Spaces are not allowed in the domain part."),
  valid(
    "very.long.email.address.that.keeps.going.and.going@example.com",
    "Long email addresses are valid as long as they don't exceed 320 characters total."
  ),
  valid(
    "user@example.com.",
    "A trailing dot in the domain is valid (it represents the DNS root)."
  ),
  valid(
    "user@[192.168.1.1]",
    "IP addresses in square brackets are valid domain formats."
  ),
  valid(
    "user+tag+another@example.com",
    "Multiple plus signs and tags are perfectly valid."
  ),
  valid(
    '"spaces in quotes"@example.com',
    "Quoted strings can contain spaces and many special characters."
  ),
];

// Quiz state
let questions: QuizQuestion[] = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = false;

// URL parameter helpers
function getUrlParams(): { q?: number; a?: number } {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const a = params.get("a");
  return {
    q: q ? parseInt(q) - 1 : undefined, // Convert to 0-based index
    a: a ? parseInt(a) - 1 : undefined, // Convert to 0-based index
  };
}

function updateUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("q", (currentQuestionIndex + 1).toString()); // Convert to 1-based
  if (answered) {
    const selectedOption = document.querySelector(".option.selected");
    if (selectedOption) {
      const index = Array.from(selectedOption.parentNode!.children).indexOf(
        selectedOption
      );
      url.searchParams.set("a", (index + 1).toString()); // Convert to 1-based
    }
  } else {
    url.searchParams.delete("a");
  }
  window.history.replaceState({}, "", url.toString());
}

function initializeQuiz(): void {
  questions = [...rawQuestions];
}

function startQuiz(): void {
  initializeQuiz();

  // Check for URL parameters
  const { q, a } = getUrlParams();
  if (q !== undefined && q >= 0 && q < questions.length) {
    currentQuestionIndex = q;
  }

  document.getElementById("startScreen")?.classList.add("hidden");
  document.getElementById("quizScreen")?.classList.remove("hidden");
  const totalQuestionsEl = document.getElementById("totalQuestions");
  if (totalQuestionsEl) {
    totalQuestionsEl.textContent = questions.length.toString();
  }
  showQuestion();

  // If there's an answer parameter, auto-select it
  if (a !== undefined && a >= 0 && a <= 1) {
    setTimeout(() => selectOption(a), 100); // Small delay to ensure DOM is ready
  }
}

function showQuestion(): void {
  const question = questions[currentQuestionIndex];
  if (!question) return;

  const currentQuestionEl = document.getElementById("currentQuestion");
  const emailDisplayEl = document.getElementById("emailDisplay");

  if (currentQuestionEl) {
    currentQuestionEl.textContent = (currentQuestionIndex + 1).toString();
  }

  if (emailDisplayEl) {
    emailDisplayEl.textContent = question.email;
  }

  const optionsContainer = document.getElementById("options");
  if (optionsContainer) {
    optionsContainer.innerHTML = "";

    const options = ["Valid", "Invalid"];
    options.forEach((option, index) => {
      const optionDiv = div(
        { className: "option", onclick: () => selectOption(index) },
        div({ className: "option-key" }, (index + 1).toString()),
        div({ className: "option-text" }, option)
      );
      optionsContainer.appendChild(optionDiv);
    });
  }

  const explanation = document.getElementById("explanation");
  if (explanation) {
    explanation.classList.remove("correct", "incorrect");
    explanation.style.visibility = "hidden";
  }

  document.getElementById("nextButton")?.classList.add("hidden");

  answered = false;
  updateUrl();
}

function selectOption(index: number): void {
  if (answered) return;

  answered = true;
  const question = questions[currentQuestionIndex];
  if (!question) return;

  const options = document.querySelectorAll(".option");

  if (options[index]) {
    options[index].classList.add("selected");
  }

  const options_array = ["valid", "invalid"];
  const selectedAnswer = options_array[index];
  const isCorrect = selectedAnswer === question.answer;
  const correctIndex = question.answer === "valid" ? 0 : 1;

  if (isCorrect) {
    if (options[index]) {
      options[index].classList.add("correct");
    }
    score++;
  } else {
    if (options[index]) {
      options[index].classList.add("incorrect");
    }
    const correctOption = options[correctIndex];
    if (correctOption) {
      correctOption.classList.add("correct");
    }
  }

  options.forEach((option) => option.classList.add("disabled"));

  const explanation = document.getElementById("explanation");
  if (explanation) {
    explanation.innerHTML = `<p>${question.explanation}</p>`;
    explanation.style.visibility = "visible";
    explanation.classList.add(isCorrect ? "correct" : "incorrect");
  }

  document.getElementById("nextButton")?.classList.remove("hidden");
  updateUrl();
}

function nextQuestion(): void {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults(): void {
  document.getElementById("quizScreen")?.classList.add("hidden");
  document.getElementById("resultsScreen")?.classList.remove("hidden");

  const correctCountEl = document.getElementById("correctCount");
  const totalCountEl = document.getElementById("totalCount");

  if (correctCountEl) correctCountEl.textContent = score.toString();
  if (totalCountEl) totalCountEl.textContent = questions.length.toString();

  const percentage = Math.round((score / questions.length) * 100);
  let message = "";

  if (percentage === 100) {
    message = "Perfect! You clearly know your email validation specs.";
  } else if (percentage >= 80) {
    message = "Excellent! You have a solid understanding of email validation.";
  } else if (percentage >= 60) {
    message = "Good job! Email validation is trickier than most people think.";
  } else if (percentage >= 40) {
    message = "Not bad, but email validation has some surprising edge cases!";
  } else {
    message =
      "Email validation is full of surprises. The RFC 5322 spec might shock you!";
  }

  const resultMessageEl = document.getElementById("resultMessage");
  if (resultMessageEl) {
    resultMessageEl.textContent = message;
  }

  const shareText = `I scored ${score}/${questions.length} on the email validation quiz at https://e-mail.wtf - how well do you know email validation?`;
  const shareMessageEl = document.getElementById("shareMessage");
  if (shareMessageEl) {
    shareMessageEl.textContent = shareText;
  }

  window.history.replaceState({}, "", window.location.pathname);
}

function copyShareMessage(): void {
  const shareMessageEl = document.getElementById("shareMessage");
  if (shareMessageEl) {
    const shareMessage = shareMessageEl.textContent;
    if (shareMessage) {
      navigator.clipboard.writeText(shareMessage);
      showToast("Results copied to clipboard!");
    }
  }
}

function shareResults(): void {
  const shareMessageEl = document.getElementById("shareMessage");
  if (shareMessageEl) {
    const shareMessage = shareMessageEl.textContent;
    if (shareMessage) {
      if (navigator.share) {
        navigator.share({
          text: shareMessage,
        });
      } else {
        navigator.clipboard.writeText(shareMessage);
        showToast("Results copied to clipboard!");
      }
    }
  }
}

function showToast(message: string): void {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Global functions for HTML onclick handlers
(window as any).startQuiz = startQuiz;
(window as any).selectOption = selectOption;
(window as any).nextQuestion = nextQuestion;
(window as any).copyShareMessage = copyShareMessage;
(window as any).shareResults = shareResults;

// Initialize theme and set up event listeners for quiz
document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme());

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    });
  }

  // Initialize quiz if on quiz page
  const startScreen = document.getElementById("startScreen");
  const { q } = getUrlParams();

  if (startScreen) {
    startScreen.classList.remove("hidden");
  }

  // Auto-start quiz if there's a question parameter
  if (q !== undefined) {
    startQuiz();
  }
});

// Keyboard event handlers for quiz
document.addEventListener("keydown", (e) => {
  const quizScreen = document.getElementById("quizScreen");
  if (quizScreen && !quizScreen.classList.contains("hidden")) {
    if (e.key >= "1" && e.key <= "2" && !answered) {
      selectOption(parseInt(e.key) - 1);
    } else if ((e.key === "Enter" || e.key === " ") && answered) {
      e.preventDefault();
      nextQuestion();
    }
  }
});
