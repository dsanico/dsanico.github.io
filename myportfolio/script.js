// add class navbarDark on navbar scroll
const header = document.querySelector('.navbar');
console.log(header)
window.onscroll = function() {
    const top = window.scrollY;
    if(top >=100) {
        header.classList.add('navbarDark');
    }
    else {
        header.classList.remove('navbarDark');
    }
}

// typewriter effect
let textBase = "I am ";
let descriptions = ["a U-M engineering student.", "a designer and creator.", "passionate about innovative problem-solving.", "an eager learner.", "a breakfast lover."];
let descIdx = 0;
let i = 0;
let reverse = false;

function typeWriter() {
  // Generate some random text jitter between 45 and 75 ms to simulate a keyboard
  var textJitter = Math.floor(Math.random() * (70 - 45) + 45);

  // Check if we want to remove text ('reverse'), or add it.
  if (reverse) {
    if (document.getElementById("text").innerHTML.length > textBase.length) {
      // We're still in the process of removing the description
      document.getElementById("text").innerHTML = document
        .getElementById("text")
        .innerHTML.slice(0, -1);
      setTimeout(typeWriter, 25);
    } else {
      // deleting done. Set next description, and repeat with typing by
      // setting reverse to false
      descIdx = (descIdx+1) % descriptions.length;
      reverse = false;
      setTimeout(typeWriter, 500);
    }
  } else {
    // We're adding text
    if (i === (textBase + descriptions[descIdx]).length) {
      // Line is done. Wait and then reverse
      i = textBase.length;
      reverse = true;

      // Wait a bit, then start deleting
      setTimeout(typeWriter, 1500);
    } else {
      // Write text like a typewriter
      if (i < (textBase + descriptions[descIdx]).length) {
        document.getElementById("text").innerHTML = document.getElementById("text").innerHTML + (
          textBase + descriptions[descIdx]
        ).charAt(i);
        i++;
        setTimeout(typeWriter, textJitter);
      }
    }
  }
}

typeWriter();

// carousel
document.addEventListener("DOMContentLoaded", function() { 
    const carousel = document.querySelector(".carousel");
    const cards = carousel.querySelectorAll(".card");
  
    // Clone all the cards and append them to the end of the carousel
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        carousel.appendChild(clone);
    });

    function scrollToNextCard() {
        // Width of a card, include the gap size if needed
        const cardWidth = carousel.querySelector(".card").offsetWidth; // + gap if needed

        const maxScrollLeft = carousel.scrollWidth / 2 - carousel.offsetWidth;

        // Scroll to the next card
        let newScrollPosition = carousel.scrollLeft + cardWidth;

        // If at the end, reset to the beginning
        if(newScrollPosition >= maxScrollLeft) {
            newScrollPosition = 0; // Reset the position to 0
        }

        carousel.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
    }
  
    // Scroll to next card every 5 seconds
    const intervalId = setInterval(scrollToNextCard, 5000);

    // Optional: Stop the interval on hover and resume after
    carousel.addEventListener('mouseover', function() {
        clearInterval(intervalId);
    });

    carousel.addEventListener('mouseout', function() {
        setInterval(scrollToNextCard, 5000);
    });
  
});
/*
document.addEventListener("DOMContentLoaded", function() { 
    const carousel = document.querySelector(".carousel"); 
  
    let isDragging = false,
        startX,
        startScrollLeft;
  
    const dragStart = (e) => {  
        isDragging = true;
        carousel.classList.add("dragging");
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    };
  
    const dragging = (e) => { 
        if (!isDragging) return;
      
        const newScrollLeft = startScrollLeft - (e.pageX - startX);
        carousel.scrollLeft = newScrollLeft;
    };
  
    const dragStop = () => { 
        isDragging = false;
        carousel.classList.remove("dragging");
    };
  
    // Add mouse event listeners for dragging behavior
    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
});
*/
