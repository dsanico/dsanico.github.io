// add class navbarDark on navbar scroll
const header = document.querySelector(".navbar");
console.log(header);
window.onscroll = function () {
  const top = window.scrollY;
  if (top >= 100) {
    header.classList.add("navbarDark");
  } else {
    header.classList.remove("navbarDark");
  }
};

// navbar highlight
document.addEventListener("DOMContentLoaded", (event) => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".navbar-nav a");

  function changeLinkState() {
    let index = sections.length;

    while (--index && window.scrollY + 50 < sections[index].offsetTop) {}

    navLinks.forEach((link) => link.classList.remove("active"));
    navLinks[index] && navLinks[index].classList.add("active");
  }

  changeLinkState();
  window.addEventListener("scroll", changeLinkState);
});

// hero section typewriter effect
let textBase = "I am ";
let descriptions = [
  "a U-M engineer.",
  "a designer and creator.",
  "always eager to learn.",
  "a breakfast lover."
];
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
      descIdx = (descIdx + 1) % descriptions.length;
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
        document.getElementById("text").innerHTML =
          document.getElementById("text").innerHTML +
          (textBase + descriptions[descIdx]).charAt(i);
        i++;
        setTimeout(typeWriter, textJitter);
      }
    }
  }
}

typeWriter();

// about section typewriter effect
function setupAboutTypewriter(t) {
  var HTML = t.innerHTML;

  t.innerHTML = "";

  var cursorPosition = 0,
      tag = "",
      writingTag = false,
      tagOpen = false,
      typeSpeed = 0,
    tempTypeSpeed = 0;

  var type = function() {
    
      if (writingTag === true) {
          tag += HTML[cursorPosition];
      }

      if (HTML[cursorPosition] === "<") {
          tempTypeSpeed = 0;
          if (tagOpen) {
              tagOpen = false;
              writingTag = true;
          } else {
              tag = "";
              tagOpen = true;
              writingTag = true;
              tag += HTML[cursorPosition];
          }
      }
      if (!writingTag && tagOpen) {
          tag.innerHTML += HTML[cursorPosition];
      }
      if (!writingTag && !tagOpen) {
          if (HTML[cursorPosition] === " ") {
              tempTypeSpeed = 0;
          }
          else {
              tempTypeSpeed = (Math.random() * typeSpeed) + 50;
          }
          t.innerHTML += HTML[cursorPosition];
      }
      if (writingTag === true && HTML[cursorPosition] === ">") {
          tempTypeSpeed = (Math.random() * typeSpeed) + 50;
          writingTag = false;
          if (tagOpen) {
              var newSpan = document.createElement("span");
              t.appendChild(newSpan);
              newSpan.innerHTML = tag;
              tag = newSpan.firstChild;
          }
      }

      cursorPosition += 1;
      if (cursorPosition < HTML.length - 1) {
          setTimeout(type, tempTypeSpeed);
      }

  };

  return {
      type: type
  };
}

var typer = document.getElementById('typewriterAbout');

typewriterAbout = setupAboutTypewriter(typewriterAbout);

typewriterAbout.type();

// scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry)
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } 
  });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

// Skills section toggle functionality
/* function toggleSkills(skillsId) {
    const skillsList = document.getElementById(skillsId);
    const arrow = skillsList.previousElementSibling.querySelector('.skills-arrow');
    
    // Toggle expanded class
    skillsList.classList.toggle('expanded');
    arrow.classList.toggle('rotated');
    
    // Get all skill items
    const skillItems = skillsList.querySelectorAll('.skills-list-item');
    
    if (skillsList.classList.contains('expanded')) {
        // Show items with staggered delay
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 100); // 100ms delay between each item
        });
    } else {
        // Hide all items immediately
        skillItems.forEach(item => {
            item.classList.remove('show');
        });
    }
}

// Initialize skills lists to be collapsed
document.addEventListener('DOMContentLoaded', function() {
    const skillsLists = document.querySelectorAll('.skills-list');
    skillsLists.forEach(list => {
        list.classList.remove('expanded');
        const skillItems = list.querySelectorAll('.skills-list-item');
        skillItems.forEach(item => {
            item.classList.remove('show');
        });
    });
}); */
