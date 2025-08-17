import { div } from "./dom";

interface QuizQuestion {
  email: string;
  answer: "valid" | "invalid";
  explanation: string;
  classes?: string[];
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
function valid(
  email: string,
  explanation: string,
  classes?: string[]
): QuizQuestion {
  return { email: formatEmail(email), answer: "valid", explanation, classes };
}

function invalid(
  email: string,
  explanation: string,
  classes?: string[]
): QuizQuestion {
  return { email: formatEmail(email), answer: "invalid", explanation, classes };
}

function formatEmail(email: string) {
  return email
    .replaceAll(" ", "<span class='space'>␣</span>")
    .replaceAll("\n", "<span class='space'>\n</span>");
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
    "This is technically valid but considered obsolete. RFC 822 allowed domains without dots, but RFC 2822 made this obsolete."
  ),
  invalid(
    "what about spaces@example.com",
    "Spaces aren't allowed between words. I'll be using the ␣ character to make spaces obvious."
  ),
  valid(
    " maybe-like-this @example.com",
    "That's actually allowed for some reason. The spaces should be ignored. My email client doesn't like this."
  ),
  invalid(
    "tailing-dot.@example.com",
    "The local part cannot start or end with a dot. Dots in the middle are fine."
  ),
  valid(
    "fed-up-yet@ example.com ",
    "Similar to the local part, the domain part can also have spaces around it. Not allowed in the middle, though."
  ),
  valid(
    "hello(wtf is this?)@samwho.dev",
    "Technically valid. Did you know emails can have comments? Anything (in parens) is a comment. Introduced in RFC 822, obsoleted by RFC 5322."
  ),
  valid(
    '":(){ :|:& };:"@example.com',
    "Provided you put quotes around it, you can indeed have a <a href='https://en.wikipedia.org/wiki/Fork_bomb'>fork bomb</a> as your email address."
  ),
  invalid(
    "accordingtoallknownlawsofaviationthereisnowayabeeshouldbeabletoflyitswingsaretoosmalltogetitsfatlittlebodyoffthegroundthebeeofcoursefliesanywaybecausebeesdontcarewhathumansthinkisimpossibleyellowblackyellowblackyellowblackyellowblackoohblackandyellowletsshakeitupalittlebarrybreakfastisreadycominghangonasecondhellobarryadamcanyoubelievethisishappeningicantillpickyouuplookingsharpusethestairsyourfatherpaidgoodmoneyforthosesorryimexcitedheresthegraduatewereveryproudofyousonaperfectreportcardallbsveryproudmaigotathinggoinghereyougotlintonyourfuzzowthatsmewavetouswellbeinrow118000byebarryitoldyoustopflyinginthehouseheyadamheybarryisthatfuzzgelalittlespecialdaygraduationneverthoughtidmakeitthreedaysgradeschoolthreedayshighschoolthosewerea@example.com",
    "RFC 5322 limits length lengths in email headers to 998 characters, so you can only fit the first ~2.5 minutes of the Bee Movie script before it's too long.",
    ["long"]
  ),
  valid(
    "magic@[::1]",
    "The square bracket syntax allows you to specify IP addresses instead of domains, and ::1 is the shorthand for localhost in IPv6."
  ),
  valid(
    "poop@[💩]",
    "As far as I can tell from reading RFC 6532, this is valid. lol. lmao, even."
  ),
  valid("👉@👈", "I can't believe it, either."),
  valid(
    '"@"@[@]',
    "You should complain to your provider if they don't allow you to send mail to this one."
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

  const currentQuestionEl = document.getElementById("currentQuestion")!;
  const emailContainer = document.getElementById("emailContainer")!;
  const emailDisplayEl = document.getElementById("emailDisplay")!;

  currentQuestionEl.textContent = (currentQuestionIndex + 1).toString();
  emailDisplayEl.innerHTML = question.email;

  emailContainer.className = "email-container";
  if (question.classes) {
    emailContainer.classList.add(...question.classes);
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
    message = "Good lord, did you sit and read all of the RFCs? Go outside.";
  } else if (percentage >= 80) {
    message = "You really shouldn't be scoring this high.";
  } else if (percentage >= 60) {
    message = "Yay! You're slightly above average!";
  } else if (percentage >= 40) {
    message =
      "Yay! You're average! Time to start making plans for what you'll do when an LLM takes your job.";
  } else if (percentage >= 20) {
    message =
      "This is embarassing, isn't it? I won't tell anyone if you don't.";
  } else if (percentage >= 0) {
    message =
      "This is impressively bad. You had to overcome serious odds to score this low. Well done.";
  }

  const resultMessageEl = document.getElementById("resultMessage");
  if (resultMessageEl) {
    resultMessageEl.textContent = message;
  }

  const shareText = `I scored ${score}/${questions.length} on https://e-mail.wtf and all I got was this lousy text to share on social media.`;
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareMessage)
          .then(() => {
            showToast("Results copied to clipboard!");
          })
          .catch(() => {
            fallbackCopyToClipboard(shareMessage);
          });
      } else {
        fallbackCopyToClipboard(shareMessage);
      }
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
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(shareMessage)
            .then(() => {
              showToast("Results copied to clipboard!");
            })
            .catch(() => {
              fallbackCopyToClipboard(shareMessage);
            });
        } else {
          fallbackCopyToClipboard(shareMessage);
        }
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

function fallbackCopyToClipboard(text: string): void {
  // Create a temporary textarea element
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showToast("Results copied to clipboard!");
  } catch (err) {
    showToast("Could not copy to clipboard");
  }

  document.body.removeChild(textArea);
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

  startQuiz();
  showResults();
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
