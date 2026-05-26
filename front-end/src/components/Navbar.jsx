import { NavLink, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const [loading, setLoading] = useState(false)


    const { logout, user } = useAuth()
    const navigate = useNavigate();


    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/logout');
            logout();
            toast.success(res.data?.message || 'Logout yakunze!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || "An eroor Occured")
        } finally {
            setLoading(false);
        }
    }


    const navItems = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/buses', label: 'Buses' },
        { to: '/schedules', label: 'Schedules' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/reports', label: 'Reports' },
    ]

    return (
        <div className='border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6'>
            <div className='mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center justify-between'>
                <Link to={'/dashboard'} className='text-xl font-bold text-blue-700'>Y Bus Booking</Link>
                {user?.role && (
                    <span className='rounded-md bg-gray-100 px-2 py-1 text-sm font-medium capitalize text-gray-700 md:hidden'>
                        {user.role}
                    </span>
                )}
            </div>

            <div className='flex flex-wrap items-center gap-3'>
                <ul className='flex flex-wrap gap-2 text-sm font-semibold text-gray-700 md:text-base'>
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `block rounded-md px-3 py-2 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex items-center gap-3'>
                {user?.role && (
                    <span className='hidden rounded-md bg-gray-100 px-3 py-2 text-sm font-medium capitalize text-gray-700 md:inline-flex'>
                        {user.role}
                    </span>
                )}
                <button disabled={loading} onClick={handleLogout} className='rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300'>
                    {loading ? "Logging out...":  "Logout"}
                </button>
            </div>
            </div>
        </div>
    )
}

export default Navbar
