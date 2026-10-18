/**
 * Finance Calculator — Main JavaScript v2.0
 * Developer: Nikil Ravi / RR Production
 * Features: Theme toggle, Mobile nav, Scroll animations, Interactive demo,
 *           FAQ accordion, Active nav tracking, Clipboard copy
 */

/* ============================================================
   1. THEME ENGINE — Runs immediately to prevent FOUC
   ============================================================ */
(function () {
  const saved = localStorage.getItem('theme');
  const theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

/* ============================================================
   2. MAIN — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     2a. THEME TOGGLE
     ---------------------------------------------------------- */
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

  /**
   * Swaps all .themed-img elements to the correct src
   * based on data-dark-src / data-light-src attributes.
   * Uses a quick fade-out → swap → fade-in for a smooth feel.
   */
  function swapThemedImages(theme) {
    document.querySelectorAll('.themed-img').forEach(img => {
      const newSrc = theme === 'dark'
        ? img.getAttribute('data-dark-src')
        : img.getAttribute('data-light-src');
      if (!newSrc) return;

      const absolute = new URL(newSrc, window.location.href).href;
      if (img.src === absolute) return; // already correct, skip

      img.classList.add('swapping');
      setTimeout(() => {
        img.src = newSrc;
        img.classList.remove('swapping');
      }, 200); // matches CSS transition duration
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggleBtns.forEach(btn => {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
    swapThemedImages(theme);
  }

  // Init aria-label from current state
  const initTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(initTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  // Respect OS theme changes (only if user hasn't set a preference)
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ----------------------------------------------------------
     2a-1. HERO PHONE SCREEN SCROLL & DRAG INTERACTION
     ---------------------------------------------------------- */
  const phoneViewport = document.querySelector('.hero-phone-viewport');
  const scrollHint    = document.querySelector('.phone-scroll-hint');

  if (phoneViewport) {
    // Hide hint when user starts scrolling
    phoneViewport.addEventListener('scroll', () => {
      if (scrollHint && phoneViewport.scrollTop > 30) {
        scrollHint.classList.add('hidden');
      } else if (scrollHint && phoneViewport.scrollTop <= 10) {
        scrollHint.classList.remove('hidden');
      }
    }, { passive: true });

    // Click and drag to scroll on desktop
    let isDown = false;
    let startY, scrollTop;

    phoneViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      phoneViewport.style.cursor = 'grabbing';
      startY = e.pageY - phoneViewport.offsetTop;
      scrollTop = phoneViewport.scrollTop;
    });

    phoneViewport.addEventListener('mouseleave', () => {
      isDown = false;
      phoneViewport.style.cursor = 'grab';
    });

    phoneViewport.addEventListener('mouseup', () => {
      isDown = false;
      phoneViewport.style.cursor = 'grab';
    });

    phoneViewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const y = e.pageY - phoneViewport.offsetTop;
      const walk = (y - startY) * 1.5; // scroll multiplier
      phoneViewport.scrollTop = scrollTop - walk;
    });
  }


  /* ----------------------------------------------------------
     2b. MOBILE NAVIGATION
     ---------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav    = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.classList.toggle('open');
    });

    // Close on any link click inside mobile nav
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ----------------------------------------------------------
     2c. STICKY NAVBAR SHADOW
     ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ----------------------------------------------------------
     2d. SMOOTH ANCHOR SCROLLING
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ----------------------------------------------------------
     2e. SCROLL FADE-IN ANIMATIONS (IntersectionObserver)
     ---------------------------------------------------------- */
  // Add stagger delays to children before observing
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.querySelectorAll('.fade-in-up');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));


  /* ----------------------------------------------------------
     2f. ACTIVE NAV LINK HIGHLIGHTING
     ---------------------------------------------------------- */
  const sectionIds = ['hero', 'calculators', 'features', 'showcase', 'faq'];
  const navLinks   = document.querySelectorAll('.nav-link');

  const setActiveLink = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, {
    threshold: 0.4
  });

  sectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });


  /* ----------------------------------------------------------
     2g. INTERACTIVE CALCULATOR DEMO
     ---------------------------------------------------------- */

  // --- Helper: Indian Number Formatting ---
  function formatIndianFull(num) {
    if (isNaN(num) || num === null || num === undefined) return '—';
    const sign = num < 0 ? '-' : '';
    const absNum = Math.abs(num);
    const [intPart, decPart] = absNum.toFixed(2).split('.');
    const lastThree = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
    return sign + '₹' + formatted + '.' + decPart;
  }

  function formatIndianShort(num) {
    if (isNaN(num) || num === null || num === undefined) return '—';
    if (num >= 1e7) return '₹' + (num / 1e7).toFixed(2) + ' Cr';
    if (num >= 1e5) return '₹' + (num / 1e5).toFixed(2) + ' L';
    return formatIndianFull(num);
  }

  // --- Helper: Animate value change ---
  function animateValue(el, newText) {
    if (!el) return;
    el.textContent = newText;
    el.classList.remove('flash');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 400);
  }

  // --- Tab Switching ---
  const demoTabs   = document.querySelectorAll('.demo-tab');
  const demoPanels = document.querySelectorAll('.demo-panel');

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      demoTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      demoPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });


  // --- Simple Interest Calculator ---
  const siPrincipal  = document.getElementById('si-principal');
  const siRate       = document.getElementById('si-rate');
  const siRateType   = document.getElementById('si-rate-type');
  const siTenure     = document.getElementById('si-tenure');
  const siTenureType = document.getElementById('si-tenure-type');
  const siResults    = document.getElementById('si-results');
  const siResInterest = document.getElementById('si-result-interest');
  const siResTotal    = document.getElementById('si-result-total');
  const siResMonthly  = document.getElementById('si-result-monthly');

  function calculateSI() {
    if (!siPrincipal || !siRate || !siRateType || !siTenure || !siTenureType) return;

    const p = parseFloat(siPrincipal.value) || 0;
    const r = parseFloat(siRate.value) || 0;
    const t = parseFloat(siTenure.value) || 0;

    const months      = siTenureType.value === 'years' ? t * 12 : t;
    const monthlyRate = siRateType.value === 'per_year' ? r / 12 : r;

    if (p > 0 && r > 0 && months > 0) {
      const interest = p * (monthlyRate / 100) * months;
      const total    = p + interest;
      const monthly  = total / months;

      if (siResults) siResults.classList.remove('hidden');
      animateValue(siResInterest, formatIndianShort(interest));
      animateValue(siResTotal,    formatIndianShort(total));
      animateValue(siResMonthly,  formatIndianShort(monthly));
    } else {
      if (siResults) siResults.classList.add('hidden');
    }
  }

  [siPrincipal, siRate, siRateType, siTenure, siTenureType].forEach(el => {
    if (el) el.addEventListener('input', calculateSI);
  });


  // --- Loan EMI Calculator ---
  const emiPrincipal  = document.getElementById('emi-principal');
  const emiRate       = document.getElementById('emi-rate');
  const emiTenure     = document.getElementById('emi-tenure');
  const emiTenureType = document.getElementById('emi-tenure-type');
  const emiResults    = document.getElementById('emi-results');
  const emiResEmi      = document.getElementById('emi-result-emi');
  const emiResInterest = document.getElementById('emi-result-interest');
  const emiResTotal    = document.getElementById('emi-result-total');

  function calculateEMI() {
    if (!emiPrincipal || !emiRate || !emiTenure || !emiTenureType) return;

    const p           = parseFloat(emiPrincipal.value) || 0;
    const annualRate  = parseFloat(emiRate.value) || 0;
    const t           = parseFloat(emiTenure.value) || 0;
    const n           = emiTenureType.value === 'years' ? t * 12 : t;
    const r           = annualRate / 12 / 100;

    if (p > 0 && n > 0) {
      let emi;
      if (r > 0) {
        const pow = Math.pow(1 + r, n);
        emi = (p * r * pow) / (pow - 1);
      } else {
        emi = p / n; // zero interest
      }

      const totalAmount   = emi * n;
      const totalInterest = totalAmount - p;

      if (emiResults) emiResults.classList.remove('hidden');
      animateValue(emiResEmi,      formatIndianShort(emi));
      animateValue(emiResInterest, formatIndianShort(totalInterest));
      animateValue(emiResTotal,    formatIndianShort(totalAmount));
    } else {
      if (emiResults) emiResults.classList.add('hidden');
    }
  }

  [emiPrincipal, emiRate, emiTenure, emiTenureType].forEach(el => {
    if (el) el.addEventListener('input', calculateEMI);
  });


  /* ----------------------------------------------------------
     2h. FAQ ACCORDION
     ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(fi => {
        fi.classList.remove('open');
        const q = fi.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ----------------------------------------------------------
     2i. CLIPBOARD COPY (Email etc.)
     ---------------------------------------------------------- */
  document.querySelectorAll('.btn-copy[data-email]').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      if (!email) return;

      const copyText = () => {
        const saved = btn.innerHTML;
        btn.innerHTML = '<span style="color:#2563EB;font-weight:700;font-size:12px;">Copied!</span>';
        setTimeout(() => { btn.innerHTML = saved; }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(copyText).catch(() => fallbackCopy(email, copyText));
      } else {
        fallbackCopy(email, copyText);
      }
    });
  });

  function fallbackCopy(text, callback) {
    const input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (err) {
      console.error('Copy failed:', err);
    }
    document.body.removeChild(input);
  }

}); // end DOMContentLoaded
