import './index.css' // Importa los estilos globales
// No necesitas importar el script.js aquí, ya que el JS de manipulación DOM
// será reemplazado por la lógica de React (Hooks y Event Handlers).

function App() {
  // En React, no usamos document.querySelectorAll() ni lógica de manipulación DOM directa.
  // Reemplazaremos la lógica de script.js con Hooks (useEffect) y Event Handlers de React más adelante.
  // Por ahora, solo ponemos la estructura HTML.

  return (
    <>
      <header className="header">
        <div className="container">
            <div className="nav">
                <div className="logo">
                    <h2>Prevyseg OTEC</h2>
                </div>
                <nav className="nav-menu">
                    <a href="#cursos">Cursos</a>
                    <a href="#nosotros">Nosotros</a>
                    <a href="#testimonios">Testimonios</a>
                    <a href="#contacto">Contacto</a>
                </nav>
                <button className="btn-primary">Inscríbete Ahora</button>
            </div>
        </div>
      </header>

      <main>
          <section className="hero">
              <div className="container">
                  <div className="hero-content">
                      <div className="hero-text">
                          <h1>Impulsa tu Carrera con Capacitación Profesional</h1>
                          <p>Desarrolla nuevas habilidades y obtén certificaciones reconocidas por la industria. Nuestros cursos están diseñados para el mercado laboral actual.</p>
                          <div className="hero-buttons">
                              <button className="btn-primary">Ver Cursos Disponibles</button>
                              <button className="btn-secondary">Conoce Más</button>
                          </div>
                          <div className="hero-stats">
                              <div className="stat">
                                  <span className="stat-number">5,000+</span>
                                  <span className="stat-label">Estudiantes Capacitados</span>
                              </div>
                              <div className="stat">
                                  <span className="stat-number">95%</span>
                                  <span className="stat-label">Tasa de Empleabilidad</span>
                              </div>
                          </div>
                      </div>
                      <div className="hero-image">
                          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Estudiantes en capacitación"/>
                      </div>
                  </div>
              </div>
          </section>

          <section className="stats-section">
              <div className="container">
                  <div className="stats-grid">
                      <div className="stat-card">
                          <div className="stat-icon">📚</div>
                          <h3>150+</h3>
                          <p>Cursos Disponibles</p>
                      </div>
                      <div className="stat-card">
                          <div className="stat-icon">👨‍🏫</div>
                          <h3>50+</h3>
                          <p>Instructores Expertos</p>
                      </div>
                      <div className="stat-card">
                          <div className="stat-icon">🏢</div>
                          <h3>200+</h3>
                          <p>Empresas Aliadas</p>
                      </div>
                      <div className="stat-card">
                          <div className="stat-icon">⭐</div>
                          <h3>4.8/5</h3>
                          <p>Satisfacción Estudiantes</p>
                      </div>
                  </div>
              </div>
          </section>

          <section id="cursos" className="courses-section">
              <div className="container">
                  <div className="section-header">
                      <h2>Categorías de Cursos</h2>
                      <p>Encuentra el curso perfecto para tu desarrollo profesional</p>
                  </div>
                  <div className="courses-grid">
                      <div className="course-card">
                          <div className="course-icon">💻</div>
                          <h3>Tecnología e Informática</h3>
                          <p>Programación, diseño web, análisis de datos y más</p>
                          <ul>
                              <li>Desarrollo Web</li>
                              <li>Análisis de Datos</li>
                              <li>Ciberseguridad</li>
                          </ul>
                          <button className="btn-outline">Ver Cursos</button>
                      </div>
                      <div className="course-card">
                          <div className="course-icon">📊</div>
                          <h3>Administración y Negocios</h3>
                          <p>Gestión empresarial, marketing digital y finanzas</p>
                          <ul>
                              <li>Gestión de Proyectos</li>
                              <li>Marketing Digital</li>
                              <li>Contabilidad</li>
                          </ul>
                          <button className="btn-outline">Ver Cursos</button>
                      </div>
                      <div className="course-card">
                          <div className="course-icon">🔧</div>
                          <h3>Oficios y Técnicas</h3>
                          <p>Soldadura, electricidad, mecánica y construcción</p>
                          <ul>
                              <li>Soldadura Industrial</li>
                              <li>Electricidad Domiciliaria</li>
                              <li>Mecánica Automotriz</li>
                          </ul>
                          <button className="btn-outline">Ver Cursos</button>
                      </div>
                      <div className="course-card">
                          <div className="course-icon">🏥</div>
                          <h3>Salud y Bienestar</h3>
                          <p>Primeros auxilios, cuidado de adultos mayores</p>
                          <ul>
                              <li>Primeros Auxilios</li>
                              <li>Cuidado de Adultos Mayores</li>
                              <li>Técnicas de Rehabilitación</li>
                          </ul>
                          <button className="btn-outline">Ver Cursos</button>
                      </div>
                  </div>
              </div>
          </section>

          <section id="nosotros" className="why-choose-section">
              <div className="container">
                  <div className="why-choose-content">
                      <div className="why-choose-text">
                          <h2>¿Por Qué Elegir OTEC Prevyseg?</h2>
                          <div className="benefits-list">
                              <div className="benefit">
                                  <div className="benefit-icon">✅</div>
                                  <div>
                                      <h4>Certificación Oficial</h4>
                                      <p>Certificados reconocidos por SENCE y la industria</p>
                                  </div>
                              </div>
                              <div className="benefit">
                                  <div className="benefit-icon">👥</div>
                                  <div>
                                      <h4>Instructores Expertos</h4>
                                      <p>Profesionales con experiencia real en la industria</p>
                                  </div>
                              </div>
                              <div className="benefit">
                                  <div className="benefit-icon">💼</div>
                                  <div>
                                      <h4>Bolsa de Trabajo</h4>
                                      <p>Conexión directa con empresas que buscan talento</p>
                                  </div>
                              </div>
                              <div className="benefit">
                                  <div className="benefit-icon">📱</div>
                                  <div>
                                      <h4>Modalidad Flexible</h4>
                                      <p>Presencial, online o modalidad mixta según tu necesidad</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="why-choose-image">
                          <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Estudiante exitoso"/>
                      </div>
                  </div>
              </div>
          </section>

          <section id="testimonios" className="testimonials-section">
              <div className="container">
                  <div className="section-header">
                      <h2>Lo Que Dicen Nuestros Estudiantes</h2>
                      <p>Historias reales de éxito profesional</p>
                  </div>
                  <div className="testimonials-grid">
                      <div className="testimonial-card">
                          <div className="testimonial-content">
                              <p>"Gracias al curso de Desarrollo Web conseguí trabajo en una startup. Los instructores son excelentes y el contenido muy actualizado."</p>
                          </div>
                          <div className="testimonial-author">
                              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Carlos Mendoza"/>
                              <div>
                                  <h4>Carlos Mendoza</h4>
                                  <span>Desarrollador Web</span>
                              </div>
                          </div>
                      </div>
                      <div className="testimonial-card">
                          <div className="testimonial-content">
                              <p>"El curso de Gestión de Proyectos me ayudó a ascender en mi empresa. La metodología es muy práctica y aplicable."</p>
                          </div>
                          <div className="testimonial-author">
                              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="María González"/>
                              <div>
                                  <h4>María González</h4>
                                  <span>Project Manager</span>
                              </div>
                          </div>
                      </div>
                      <div className="testimonial-card">
                          <div className="testimonial-content">
                              <p>"Excelente capacitación en soldadura. Ahora trabajo en una empresa minera con un muy buen sueldo."</p>
                          </div>
                          <div className="testimonial-author">
                              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Roberto Silva"/>
                              <div>
                                  <h4>Roberto Silva</h4>
                                  <span>Soldador Industrial</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </main>


      <footer id="contacto" className="footer">
          <div className="container">
              <div className="footer-content">
                  <div className="footer-section">
                      <h3>Prevyseg OTEC</h3>
                      <p>Transformando vidas a través de la educación y capacitación profesional.</p>
                      <div className="contact-info">
                          <p>📞 +56 2 2345 6789</p>
                          <p>✉️ info@prevyseg.cl</p>
                          <p>📍 Av. Providencia 1234, Santiago</p>
                      </div>
                  </div>
                  <div className="footer-section">
                      <h4>Cursos Populares</h4>
                      <ul>
                          <li><a href="#">Desarrollo Web</a></li>
                          <li><a href="#">Marketing Digital</a></li>
                          <li><a href="#">Soldadura Industrial</a></li>
                          <li><a href="#">Gestión de Proyectos</a></li>
                      </ul>
                  </div>
                  <div className="footer-section">
                      <h4>Información</h4>
                      <ul>
                          <li><a href="#">Sobre Nosotros</a></li>
                          <li><a href="#">Metodología</a></li>
                          <li><a href="#">Certificaciones</a></li>
                          <li><a href="#">Bolsa de Trabajo</a></li>
                      </ul>
                  </div>
                  <div className="footer-section">
                      <h4>Síguenos</h4>
                      <div className="social-links">
                          <a href="#">Facebook</a>
                          <a href="#">LinkedIn</a>
                          <a href="#">Instagram</a>
                          <a href="#">YouTube</a>
                      </div>
                  </div>
              </div>
              <div className="footer-bottom">
                  <p>&copy; 2024 OTEC Prevyseg. Todos los derechos reservados.</p>
              </div>
          </div>
      </footer>
    </>
  )
}

export default App