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
let descriptions = ["an engineering student at the University of Michigan.", "a creator.", "passionate about innovating solutions.", "a designer and learner.", "a breakfast lover."];
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
      setTimeout(typeWriter, textJitter);
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
