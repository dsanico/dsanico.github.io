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
    let isDragging = false,
        startX,
        startScrollLeft;
  
    let scrollInterval; // Auto-scroll interval
  
    function startAutoScroll() {
        const autoScroll = () => {
            // Width of a card (assuming all cards are the same width)
            const cardWidth = carousel.querySelector(".card").offsetWidth; 

            // Scroll to the next card
            carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });

            // Calculate the maximum scroll position
            const maxScrollLeft = carousel.scrollWidth - carousel.offsetWidth;

            // If at the end, scroll back to the first card smoothly
            if (carousel.scrollLeft >= maxScrollLeft - cardWidth) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            }
        };

        // Start the auto scroll, scrolling to the next card every 5 seconds
        scrollInterval = setInterval(autoScroll, 5000);
    }
  
    function stopAutoScroll() {
        clearInterval(scrollInterval);
    }

    function dragStart(e) {
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        startScrollLeft = carousel.scrollLeft;

        stopAutoScroll();  // Optional: stop auto scroll on manual dragging
    }
  
    function dragging(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 3; // Multiply for faster drag response
        carousel.scrollLeft = startScrollLeft - walk;
    }
  
    function dragStop() {
        isDragging = false;
        startAutoScroll(); 
    }
  
    carousel.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragging); // Using window to better track mouse movements
    window.addEventListener("mouseup", dragStop);

    // Optional: for touch screens
    carousel.addEventListener("touchstart", dragStart);
    carousel.addEventListener("touchmove", dragging);
    carousel.addEventListener("touchend", dragStop);

    // Start auto-scrolling on load
    startAutoScroll();
});
