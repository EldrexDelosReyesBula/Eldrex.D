document.getElementById('current-year').textContent = new Date().getFullYear();
document.getElementById('current-year-footer').textContent = new Date().getFullYear();

gsap.registerPlugin(ScrollTrigger);

const guideToggle = document.getElementById('guideToggle');
const guideContent = document.getElementById('guideContent');
const guideChevron = document.getElementById('guideChevron');

guideToggle.addEventListener('click', function() {
const isActive = guideContent.classList.contains('active');

if (isActive) {
guideContent.classList.remove('active');
guideChevron.classList.remove('active');
guideToggle.classList.remove('active');

gsap.to(guideContent, {
duration: 0.6,
height: 0,
ease: "power2.in"
});

gsap.to('.guide-card', {
duration: 0.3,
y: 20,
opacity: 0,
stagger: 0.05,
ease: "power2.in"
});
} else {
guideContent.classList.add('active');
guideChevron.classList.add('active');
guideToggle.classList.add('active');

gsap.fromTo(guideContent, {
height: 0
}, {
duration: 0.8,
height: "auto",
ease: "power2.out"
});

gsap.fromTo('.guide-card', {
y: 20,
opacity: 0
}, {
duration: 0.6,
y: 0,
opacity: 1,
stagger: 0.1,
ease: "back.out(1.7)",
delay: 0.2
});
}
});

window.addEventListener('load', function() {
setTimeout(function() {
const loadingContainer = document.querySelector('.loading-container');

gsap.to(loadingContainer, {
duration: 0.5,
opacity: 0,
onComplete: function() {
loadingContainer.style.display = 'none';

// Animate hero elements
gsap.to('.hero-tag', {
duration: 0.8,
y: 0,
opacity: 1,
ease: "power2.out",
onComplete: function() {
document.querySelector('.hero-tag').classList.add('animate');
}
});

gsap.to('.tagline', {
duration: 0.8,
y: 0,
opacity: 1,
delay: 0.3,
ease: "power2.out"
});

gsap.to('.quick-guide', {
duration: 0.8,
y: 0,
opacity: 1,
delay: 0.6,
ease: "power2.out"
});

gsap.to('.terms-container', {
duration: 0.8,
y: 0,
opacity: 1,
delay: 0.9,
ease: "power2.out",
onComplete: function() {
document.querySelector('.terms-title').classList.add('animate');

gsap.to('.highlight', {
duration: 0.6,
y: 0,
opacity: 1,
delay: 0.3,
ease: "power2.out"
});
}
});

gsap.utils.toArray('.terms-section').forEach((section, i) => {
gsap.to(section, {
scrollTrigger: {
trigger: section,
start: "top 85%",
end: "bottom 20%",
toggleActions: "play none none reverse"
},
x: 0,
opacity: 1,
duration: 0.8,
delay: i * 0.1,
ease: "power2.out",
onComplete: function() {
section.classList.add('in-view');
}
});
});
}
});
}, 800);
});

const guideCards = document.querySelectorAll('.guide-card');
guideCards.forEach(card => {
card.addEventListener('mouseenter', function() {
gsap.to(this, {
duration: 0.3,
y: -5,
boxShadow: "0 8px 25px rgba(106, 127, 116, 0.15)",
ease: "power2.out"
});
});

card.addEventListener('mouseleave', function() {
gsap.to(this, {
duration: 0.3,
y: 0,
boxShadow: "0 2px 10px rgba(106, 127, 116, 0.08)",
ease: "power2.out"
});
});
});

gsap.to('.hero-tag', {
duration: 6,
y: -5,
repeat: -1,
yoyo: true,
ease: "sine.inOut",
delay: 2
});
