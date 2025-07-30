import { useAuth } from '../../hooks/auth/useAuth'
import { Button } from '../ui'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Internship Portal</h1>
      <div className="flex items-center gap-4">
        <span>Welcome, {user?.name}</span>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>
    </nav>
  )
}

export default Navbar