function initHeroTypewriter() {
  const textElement = document.getElementById("text");
  if (!textElement) return;

  const textBase = "I am ";
  const descriptions = [
    "a U-M engineer.",
    "a designer and creator.",
    "always eager to learn.",
    "a breakfast lover.",
  ];
  let descriptionIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  function typeNextCharacter() {
    const fullText = textBase + descriptions[descriptionIndex];

    if (deleting) {
      if (textElement.textContent.length > textBase.length) {
        textElement.textContent = textElement.textContent.slice(0, -1);
        window.setTimeout(typeNextCharacter, 25);
        return;
      }

      descriptionIndex = (descriptionIndex + 1) % descriptions.length;
      characterIndex = textBase.length;
      deleting = false;
      window.setTimeout(typeNextCharacter, 500);
      return;
    }

    if (characterIndex >= fullText.length) {
      characterIndex = textBase.length;
      deleting = true;
      window.setTimeout(typeNextCharacter, 1500);
      return;
    }

    textElement.textContent += fullText.charAt(characterIndex);
    characterIndex += 1;
    const typingDelay = Math.floor(Math.random() * 25) + 45;
    window.setTimeout(typeNextCharacter, typingDelay);
  }

  typeNextCharacter();
}

function initPageInteractions() {
  initHeroTypewriter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageInteractions);
} else {
  initPageInteractions();
}
