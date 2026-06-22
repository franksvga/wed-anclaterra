document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  const slideInterval = 6000;

  const heroCarousel = document.getElementById('hero-carousel');
  let slideIntervalId;
  let dots = [];

  const updateSlideState = (newIndex) => {
    slides[currentSlide].classList.remove('hero-slide--active');
    dots[currentSlide]?.classList.remove('hero-carousel__dot--active');
    currentSlide = newIndex;
    slides[currentSlide].classList.add('hero-slide--active');
    dots[currentSlide]?.classList.add('hero-carousel__dot--active');
  };

  const goToNextSlide = () => {
    updateSlideState((currentSlide + 1) % slides.length);
  };

  const restartSlideTimer = () => {
    clearInterval(slideIntervalId);
    slideIntervalId = setInterval(goToNextSlide, slideInterval);
  };

  if (slides.length > 0 && heroCarousel) {
    const dotsContainer = document.querySelector('.hero-carousel__dots');
    slides.forEach((_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hero-carousel__dot';
      button.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
      button.addEventListener('click', () => {
        if (index === currentSlide) return;
        updateSlideState(index);
        restartSlideTimer();
      });
      dotsContainer?.appendChild(button);
    });

    dots = document.querySelectorAll('.hero-carousel__dot');
    dots[currentSlide]?.classList.add('hero-carousel__dot--active');
    slideIntervalId = setInterval(goToNextSlide, slideInterval);
  }

  const revealElements = document.querySelectorAll('.animate-on-scroll');
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -15% 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(element => scrollObserver.observe(element));

  const menuOpen = document.getElementById('menu-open');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__links a');

  const toggleMenu = () => {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  if (menuOpen) menuOpen.addEventListener('click', toggleMenu);
  if (menuClose) menuClose.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ===================== CONTACT FORM HANDLING =====================
  // EmailJS Configuration (Free service: https://www.emailjs.com/)
  //
  // SETUP STEPS:
  // 1. Create account at emailjs.com
  // 2. Go to: Dashboard → Account → Copy "Public Key"
  // 3. Replace 'YOUR_PUBLIC_KEY_HERE' below with your actual public key
  // 4. Go to: Email Services → Create/Choose email service → Get "Service ID"
  // 5. Go to: Email Templates → Create template → Get "Template ID"
  // 6. Replace service and template IDs in emailjs.send() call below
  //
  // SECURITY - DOMAIN WHITELISTING (CRITICAL):
  // To prevent credential abuse, set authorized domains:
  // - Dashboard → Account Settings → Authorized Domains
  // - Add ONLY your domain (e.g., anclaterra.com)
  // - Public key is safe to expose (designed for client-side)
  // - Domain whitelist restricts abuse to YOUR website only
  //
  // Template variables available in EmailJS template:
  // {{from_name}}, {{from_empresa}}, {{from_phone}}, {{from_email}}, {{message}}
  //
  emailjs.init('YOUR_PUBLIC_KEY_HERE');

  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous messages
      formMessage.style.display = 'none';
      formMessage.className = 'form-message';

      // Get form values
      const name = document.getElementById('name').value.trim();
      const empresa = document.getElementById('empresa').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      // Validation
      if (!name || !empresa || !phone || !email || !message) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
      }

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return;
      }

      // Phone validation (basic)
      const phoneRegex = /^[0-9+\-().\s]{10,}$/;
      if (!phoneRegex.test(phone)) {
        showMessage('Por favor ingresa un teléfono válido', 'error');
        return;
      }

      try {
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Send email via EmailJS
        // Replace 'YOUR_SERVICE_ID_HERE' and 'YOUR_TEMPLATE_ID_HERE' with actual IDs
        const response = await emailjs.send('YOUR_SERVICE_ID_HERE', 'YOUR_TEMPLATE_ID_HERE', {
          from_name: name,
          from_empresa: empresa,
          from_phone: phone,
          from_email: email,
          message: message,
          to_email: 'info@anclaterra.com'
        });

        if (response.status === 200) {
          showMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto pronto.', 'success');
          contactForm.reset();
        } else {
          showMessage('Error al enviar el mensaje. Intenta de nuevo.', 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      } catch (error) {
        console.error('Email error:', error);
        showMessage('Error al enviar el mensaje. Por favor intenta más tarde.', 'error');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Enviar';
        submitBtn.disabled = false;
      }
    });

    function showMessage(text, type) {
      formMessage.textContent = text;
      formMessage.className = `form-message form-message--${type}`;
      formMessage.style.display = 'block';

      // Auto-hide success message after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 5000);
      }
    }
  }
  // ===================== END CONTACT FORM =====================
  // REMINDER: Don't forget to set up domain whitelisting in EmailJS!
  // This prevents unauthorized use of your credentials from other domains.
});
