const vocabulary = {
  animals: [
    ['🐶', 'いぬ', 'hond'], ['🐱', 'ねこ', 'kat'], ['🐰', 'うさぎ', 'konijn'],
    ['🐘', 'ぞう', 'olifant'], ['🦁', 'ライオン', 'leeuw'], ['🐼', 'パンダ', 'panda'],
  ],
  food: [
    ['🍎', 'りんご', 'appel'], ['🍌', 'バナナ', 'banaan'], ['🍓', 'いちご', 'aardbei'],
    ['🍞', 'パン', 'brood'], ['🧀', 'チーズ', 'kaas'], ['🥚', 'たまご', 'ei'],
  ],
  vehicles: [
    ['🚗', 'くるま', 'auto'], ['🚌', 'バス', 'bus'], ['🚲', 'じてんしゃ', 'fiets'],
    ['🚆', 'でんしゃ', 'trein'], ['✈️', 'ひこうき', 'vliegtuig'], ['🚢', 'ふね', 'schip'],
  ],
  greetings: [
    ['🌅', 'おはよう', 'Goedemorgen'],
    ['👋', 'こんにちは', 'Hallo'],
    ['🌆', 'こんばんは', 'Goedenavond'],
    ['🌙', 'おやすみ', 'Welterusten'],
    ['💐', 'ありがとう', 'Dank je wel'],
    ['🙋', 'またね', 'Tot ziens'],
  ],
};

const cards = document.querySelector('#cards');
const status = document.querySelector('#status');
const categories = [...document.querySelectorAll('[data-category]')];
const synth = window.speechSynthesis;
let active;

function showStatus(message) {
  status.textContent = message;
  status.hidden = !message;
}

function clearPlayback() {
  active?.button.classList.remove('is-speaking');
  active = undefined;
}

function stopPlayback() {
  clearPlayback();
  synth?.cancel();
}

function speak(word, button) {
  stopPlayback();
  if (!synth || !window.SpeechSynthesisUtterance) {
    showStatus('このブラウザでは音声を再生できません。');
    return;
  }

  const voices = synth.getVoices();
  const voice = voices.find(({ lang }) => /^nl[-_]NL$/i.test(lang))
    ?? voices.find(({ lang }) => /^nl(?:[-_]|$)/i.test(lang));
  if (voices.length && !voice) {
    showStatus('オランダ語の音声が見つかりません。端末の読み上げ設定でオランダ語を追加してね。');
    return;
  }

  showStatus('');
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = voice?.lang ?? 'nl-NL';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.8;
  active = { utterance, button };
  button.classList.add('is-speaking');

  utterance.onend = () => {
    if (active?.utterance === utterance) clearPlayback();
  };
  utterance.onerror = ({ error }) => {
    if (active?.utterance !== utterance) return;
    clearPlayback();
    showStatus(error === 'language-unavailable' || error === 'voice-unavailable'
      ? '端末の読み上げ設定でオランダ語を追加してね。'
      : '音声を再生できませんでした。もういちど タッチしてね。');
  };
  synth.speak(utterance);
}

function renderCategory(category) {
  cards.replaceChildren(...vocabulary[category].map(([picture, japanese, dutch]) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card';
    button.setAttribute('aria-label', `${japanese}の オランダ語を きく`);
    button.innerHTML = `
      <span class="picture" aria-hidden="true">${picture}</span>
      <span class="sound" aria-hidden="true">🔊</span>
      <span class="japanese">${japanese}</span>
      <span class="dutch" lang="nl">${dutch}</span>`;
    button.addEventListener('click', () => speak(dutch, button));
    item.append(button);
    return item;
  }));
}

for (const category of categories) {
  category.addEventListener('click', () => {
    if (category.getAttribute('aria-pressed') === 'true') return;
    stopPlayback();
    showStatus('');
    for (const button of categories) {
      button.setAttribute('aria-pressed', String(button === category));
    }
    cards.setAttribute('aria-label', category.textContent.trim().split(/\s+/).at(-1));
    renderCategory(category.dataset.category);
  });
}

window.addEventListener('pagehide', stopPlayback);
synth?.getVoices();
renderCategory('animals');
