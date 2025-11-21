import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import TeacherDashboard from './pages/TeacherDashboard'
import PrincipalDashboard from './pages/PrincipalDashboard'


export default function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-gray-50 text-gray-900">
				<Navbar />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/login" element={<Login />} />
						<Route element={<ProtectedRoute />}>
							<Route path="/upload" element={<Upload />} />
						</Route>
						<Route element={<ProtectedRoute role="teacher" />}> 
							<Route path="/teacher" element={<TeacherDashboard />} />
						</Route>
						<Route element={<ProtectedRoute role="principal" />}> 
							<Route path="/principal" element={<PrincipalDashboard />} />
						</Route>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}

