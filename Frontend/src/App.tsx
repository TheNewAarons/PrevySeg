import './styles/index.css' // Importa los estilos globales
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import RegistroForm from './features/auth/components/RegistroForm'
import LoginForm from './features/auth/components/LoginForm'
import ListUsers from './features/admin/pages/ListUser'
import UserDetailPage from './features/admin/pages/UserDetailPage'
import EditUser from './features/admin/pages/EditUser'
import AdministradorDashboard from './features/admin/pages/AdminDashboard'
import EmpresaDashboard from './features/empresa/pages/EmpresaDashboard'
import CreateUserPage from './features/admin/pages/CreateUserPage'
import ClienteDashboard from './features/client/pages/ClienteDashboard'
import CrearCurso from './features/courses/pages/CrearCurso'
import EditarCurso from './features/courses/pages/EditarCurso'
import DetalleCurso from './features/courses/pages/DetalleCurso'
import ListaCursos from './features/courses/pages/ListaCursos'
import CursosEnCurso from './features/courses/pages/CursosEnCurso'
import AprobarPapeles from './features/admin/pages/AprobarPapeles'
import Horarios from './features/admin/pages/Horarios'
import Reportes from './features/admin/pages/Reportes'
import DetalleDocumento from './features/client/pages/DetalleDocumento.jsx' 
import Home from './pages/home.jsx'
import { AuthProvider } from './services/authContext.jsx'
import { PublicRoute, RoleRoute} from './services/protectedRouted.jsx'

function App() {
    
    return (
        <Router>
            {/* Envolvemos con AuthProvider para tener acceso al contexto */}
            <AuthProvider>
                <Routes>
                    {/* ========== RUTAS PÚBLICAS ========== */}
                    <Route path='/' element={<Home />} />
                    
                    {/* Solo accesibles si NO estás autenticado */}
                    <Route path='/inscripcion' element={
                        <PublicRoute>
                            <RegistroForm />
                        </PublicRoute>
                    } />
                    
                    <Route path='/login' element={
                        <PublicRoute>
                            <LoginForm />
                        </PublicRoute>
                    } />

                    {/* ========== RUTAS SOLO CLIENTE ========== */}
                    <Route path='/cliente/dashboard' element={
                        <RoleRoute allowedRole="Cliente">
                            <ClienteDashboard />
                        </RoleRoute>
                    } />
                    
                    <Route path='/cliente/detalle-documento' element={
                        <RoleRoute allowedRole="Cliente">
                            <DetalleDocumento />
                        </RoleRoute>
                    } />

                    {/* ========== RUTAS SOLO ADMINISTRADOR ========== */}
                    <Route path='/administrador/dashboard' element={
                        <RoleRoute allowedRole="Administrador">
                            <AdministradorDashboard />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/crear-user' element={
                        <RoleRoute allowedRole="Administrador">
                            <CreateUserPage />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/list-users' element={
                        <RoleRoute allowedRole="Administrador">
                            <ListUsers />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/usuario/:id' element={
                        <RoleRoute allowedRole="Administrador">
                            <UserDetailPage />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/usuario/editar/:id' element={
                        <RoleRoute allowedRole="Administrador">
                            <EditUser />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/aprobar-papeles' element={
                        <RoleRoute allowedRole="Administrador">
                            <AprobarPapeles />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/horarios' element={
                        <RoleRoute allowedRole="Administrador">
                            <Horarios />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/reportes' element={
                        <RoleRoute allowedRole="Administrador">
                            <Reportes />
                        </RoleRoute>
                    } />

                    {/* ========== RUTAS DE CURSOS (SOLO ADMIN) ========== */}
                    <Route path='/administrador/cursos' element={
                        <RoleRoute allowedRole="Administrador">
                            <ListaCursos />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/cursos/crear' element={
                        <RoleRoute allowedRole="Administrador">
                            <CrearCurso />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/cursos/en-curso' element={
                        <RoleRoute allowedRole="Administrador">
                            <CursosEnCurso />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/cursos/:id' element={
                        <RoleRoute allowedRole="Administrador">
                            <DetalleCurso />
                        </RoleRoute>
                    } />
                    
                    <Route path='/administrador/cursos/:id/editar' element={
                        <RoleRoute allowedRole="Administrador">
                            <EditarCurso />
                        </RoleRoute>
                    } />

                    {/* ========== RUTAS SOLO EMPRESA ========== */}
                    <Route path='/empresa/dashboard' element={
                        <RoleRoute allowedRole="Empresa">
                            <EmpresaDashboard />
                        </RoleRoute>
                    } />

                    {/* ========== RUTA 404 ========== */}
                    <Route path='*' element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}
export default App
