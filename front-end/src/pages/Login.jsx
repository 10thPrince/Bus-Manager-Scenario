import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../api/axios.js'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await api.post('/auth/login', { userName, password })
            login(res.data?.user)
            toast.success(res.data?.message || 'Login successful')
            navigate('/buses')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4'>
            <div className='w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Y Bus Booking</h1>
                    <p className='mt-1 text-gray-500'>Login with your username to manage buses and bookings.</p>
                </div>

                <form className='mt-6 flex flex-col gap-4' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='userName' className='font-medium text-gray-700'>Username</label>
                        <input
                            type='text'
                            name='userName'
                            id='userName'
                            placeholder='admin'
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                            required
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor='password' className='font-medium text-gray-700'>Password</label>
                        <input
                            type='password'
                            name='password'
                            id='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='rounded-md bg-blue-600 py-2 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className='text-center text-gray-600'>
                        New here? <Link to='/register' className='font-medium text-blue-600 underline'>Register</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login
