import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../api/axios'
import Navbar from '../components/Navbar'

const normalizeTime = (value) => {
    return value ? String(value).slice(0, 5) : ''
}

const formatDate = (value) => {
    return value ? String(value).slice(0, 10) : ''
}

const Reports = () => {
    const [buses, setBuses] = useState([])
    const [schedules, setSchedules] = useState([])
    const [bookings, setBookings] = useState([])
    const [selectedPassengerRoute, setSelectedPassengerRoute] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchReports = async () => {
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
                toast.error(err.response?.data?.message || 'Failed to load reports')
            } finally {
                setLoading(false)
            }
        }

        fetchReports()
    }, [])

    const getBus = useCallback((id) => {
        return buses.find((bus) => String(bus.BusID) === String(id))
    }, [buses])

    const getSchedule = useCallback((id) => {
        return schedules.find((schedule) => String(schedule.ScheduleID) === String(id))
    }, [schedules])

    const paidBookings = useMemo(() => {
        return bookings.filter((booking) => String(booking.PaymentStatus).toLowerCase() === 'paid')
    }, [bookings])

    const pendingBookings = useMemo(() => {
        return bookings.filter((booking) => String(booking.PaymentStatus).toLowerCase() === 'pending')
    }, [bookings])

    const totalRevenue = useMemo(() => {
        return paidBookings.reduce((total, booking) => {
            const schedule = getSchedule(booking.ScheduleID)
            return total + Number(schedule?.TicketPrice || 0)
        }, 0)
    }, [paidBookings, getSchedule])

    const totalSeats = useMemo(() => {
        return buses.reduce((total, bus) => total + Number(bus.TotalSeats || 0), 0)
    }, [buses])

    const routeSummary = useMemo(() => {
        return schedules.map((schedule) => {
            const scheduleBookings = bookings.filter((booking) => String(booking.ScheduleID) === String(schedule.ScheduleID))
            const schedulePaidBookings = scheduleBookings.filter((booking) => String(booking.PaymentStatus).toLowerCase() === 'paid')
            const bus = getBus(schedule.BusID)
            const seats = Number(bus?.TotalSeats || 0)
            const bookedSeats = scheduleBookings.length

            return {
                id: schedule.ScheduleID,
                routeName: schedule.RouteName,
                bus: bus?.PlateNumber || `Bus #${schedule.BusID}`,
                departure: normalizeTime(schedule.DepartureTime),
                status: schedule.ScheduleStatus,
                bookings: bookedSeats,
                paid: schedulePaidBookings.length,
                seats,
                occupancy: seats > 0 ? (bookedSeats / seats) * 100 : 0,
                revenue: schedulePaidBookings.length * Number(schedule.TicketPrice || 0),
            }
        })
    }, [schedules, bookings, getBus])

    const busSummary = useMemo(() => {
        return buses.map((bus) => {
            const busSchedules = schedules.filter((schedule) => String(schedule.BusID) === String(bus.BusID))
            const busScheduleIds = busSchedules.map((schedule) => String(schedule.ScheduleID))
            const busBookings = bookings.filter((booking) => busScheduleIds.includes(String(booking.ScheduleID)))

            return {
                id: bus.BusID,
                plateNumber: bus.PlateNumber,
                busType: bus.BusType,
                seats: bus.TotalSeats,
                schedules: busSchedules.length,
                bookings: busBookings.length,
            }
        })
    }, [buses, schedules, bookings])

    const routeOptions = useMemo(() => {
        return [...new Set(schedules.map((schedule) => schedule.RouteName).filter(Boolean))]
            .sort((first, second) => first.localeCompare(second))
    }, [schedules])

    const passengerBookings = useMemo(() => {
        if (!selectedPassengerRoute) return bookings

        return bookings.filter((booking) => {
            const schedule = getSchedule(booking.ScheduleID)
            return schedule?.RouteName === selectedPassengerRoute
        })
    }, [bookings, getSchedule, selectedPassengerRoute])

    const recentBookings = useMemo(() => {
        return [...passengerBookings]
            .sort((first, second) => new Date(second.BookingDate) - new Date(first.BookingDate))
            .slice(0, 10)
    }, [passengerBookings])

    const summaryCards = [
        { label: 'Total Revenue', value: totalRevenue.toFixed(2) },
        { label: 'Total Buses', value: buses.length },
        { label: 'Total Seats', value: totalSeats },
        { label: 'Pending Payments', value: pendingBookings.length },
    ]

    return (
        <div className='min-h-screen bg-gray-100'>
            <Navbar />
            <main className='px-4 py-6 md:ml-64 md:px-6 lg:px-8'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Reports</h1>
                    <p className='text-gray-600'>Review route occupancy, bus use, booking activity, and paid revenue.</p>
                </div>

                <section className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {summaryCards.map((card) => (
                        <div key={card.label} className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                            <p className='text-sm font-medium uppercase text-gray-500'>{card.label}</p>
                            <p className='mt-3 text-3xl font-bold text-gray-900'>{loading ? '...' : card.value}</p>
                        </div>
                    ))}
                </section>

                <section className='mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                    <div className='border-b border-gray-200 px-5 py-4'>
                        <h2 className='text-lg font-semibold text-gray-900'>Route Summary</h2>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                <tr>
                                    <th className='px-5 py-3'>Route</th>
                                    <th className='px-5 py-3'>Bus</th>
                                    <th className='px-5 py-3'>Bookings</th>
                                    <th className='px-5 py-3'>Paid</th>
                                    <th className='px-5 py-3'>Occupancy</th>
                                    <th className='px-5 py-3'>Revenue</th>
                                    <th className='px-5 py-3'>Status</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {loading ? (
                                    <tr><td className='px-5 py-4 text-gray-500' colSpan='7'>Loading route report...</td></tr>
                                ) : routeSummary.length === 0 ? (
                                    <tr><td className='px-5 py-4 text-gray-500' colSpan='7'>No schedules found.</td></tr>
                                ) : (
                                    routeSummary.map((route) => (
                                        <tr key={route.id} className='text-gray-700'>
                                            <td className='px-5 py-4'>
                                                <p className='font-medium text-gray-900'>{route.routeName}</p>
                                                <p className='text-sm text-gray-500'>{route.departure}</p>
                                            </td>
                                            <td className='px-5 py-4'>{route.bus}</td>
                                            <td className='px-5 py-4'>{route.bookings}</td>
                                            <td className='px-5 py-4'>{route.paid}</td>
                                            <td className='px-5 py-4'>{route.occupancy.toFixed(1)}%</td>
                                            <td className='px-5 py-4'>{route.revenue.toFixed(2)}</td>
                                            <td className='px-5 py-4'>{route.status}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className='grid gap-6 lg:grid-cols-2'>
                    <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Bus Utilization</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                    <tr>
                                        <th className='px-5 py-3'>Bus</th>
                                        <th className='px-5 py-3'>Type</th>
                                        <th className='px-5 py-3'>Seats</th>
                                        <th className='px-5 py-3'>Schedules</th>
                                        <th className='px-5 py-3'>Bookings</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {loading ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='5'>Loading bus report...</td></tr>
                                    ) : busSummary.length === 0 ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='5'>No buses found.</td></tr>
                                    ) : (
                                        busSummary.map((bus) => (
                                            <tr key={bus.id} className='text-gray-700'>
                                                <td className='px-5 py-4 font-medium text-gray-900'>{bus.plateNumber}</td>
                                                <td className='px-5 py-4'>{bus.busType}</td>
                                                <td className='px-5 py-4'>{bus.seats}</td>
                                                <td className='px-5 py-4'>{bus.schedules}</td>
                                                <td className='px-5 py-4'>{bus.bookings}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <h2 className='text-lg font-semibold text-gray-900'>Passenger Bookings</h2>
                                <p className='text-sm text-gray-500'>
                                    {loading ? 'Loading passengers...' : `${passengerBookings.length} passenger${passengerBookings.length === 1 ? '' : 's'}${selectedPassengerRoute ? ` on ${selectedPassengerRoute}` : ''}`}
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 sm:min-w-56'>
                                <label htmlFor='passengerRouteFilter' className='text-sm font-medium text-gray-700'>Filter by route</label>
                                <select
                                    id='passengerRouteFilter'
                                    value={selectedPassengerRoute}
                                    onChange={(e) => setSelectedPassengerRoute(e.target.value)}
                                    className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                                >
                                    <option value=''>All routes</option>
                                    {routeOptions.map((route) => (
                                        <option key={route} value={route}>{route}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                    <tr>
                                        <th className='px-5 py-3'>Passenger</th>
                                        <th className='px-5 py-3'>Route</th>
                                        <th className='px-5 py-3'>Seat</th>
                                        <th className='px-5 py-3'>Payment</th>
                                        <th className='px-5 py-3'>Date</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {loading ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='5'>Loading booking report...</td></tr>
                                    ) : recentBookings.length === 0 ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='5'>{selectedPassengerRoute ? 'No passenger bookings found for this route.' : 'No bookings found.'}</td></tr>
                                    ) : (
                                        recentBookings.map((booking) => {
                                            const schedule = getSchedule(booking.ScheduleID)
                                            return (
                                                <tr key={booking.BookingID} className='text-gray-700'>
                                                    <td className='px-5 py-4 font-medium text-gray-900'>{booking.PassengerName}</td>
                                                    <td className='px-5 py-4'>{schedule?.RouteName || `Schedule #${booking.ScheduleID}`}</td>
                                                    <td className='px-5 py-4'>{booking.SeatNumber}</td>
                                                    <td className='px-5 py-4'>{booking.PaymentStatus}</td>
                                                    <td className='px-5 py-4'>{formatDate(booking.BookingDate)}</td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Reports
