import Reveal from "/praesentation/vendor/reveal/reveal.mjs";
import RevealNotes from "/praesentation/vendor/reveal/plugin/notes.mjs";

// Same string as PRESENTATION_MESSAGE in src/lib/presentation.ts.
const PRESENTATION_MESSAGE = "studicompass:presentation-key";

// Positions on the course line: start triangle, the four phases, finish circle.
const STOPS = {
  start: 0,
  entdecken: 1,
  definieren: 2,
  loesen: 3,
  prototyping: 4,
  ziel: 5,
};

const course = document.querySelector(".course");
const dots = [...course.querySelectorAll(".course-stop")];
const frame = document.querySelector("#demo-app");
const still = document.querySelector("#demo-still");

function showCourse(slide) {
  const stop = STOPS[slide.dataset.phase];
  course.dataset.layout = slide.dataset.course ?? "top";
  course.hidden = stop === undefined;
  if (stop === undefined) return;
  course.style.setProperty("--stop", String(stop));
  dots.forEach((dot, index) => {
    dot.dataset.state =
      index < stop ? "done" : index === stop ? "current" : "planned";
  });
}

await Reveal.initialize({
  width: 1920,
  height: 1080,
  margin: 0,
  minScale: 0.1,
  maxScale: 4,
  center: false,
  controls: false,
  progress: false,
  hash: true,
  transition: "none",
  backgroundTransition: "none",
  plugins: [RevealNotes],
});

// The speaker view renders the deck twice as a preview. Without this, three copies of the app would share one
// localStorage; the previews get a still image, and the real demo stays loaded across slide changes.
if (Reveal.isSpeakerNotes()) {
  still.hidden = false;
  frame.remove();
} else {
  frame.src = "/?praesentation=1";
}

showCourse(Reveal.getCurrentSlide());

Reveal.on("slidechanged", (event) => {
  showCourse(event.currentSlide);
  // Coming back from the demo, the keys have to reach the slides again.
  if (event.previousSlide?.dataset.phase === "demo") {
    document.activeElement?.blur();
    window.focus();
  }
});

window.addEventListener("message", (event) => {
  if (
    event.origin !== window.location.origin ||
    event.source !== frame.contentWindow ||
    event.data?.type !== PRESENTATION_MESSAGE
  ) {
    return;
  }
  if (event.data.key === "PageDown") Reveal.next();
  if (event.data.key === "PageUp") Reveal.prev();
});
