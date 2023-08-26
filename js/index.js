const audioContext = new AudioContext();
const audioElements = Array.from(document.querySelectorAll("audio"));
const playAllButton = document.querySelector("#play-all");
const audioFiles = audioElements.map((elem) => {
  return elem.src;
});
const audioSources = [];

audioFiles.forEach((file) => {
  fetch(file)
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      audioSources.push(source);
    })
    .catch(error => console.error('Error loading audio:', error));
});

playAllButton.addEventListener("click", (event) => {
  audioSources.forEach((source) => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    source.connect(audioContext.destination);
    source.start();
  });
});

// playAllButton.innerText = "Stop All";

audioElements.forEach((elem) => {
  const source = audioContext.createMediaElementSource(elem);
  const playButton = document.querySelector(elem.dataset.buttonSelector);
  const panControl = document.querySelector(elem.dataset.panSelector);
  const panner = new StereoPannerNode(audioContext);
  const gainNode = audioContext.createGain();

  panner.connect(audioContext.destination);
  gainNode.connect(audioContext.destination);
  source.connect(panner);
  source.connect(gainNode);
  panner.pan.value = panControl.value;
  gainNode.gain.value = .1;

  panControl.oninput = () => {
    panner.pan.value = panControl.value;
  };

  source.connect(audioContext.destination);

  playButton.addEventListener("click", () => {
    // Check if context is in suspended state (autoplay policy)
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // Play or pause track depending on state
    if (playButton.dataset.playing === "false") {
      elem.play();
      playButton.dataset.playing = "true";
    } else if (playButton.dataset.playing === "true") {
      elem.pause();
      playButton.dataset.playing = "false";
    }
  },
  false,
  );
});
