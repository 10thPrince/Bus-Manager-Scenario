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
        { to: '/buses', label: 'Buses' },
        { to: '/schedules', label: 'Schedules' },
        { to: '/bookings', label: 'Bookings' },
        { to: '/reports', label: 'Reports' },
    ]

    const navLinkClass = ({ isActive }) =>
        `block rounded-md px-3 py-2 font-semibold ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

    return (
        <>
            <aside className='fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white shadow-sm md:flex'>
                <div className='border-b border-gray-200 px-5 py-5'>
                    <Link to='/buses' className='text-xl font-bold text-blue-700'>Y Bus Booking</Link>
                    {user?.role && (
                        <p className='mt-2 text-sm font-medium capitalize text-gray-500'>{user.role}</p>
                    )}
                </div>

                <nav className='flex-1 px-4 py-5' aria-label='Main navigation'>
                    <ul className='space-y-2'>
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink to={item.to} className={navLinkClass}>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className='border-t border-gray-200 p-4'>
                    <button
                        disabled={loading}
                        onClick={handleLogout}
                        className='w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300'
                    >
                        {loading ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </aside>

            <header className='border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                    <Link to='/buses' className='text-lg font-bold text-blue-700'>Y Bus Booking</Link>
                    {user?.role && (
                        <span className='rounded-md bg-gray-100 px-2 py-1 text-sm font-medium capitalize text-gray-700'>
                            {user.role}
                        </span>
                    )}
                </div>

                <nav className='flex gap-2 overflow-x-auto pb-1' aria-label='Mobile navigation'>
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navLinkClass}>
                            {item.label}
                        </NavLink>
                    ))}
                    <button
                        disabled={loading}
                        onClick={handleLogout}
                        className='shrink-0 rounded-md bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300'
                    >
                        {loading ? '...' : 'Logout'}
                    </button>
                </nav>
            </header>
        </>
    )
}

export default Navbar
