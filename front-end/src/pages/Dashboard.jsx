import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../api/axios'
import Navbar from '../components/Navbar'

const normalizeTime = (value) => {
    return value ? String(value).slice(0, 5) : ''
}

const Dashboard = () => {
    const [buses, setBuses] = useState([])
    const [schedules, setSchedules] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                const [busRes, scheduleRes, bookingRes] = await Promise.all([
                    api.get('/bus/getAll'),
                    api.get('/schedule/getAll'),
                    api.get('/booking/getAll'),
                ])

                setBuses(busRes.data?.data || [])
                setSchedules(scheduleRes.data?.data || [])
                setBookings(bookingRes.data?.data || [])
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const getSchedule = useCallback((id) => {
        return schedules.find((schedule) => String(schedule.ScheduleID) === String(id))
    }, [schedules])

    const activeSchedules = useMemo(() => {
        return schedules.filter((schedule) => String(schedule.ScheduleStatus).toLowerCase() === 'active')
    }, [schedules])

    const paidBookings = useMemo(() => {
        return bookings.filter((booking) => String(booking.PaymentStatus).toLowerCase() === 'paid')
    }, [bookings])

    const estimatedRevenue = useMemo(() => {
        return paidBookings.reduce((total, booking) => {
            const schedule = getSchedule(booking.ScheduleID)
            return total + Number(schedule?.TicketPrice || 0)
        }, 0)
    }, [paidBookings, getSchedule])

    const totalSeats = useMemo(() => {
        return buses.reduce((total, bus) => total + Number(bus.TotalSeats || 0), 0)
    }, [buses])

    const cards = [
        { label: 'Buses', value: buses.length, to: '/buses' },
        { label: 'Schedules', value: schedules.length, to: '/schedules' },
        { label: 'Bookings', value: bookings.length, to: '/bookings' },
        { label: 'Paid Revenue', value: estimatedRevenue.toFixed(2), to: '/reports' },
    ]

    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((first, second) => new Date(second.BookingDate) - new Date(first.BookingDate))
            .slice(0, 6)
    }, [bookings])

    return (
        <div className='min-h-screen bg-gray-100'>
            <Navbar />
            <main className='mx-auto max-w-7xl px-4 py-6'>
                <div className='mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
                        <p className='text-gray-600'>Overview of buses, schedules, passenger bookings, and paid revenue.</p>
                    </div>
                    <Link to='/reports' className='rounded-md bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700'>
                        View Reports
                    </Link>
                </div>

                <section className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {cards.map((card) => (
                        <Link key={card.label} to={card.to} className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300'>
                            <p className='text-sm font-medium uppercase text-gray-500'>{card.label}</p>
                            <p className='mt-3 text-3xl font-bold text-gray-900'>{loading ? '...' : card.value}</p>
                        </Link>
                    ))}
                </section>

                <section className='mb-6 grid gap-4 md:grid-cols-3'>
                    <div className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm font-medium uppercase text-gray-500'>Total Seats</p>
                        <p className='mt-3 text-3xl font-bold text-gray-900'>{loading ? '...' : totalSeats}</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm font-medium uppercase text-gray-500'>Active Schedules</p>
                        <p className='mt-3 text-3xl font-bold text-gray-900'>{loading ? '...' : activeSchedules.length}</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <p className='text-sm font-medium uppercase text-gray-500'>Paid Bookings</p>
                        <p className='mt-3 text-3xl font-bold text-gray-900'>{loading ? '...' : paidBookings.length}</p>
                    </div>
                </section>

                <section className='grid gap-6 lg:grid-cols-2'>
                    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Active Routes</h2>
                        </div>
                        <div className='divide-y divide-gray-100'>
                            {loading ? (
                                <p className='px-5 py-4 text-gray-500'>Loading routes...</p>
                            ) : activeSchedules.length === 0 ? (
                                <p className='px-5 py-4 text-gray-500'>No active schedules.</p>
                            ) : (
                                activeSchedules.slice(0, 6).map((schedule) => (
                                    <div key={schedule.ScheduleID} className='flex items-center justify-between gap-4 px-5 py-4'>
                                        <div>
                                            <p className='font-medium text-gray-900'>{schedule.RouteName}</p>
                                            <p className='text-sm text-gray-500'>{schedule.DeparturePoint} to {schedule.Destination}</p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-semibold text-gray-900'>{normalizeTime(schedule.DepartureTime)}</p>
                                            <p className='text-sm text-gray-500'>{schedule.TicketPrice}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Recent Bookings</h2>
                        </div>
                        <div className='divide-y divide-gray-100'>
                            {loading ? (
                                <p className='px-5 py-4 text-gray-500'>Loading bookings...</p>
                            ) : recentBookings.length === 0 ? (
                                <p className='px-5 py-4 text-gray-500'>No bookings found.</p>
                            ) : (
                                recentBookings.map((booking) => {
                                    const schedule = getSchedule(booking.ScheduleID)
                                    return (
                                        <div key={booking.BookingID} className='flex items-center justify-between gap-4 px-5 py-4'>
                                            <div>
                                                <p className='font-medium text-gray-900'>{booking.PassengerName}</p>
                                                <p className='text-sm text-gray-500'>{schedule?.RouteName || `Schedule #${booking.ScheduleID}`}</p>
                                            </div>
                                            <div className='text-right'>
                                                <p className='font-semibold text-gray-900'>Seat {booking.SeatNumber}</p>
                                                <p className='text-sm text-gray-500'>{booking.PaymentStatus}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Dashboard
