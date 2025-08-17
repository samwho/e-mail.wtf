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

const questions: QuizQuestion[] = [
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
    "That's actually allowed for some reason. The spaces get ignored by the spec. My email client rejects this, though."
  ),
  invalid(
    "trailing-dot.@example.com",
    "The local part cannot start or end with a dot. Dots in the middle are fine."
  ),
  valid(
    "fed-up-yet@ example.com ",
    "Similar to the local part, the domain part can also have spaces around it. Not allowed in the middle, though, that would be silly."
  ),
  valid(
    "normal(wtf is this?)@example.com",
    "Technically valid. Did you know emails could have comments? Anything (in parens) is a comment. Introduced in RFC 822, but made obsolete by RFC 5322."
  ),
  invalid(
    "(@)@example.com",
    "Comments don't count as part of the email address, so this is invalid for having no local part."
  ),
  valid(
    '":(){ :|:& };:"@example.com',
    "Provided you put quotes around it, you can indeed have a <a href='https://en.wikipedia.org/wiki/Fork_bomb'>fork bomb</a> as your email address. The quotes don't end up as part of the email address."
  ),
  valid(
    '""@example.com',
    "While an empty local part due to comments is invalid, an empty local part due to quotes is valid. I don't know why."
  ),
  invalid(
    "according-to-all-known-laws-of-aviation-there-is-no-way-a-bee-should-be-able-to-fly-its-wings-are-too-small-to-get-its-fat-little-body-off-the-ground-the-bee-of-course-flies-anyway-because-bees-don-t-care-what-humans-think-is-impossible-yellow-black-yellow-black-yellow-black-yellow-black-ooh-black-and-yellow-let-s-shake-it-up-a-little-barry-breakfast-is-ready-coming-hang-on-a-second-hello-barry-adam-can-you-believe-this-is-happening-i-can-t-i-ll-pick-you-up-looking-sharp-use-the-stairs-your-father-paid-good-money-for-those-sorry-i-m-excited-here-s-the-graduate-we-re-very-proud-of-you-son-a-perfect-report-card-all-b-s-very-proud-ma-i-got-a-thing-going-here-you-got-lint-on-your-fuzz-ow-that-s-me-wave-to-us-we-ll-be-in-row-118-000-bye-barry-i-told-you-stop-flying-in-the-house-hey-adam-hey-barry-is-that-fuzz-gel-a-little-special-day-graduation-never-thought-i-d-make-it-three-days-grade-school-three-days-high-school-those-were-awkward-three-days-college-i-m-glad-i-took-a-day-and-hitchhiked-around-the-hive-you-did-come-back-different-hi-barry-artie-growing-a-mustache-looks-good-hear-about-frankie-yeah-you-going-to-the-funeral-no-i-m-not-going-everybody-knows-sting-someone-you-die-don-t-waste-it-on-a-squirrel-such-a-hothead-i-guess-he-could-have-just-gotten-out-of-the-way-i-love-this-incorporating-an-amusement-park-into-our-day-that-s-why-we-don-t-need-vacations-boy-quite-a-bit-of-pomp-under-the-circumstances-well-adam-today-we-are-men-we-are-bee-men-amen-hallelujah-students-faculty-distinguished-bees-please-welcome-dean-buzzwell-welcome-new-hive-city-graduating-class-of-9-15-that-concludes-our-ceremonies-and-begins-your-career-at-honex-industries-will-we-pick-our-job-today-i-heard-it-s-just-orientation-heads-up-here-we-go-keep-your-hands-and-antennas-inside-the-tram-at-all-times-wonder-what-it-ll-be-like-a-little-scary-welcome-to-honex-a-division-of-honesco-and-a-part-of-the-hexagon-group-this-is-it-wow-wow-we-know-that-you-as-a-bee-have-worked-your-whole-life-to-get-to-the-point-where-you-can-work-for-your-whole-life-honey-begins-when-our-valiant-pollen-jocks-bring-the-nectar-to-the-hive-our-top-secret-formula-is-automatically-color-corrected-scent-adjusted-and-bubble-contoured-into-this-soothing-sweet-syrup-with-its-distinctive-golden-glow-you-know-as-honey-that-girl-was-hot-she-s-my-cousin-she-is-yes-we-re-all-cousins-right-you-re-right-at-honex-we-constantly-strive-to-improve-every-aspect-of-bee-existence-these-bees-are-stress-testing-a-new-helmet-technology-what-do-you-think-he-makes-not-enough-here-we-have-our-latest-advancement-the-krelman-what-does-that-do-catches-that-little-strand-of-honey-that-hangs-after-you-pour-it-saves-us-millions-can-anyone-work-on-the-krelman-of-course-most-bee-jobs-are-small-ones@example.com",
    "RFC 5322 limits the line length of headers to 998 characters, so you can only fit the first ~2.5 minutes of the Bee Movie script before it's too long.",
    ["long"]
  ),
  valid(
    "magic@[::1]",
    "The square bracket syntax allows you to specify IP addresses instead of domains, and ::1 is the shorthand for localhost in IPv6."
  ),
  valid(
    "poop@[💩]",
    "Actually they kinda just let you do anything. As far as I can tell from reading RFC 6532, this is valid. lol. lmao, even."
  ),
  valid("👉@👈", "Yeah, I can't believe it either."),
  valid(
    '"@"@[@]',
    "You should complain to your provider if they don't allow you to send mail to this one."
  ),
  valid(
    `"'()'"("''")@example.com`,
    "This ends up being interpreted as <code>'()'@example.com</code>, which is totally valid."
  ),
  invalid(
    "i...wonder@example.com",
    "Consecutive dots aren't allowed anywhere outside of quotes."
  ),
  valid(
    "c̷̨̈́i̵̮̅l̶̠̐͊͝ȁ̷̠̗̆̍̍n̷͖̘̯̍̈͒̅t̶͍͂͋ř̵̞͈̓ȯ̷̯̠-̸͚̖̟͋s̴͉̦̭̔̆̃͒û̵̥̪͆̒̕c̸̨̨̧̺̎k̵̼͗̀s̸̖̜͍̲̈́͋̂͠@example.com",
    "Thanks to RFC 6532, <a href='https://en.wikipedia.org/wiki/Zalgo_text'>Zalgo text</a> is a-okay."
  ),
];

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

function startQuiz(): void {
  document.getElementById("startScreen")?.classList.add("hidden");
  document.getElementById("quizScreen")?.classList.remove("hidden");
  const totalQuestionsEl = document.getElementById("totalQuestions");
  if (totalQuestionsEl) {
    totalQuestionsEl.textContent = questions.length.toString();
  }
  showQuestion();
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

  const numValidQuestions = questions.filter(
    (q) => q.answer === "valid"
  ).length;
  const numInvalidQuestions = questions.filter(
    (q) => q.answer === "invalid"
  ).length;

  if (score === numValidQuestions) {
    message =
      'This is the score you get when you answer "valid" for every question. Good job.';
  } else if (score === numInvalidQuestions) {
    message =
      'This is the score you get when you answer "invalid" for every question. Should have said "valid".';
  } else if (percentage === 100) {
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

  if (startScreen) {
    startScreen.classList.remove("hidden");
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
