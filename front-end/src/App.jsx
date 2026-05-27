import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import ProtectedRoutes from './components/ProtectedRoutes'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Buses from './pages/Buses'
import Schedules from './pages/Schedules'
import Bookings from './pages/Bookings'

const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/register' element={<Register />}/>
        <Route path='/' element={<Login />}/>
        <Route element={<ProtectedRoutes />}>
          <Route path='/buses' element={<Buses />} />
          <Route path='/schedules' element={<Schedules />} />
          <Route path='/bookings' element={<Bookings />} />
          <Route path='/reports' element={<Reports />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
