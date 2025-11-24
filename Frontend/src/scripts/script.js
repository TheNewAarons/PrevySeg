// Smooth scrolling para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Animación de aparición para las tarjetas al hacer scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Aplicar animación a las tarjetas
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".course-card, .stat-card, .testimonial-card")

  cards.forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(card)
  })
})

// Funcionalidad para los botones de inscripción
document.querySelectorAll(".btn-primary").forEach((button) => {
  button.addEventListener("click", function (e) {
    if (this.textContent.includes("Inscríbete") || this.textContent.includes("Ver Cursos")) {
      e.preventDefault()
      alert("¡Gracias por tu interés! Pronto nos pondremos en contacto contigo para completar tu inscripción.")
    }
  })
})

// Contador animado para las estadísticas
function animateCounter(element, target) {
  let current = 0
  const increment = target / 100
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    if (target.toString().includes("%")) {
      element.textContent = Math.floor(current) + "%"
    } else if (target.toString().includes("+")) {
      element.textContent = Math.floor(current).toLocaleString() + "+"
    } else {
      element.textContent = current.toFixed(1)
    }
  }, 20)
}

// Activar contadores cuando sean visibles
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector(".stat-number") || entry.target.querySelector("h3")
        if (statNumber && !statNumber.classList.contains("animated")) {
          statNumber.classList.add("animated")
          const text = statNumber.textContent
          const number = Number.parseInt(text.replace(/[^\d]/g, ""))
          animateCounter(statNumber, number)
        }
      }
    })
  },
  { threshold: 0.5 },
)

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".stat-card, .hero-stats .stat").forEach((stat) => {
    statsObserver.observe(stat)
  })
})
