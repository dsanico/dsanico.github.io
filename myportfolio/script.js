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
  
    function scrollToNextCard() {
        // Width of one card could be hard-coded or dynamically calculated
        // Optionally include the width of the gap if it's a fixed size
        const cardWidth = carousel.querySelector(".card").offsetWidth // Include gap size if needed
        
        const maxScrollLeft = carousel.scrollWidth - carousel.offsetWidth;

        // Scroll to the next card
        const newScrollPosition = Math.min(carousel.scrollLeft + cardWidth, maxScrollLeft);
        carousel.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
        
        // If at the end, start from the beginning
        if (newScrollPosition >= maxScrollLeft) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }
  
    // Scroll to next card every 5 seconds
    const intervalId = setInterval(scrollToNextCard, 5000);

    // Optional: Clear the interval if certain interactions are detected
    carousel.addEventListener('mouseover', function() {
        clearInterval(intervalId);
    });

    carousel.addEventListener('mouseout', function() {
        setInterval(scrollToNextCard, 5000);
    });

    // Attach more event listeners if more controls are needed
    // ...
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
