const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwC4PBF31rw7ZlSRoJT8nnI2H9xSVo9ned514N1FEEMPKMNvqPSNd9F2i5C0r1x-C_l_w/exec";
const EVENT_DATE = new Date("2026-07-25T19:00:00+02:00");
const EVENT_ID = "40-hoces";
const DRINKS_PER_PERSON = 2;
const MAX_TOTAL_PEOPLE = 80;
const LOCAL_STORAGE_KEY = "cumple40HocesResponses";

const form = document.querySelector("#drinkForm");
const guestCountInputs = [...document.querySelectorAll("#adultCount, #childCount, #babyCount")];
const drinkCounter = document.querySelector("#drinkCounter");
const formStatus = document.querySelector("#formStatus");
const storageNote = document.querySelector("#storageNote");
const drinkFieldset = document.querySelector("#drinkFieldset");
const drinkPlaceholder = document.querySelector("#drinkPlaceholder");
const thankYouPanel = document.querySelector("#thankYouPanel");
const submitButton = document.querySelector("#submitButton");
const submitButtonText = submitButton.querySelector(".button-text");
const drinkInputs = [...document.querySelectorAll('input[name="bebidas"]')];
const daysEl = document.querySelector("#days");
const hoursEl = document.querySelector("#hours");
const minutesEl = document.querySelector("#minutes");
const audioToggle = document.querySelector("#audioToggle");
const bgMusic = document.querySelector("#bgMusic");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let isSubmitting = false;

function selectedDrinks() {
  return drinkInputs.filter((i) => i.checked).map((i) => i.value);
}

function parseCount(input) {
  if (!input.value) return 0;
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) ? value : Number.NaN;
}

function guestCounts() {
  const adultos = parseCount(document.querySelector("#adultCount"));
  const ninos = parseCount(document.querySelector("#childCount"));
  const bebes = parseCount(document.querySelector("#babyCount"));
  return { adultos, ninos, bebes, total: adultos + ninos + bebes };
}

function drinkEligibleCount() {
  const c = guestCounts();
  return c.adultos + c.ninos;
}

function maxDrinkSelections() {
  return drinkEligibleCount() * DRINKS_PER_PERSON;
}

function hasValidGuestCount() {
  const c = guestCounts();
  const values = [c.adultos, c.ninos, c.bebes];
  return values.every((v) => Number.isInteger(v) && v >= 0 && v <= 20)
    && c.total >= 1
    && c.total <= MAX_TOTAL_PEOPLE;
}

function setStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", type === "error");
  formStatus.classList.toggle("is-success", type === "success");
}

function showThankYou() {
  form.hidden = true;
  const formCopy = document.querySelector(".form-copy");
  if (formCopy) formCopy.hidden = true;
  document.querySelector(".form-section").classList.add("is-submitted");
  thankYouPanel.hidden = false;
  thankYouPanel.focus({ preventScroll: true });
  thankYouPanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setSubmitting(submitting) {
  isSubmitting = submitting;
  submitButton.disabled = submitting;
  submitButton.classList.toggle("is-loading", submitting);
  submitButtonText.textContent = submitting ? "Enviando..." : "Apuntarme al panal";

  [...form.elements].forEach((el) => {
    if (el !== submitButton) el.disabled = submitting;
  });
}

function updateDrinkLimit() {
  const valid = hasValidGuestCount();
  const max = valid ? maxDrinkSelections() : 0;

  if (!valid || max === 0) {
    drinkFieldset.hidden = true;
    drinkPlaceholder.hidden = false;
    drinkPlaceholder.textContent = valid
      ? "Los bebés no piden bebidas. Añade adultos o niños para elegir."
      : "Primero di cuántos venís. Luego pides veneno.";
    drinkInputs.forEach((i) => {
      i.checked = false;
      i.disabled = false;
      i.closest(".drink-option").classList.remove("is-disabled");
    });
    drinkCounter.textContent = `0/${max} bebidas seleccionadas`;
    return;
  }

  drinkFieldset.hidden = false;
  drinkPlaceholder.hidden = true;

  const checked = drinkInputs.filter((i) => i.checked);
  checked.slice(max).forEach((i) => { i.checked = false; });

  const selectedCount = selectedDrinks().length;
  drinkCounter.textContent = `${selectedCount}/${max} bebidas seleccionadas`;

  drinkInputs.forEach((i) => {
    const shouldDisable = !i.checked && selectedCount >= max;
    i.disabled = shouldDisable;
    i.closest(".drink-option").classList.toggle("is-disabled", shouldDisable);
  });
}

function saveLocally(payload) {
  const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  stored.push(payload);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stored));
}

async function submitToSheet(payload) {
  await fetch(FORM_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

function updateStorageNote() {
  storageNote.textContent = FORM_ENDPOINT
    ? "Las respuestas se mandan a la hoja del Sr. Hoces."
    : "Modo prueba: solo se guardan en este navegador.";
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isSubmitting) return;

  setStatus("");
  const formData = new FormData(form);
  const drinks = selectedDrinks();
  const max = maxDrinkSelections();

  if (!hasValidGuestCount()) {
    setStatus("Falta decir cuántos venís.", "error");
    return;
  }
  if (max > 0 && drinks.length === 0) {
    setStatus("Elige al menos una bebida (o aguanta sed).", "error");
    return;
  }
  if (drinks.length > max) {
    setStatus(`Máximo ${max} bebidas, no seas codicioso.`, "error");
    return;
  }

  const payload = {
    createdAt: new Date().toISOString(),
    evento: EVENT_ID,
    nombre: String(formData.get("nombre") || "").trim(),
    adultos: Number.parseInt(formData.get("adultos") || "0", 10),
    ninos: Number.parseInt(formData.get("ninos") || "0", 10),
    bebes: Number.parseInt(formData.get("bebes") || "0", 10),
    asistentes: guestCounts().total,
    bebidas: drinks,
    comentarios: String(formData.get("comentarios") || "").trim(),
    source: window.location.href,
  };

  try {
    setSubmitting(true);
    if (FORM_ENDPOINT) {
      await submitToSheet(payload);
      setStatus("¡Apuntado al panal!", "success");
    } else {
      saveLocally(payload);
      setStatus("Guardado en modo prueba.", "success");
    }
    form.reset();
    updateDrinkLimit();
    showThankYou();
  } catch (error) {
    setStatus("No se ha podido enviar. Prueba otra vez en un momento.", "error");
    setSubmitting(false);
    updateDrinkLimit();
  }
}

function setCountdownValue(element, value) {
  const newValue = String(value);
  if (element.textContent === newValue) return;
  element.textContent = newValue;
  if (prefersReducedMotion) return;
  element.classList.remove("pop");
  void element.offsetWidth;
  element.classList.add("pop");
  setTimeout(() => element.classList.remove("pop"), 400);
}

function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    setCountdownValue(daysEl, 0);
    setCountdownValue(hoursEl, 0);
    setCountdownValue(minutesEl, 0);
    return;
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;

  setCountdownValue(daysEl, days);
  setCountdownValue(hoursEl, hours);
  setCountdownValue(minutesEl, minutes);
}

function setAudioPlayingState(playing) {
  audioToggle.classList.toggle("is-playing", playing);
  audioToggle.setAttribute("aria-pressed", playing ? "true" : "false");
  audioToggle.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
}

function setupAudioToggle() {
  if (!audioToggle || !bgMusic) return;
  bgMusic.volume = 0.4;
  let userPausedManually = false;

  async function tryPlay() {
    try {
      await bgMusic.play();
      return true;
    } catch (error) {
      return false;
    }
  }

  audioToggle.addEventListener("click", async () => {
    if (bgMusic.paused) {
      userPausedManually = false;
      const started = await tryPlay();
      if (!started) {
        audioToggle.setAttribute("aria-label", "Música no disponible");
        audioToggle.title = "Música no disponible (añade assets/musica.mp3)";
      }
    } else {
      userPausedManually = true;
      bgMusic.pause();
    }
  });

  bgMusic.addEventListener("pause", () => setAudioPlayingState(false));
  bgMusic.addEventListener("play", () => setAudioPlayingState(true));
  bgMusic.addEventListener("ended", () => setAudioPlayingState(false));
  bgMusic.addEventListener("error", () => {
    audioToggle.setAttribute("aria-label", "Música no disponible");
    audioToggle.title = "Música no disponible (añade assets/musica.mp3)";
  });

  tryPlay().then((started) => {
    if (started || userPausedManually) return;
    const events = ["click", "pointerdown", "touchstart", "touchend", "keydown"];
    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, handler, { capture: true }));
    }
    function handler() {
      if (userPausedManually || !bgMusic.paused) { cleanup(); return; }
      const p = bgMusic.play();
      if (p && typeof p.then === "function") {
        p.then(() => cleanup()).catch(() => {});
      } else {
        cleanup();
      }
    }
    events.forEach((e) => window.addEventListener(e, handler, { capture: true, passive: true }));
  });
}

drinkInputs.forEach((i) => i.addEventListener("change", updateDrinkLimit));
guestCountInputs.forEach((i) => i.addEventListener("input", updateDrinkLimit));
form.addEventListener("submit", handleSubmit);

updateStorageNote();
updateDrinkLimit();
updateCountdown();
setInterval(updateCountdown, 60000);
setupAudioToggle();
