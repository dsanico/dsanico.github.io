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

function initAdditionalBioCards() {
  const triggers = document.querySelectorAll(".additional-bio-trigger[data-bio-card]");
  const cards = document.querySelectorAll(".additional-bio-card");
  if (!triggers.length || !cards.length) return;

  const hideCards = () => cards.forEach((card) => card.classList.remove("active"));

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      const targetId = trigger.dataset.bioCard;
      cards.forEach((card) => card.classList.toggle("active", card.id === targetId));
    });
    trigger.addEventListener("mouseleave", hideCards);
  });
}

function initPageInteractions() {
  initHeroTypewriter();
  initAdditionalBioCards();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageInteractions);
} else {
  initPageInteractions();
}
