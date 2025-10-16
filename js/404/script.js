document.getElementById("year").textContent = new Date().getFullYear();
    function createParticles() {
      const container = document.getElementById('particles');
      const particleCount = Math.min(20, Math.floor(window.innerWidth / 50));
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 20 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${animationDelay}s`;
        
        container.appendChild(particle);
      }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      createParticles();
      
      const errorCode = document.querySelector('.error-code');
      errorCode.addEventListener('mouseover', () => {
        errorCode.style.transform = 'scale(1.05)';
      });
      
      errorCode.addEventListener('mouseout', () => {
        errorCode.style.transform = 'scale(1)';
      });
      
      const button = document.querySelector('.button');
      button.addEventListener('mousedown', () => {
        button.style.transform = 'translateY(-2px) scale(0.98)';
      });
      
      button.addEventListener('mouseup', () => {
        button.style.transform = 'translateY(-5px) scale(1.03)';
      });
    });
    
    window.addEventListener('resize', () => {
      const container = document.getElementById('particles');
      container.innerHTML = '';
      createParticles();
    });
