import './index.css' // Importa los estilos globales
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom' 

// Importación de Componentes
import RegistroForm from './components/forms/RegistroForm'
import LoginForm from './components/forms/LoginForm' // Nuevo: Importamos el LoginForm

// Importamos los dashboards placeholder
import ClienteDashboard from './pages/dashboards/ClienteDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import EmpresaDashboard from './pages/dashboards/EmpresaDashboard'

// Componentes Placeholder para Rutas Auxiliares
const NotFound = () => <h1 style={{ textAlign: 'center', marginTop: '50px', color: '#dc2626' }}>404 | Página no encontrada</h1>;
const RecoveryPassword = () => <h1 style={{ textAlign: 'center', marginTop: '50px', color: '#f59e0b' }}>Recuperación de Contraseña (Próximamente)</h1>;


function Home() {
// ... (El contenido del Home Component es muy extenso y se mantiene sin cambios) ...

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
                            {/* Ajuste: Si quieres que el botón "Inscríbete Ahora" sea el login, cámbialo. 
                                Si es el registro, está bien como está. Dejamos como registro/inscripción. */}
                            <Link to={"/Inscripcion"}>
                                <button className="btn-primary">Inscríbete Ahora</button>
                            </Link> 
                            {/* Podrías añadir un link de Login aquí: <Link to="/login">Iniciar Sesión</Link> */}
                        </div>
                    </div>
                </header>
            <main>
                <section className="hero">
                    {/* ... (Todo el contenido de main se mantiene sin cambios) ... */}
                </section>
            </main>
            <footer id="contacto" className="footer">
                {/* ... (El contenido del footer se mantiene sin cambios) ... */}
            </footer>
            </>
        )
}

function App (){
    return (
        <Router>
            <Routes>
                {/* Rutas Públicas */}
                <Route path='/' element={<Home/>}/>
                <Route path='/inscripcion' element={<RegistroForm/>}/>

                {/* Rutas de Autenticación */}
                <Route path='/login' element={<LoginForm/>}/> 
                <Route path='/recuperar-password' element={<RecoveryPassword/>}/>

                {/* Rutas de Dashboards (Objetivo de la redirección exitosa) */}
                <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />

                {/* Ruta Comodín (404) */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}

export default App