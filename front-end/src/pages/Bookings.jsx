import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../api/axios'
import Navbar from '../components/Navbar'

const today = new Date().toISOString().slice(0, 10)

const initialForm = {
    passengerName: '',
    passengerGender: 'Male',
    passengerPhone: '',
    seatNumber: '',
    paymentStatus: 'Pending',
    bookingDate: today,
    scheduleId: '',
}

const toDateInput = (value) => {
    return value ? String(value).slice(0, 10) : today
}

const normalizeTime = (value) => {
    return value ? String(value).slice(0, 5) : ''
}

const Bookings = () => {
    const [bookings, setBookings] = useState([])
    const [schedules, setSchedules] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingBookingId, setEditingBookingId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const res = await api.get('/booking/getAll')
            setBookings(res.data?.data || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    const fetchSchedules = async () => {
        try {
            const res = await api.get('/schedule/getAll')
            setSchedules(res.data?.data || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load schedules')
        }
    }

    useEffect(() => {
        fetchBookings()
        fetchSchedules()
    }, [])

    const getSchedule = (id) => {
        return schedules.find((schedule) => String(schedule.ScheduleID) === String(id))
    }

    const getScheduleLabel = (id) => {
        const schedule = getSchedule(id)
        return schedule
            ? `${schedule.RouteName} - ${normalizeTime(schedule.DepartureTime)}`
            : `Schedule #${id}`
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingBookingId(null)
    }

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...form,
                passengerPhone: Number(form.passengerPhone),
                seatNumber: Number(form.seatNumber),
                scheduleId: Number(form.scheduleId),
            }
            const res = editingBookingId
                ? await api.put(`/booking/update/${editingBookingId}`, payload)
                : await api.post('/booking/create', payload)

            toast.success(res.data?.message || `Booking ${editingBookingId ? 'updated' : 'created'} successfully`)
            resetForm()
            fetchBookings()
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${editingBookingId ? 'update' : 'create'} booking`)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (booking) => {
        setEditingBookingId(booking.BookingID)
        setForm({
            passengerName: booking.PassengerName || '',
            passengerGender: booking.PassengerGender || 'Male',
            passengerPhone: booking.PassengerPhone || '',
            seatNumber: booking.SeatNumber || '',
            paymentStatus: booking.PaymentStatus || 'Pending',
            bookingDate: toDateInput(booking.BookingDate),
            scheduleId: booking.ScheduleID || '',
        })
    }

    const handleDelete = async (booking) => {
        if (!window.confirm(`Delete booking for ${booking.PassengerName}?`)) return

        setDeletingId(booking.BookingID)
        try {
            const res = await api.delete(`/booking/delete/${booking.BookingID}`)
            toast.success(res.data?.message || 'Booking deleted successfully')
            if (editingBookingId === booking.BookingID) resetForm()
            fetchBookings()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete booking')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <Navbar />
            <main className='mx-auto max-w-7xl px-4 py-6'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Bookings</h1>
                    <p className='text-gray-600'>Create and manage passenger bookings for available schedules.</p>
                </div>

                <div className='grid gap-6 xl:grid-cols-[420px_1fr]'>
                    <form onSubmit={handleSubmit} className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <h2 className='mb-4 text-lg font-semibold text-gray-900'>{editingBookingId ? 'Update Booking' : 'Add Booking'}</h2>

                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='flex flex-col gap-2 sm:col-span-2'>
                                <label htmlFor='scheduleId' className='font-medium text-gray-700'>Schedule</label>
                                <select id='scheduleId' value={form.scheduleId} onChange={(e) => updateForm('scheduleId', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required>
                                    <option value=''>Select schedule</option>
                                    {schedules.map((schedule) => (
                                        <option key={schedule.ScheduleID} value={schedule.ScheduleID}>
                                            {schedule.RouteName} - {normalizeTime(schedule.DepartureTime)} - {schedule.TicketPrice}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-col gap-2 sm:col-span-2'>
                                <label htmlFor='passengerName' className='font-medium text-gray-700'>Passenger Name</label>
                                <input id='passengerName' value={form.passengerName} onChange={(e) => updateForm('passengerName', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='Passenger full name' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='passengerGender' className='font-medium text-gray-700'>Gender</label>
                                <select id='passengerGender' value={form.passengerGender} onChange={(e) => updateForm('passengerGender', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required>
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                    <option value='Other'>Other</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='passengerPhone' className='font-medium text-gray-700'>Phone</label>
                                <input id='passengerPhone' type='number' min='0' value={form.passengerPhone} onChange={(e) => updateForm('passengerPhone', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='0780000000' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='seatNumber' className='font-medium text-gray-700'>Seat Number</label>
                                <input id='seatNumber' type='number' min='1' value={form.seatNumber} onChange={(e) => updateForm('seatNumber', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='12' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='paymentStatus' className='font-medium text-gray-700'>Payment Status</label>
                                <select id='paymentStatus' value={form.paymentStatus} onChange={(e) => updateForm('paymentStatus', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required>
                                    <option value='Pending'>Pending</option>
                                    <option value='Paid'>Paid</option>
                                    <option value='Cancelled'>Cancelled</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-2 sm:col-span-2'>
                                <label htmlFor='bookingDate' className='font-medium text-gray-700'>Booking Date</label>
                                <input id='bookingDate' type='date' value={form.bookingDate} onChange={(e) => updateForm('bookingDate', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required />
                            </div>
                        </div>

                        <div className='mt-5 flex gap-3'>
                            <button type='submit' disabled={saving} className='flex-1 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'>
                                {saving ? 'Saving...' : editingBookingId ? 'Update Booking' : 'Save Booking'}
                            </button>
                            {editingBookingId && (
                                <button type='button' onClick={resetForm} className='rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50'>Cancel</button>
                            )}
                        </div>
                    </form>

                    <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Booking List</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                    <tr>
                                        <th className='px-5 py-3'>Passenger</th>
                                        <th className='px-5 py-3'>Schedule</th>
                                        <th className='px-5 py-3'>Seat</th>
                                        <th className='px-5 py-3'>Payment</th>
                                        <th className='px-5 py-3'>Date</th>
                                        <th className='px-5 py-3'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {loading ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='6'>Loading bookings...</td></tr>
                                    ) : bookings.length === 0 ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='6'>No bookings found.</td></tr>
                                    ) : (
                                        bookings.map((booking) => (
                                            <tr key={booking.BookingID} className='text-gray-700'>
                                                <td className='px-5 py-4'>
                                                    <p className='font-medium text-gray-900'>{booking.PassengerName}</p>
                                                    <p className='text-sm text-gray-500'>{booking.PassengerGender} - {booking.PassengerPhone}</p>
                                                </td>
                                                <td className='px-5 py-4'>{getScheduleLabel(booking.ScheduleID)}</td>
                                                <td className='px-5 py-4'>{booking.SeatNumber}</td>
                                                <td className='px-5 py-4'>{booking.PaymentStatus}</td>
                                                <td className='px-5 py-4'>{toDateInput(booking.BookingDate)}</td>
                                                <td className='px-5 py-4'>
                                                    <div className='flex gap-2'>
                                                        <button type='button' onClick={() => handleEdit(booking)} className='rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-700 hover:bg-blue-200'>Edit</button>
                                                        <button type='button' onClick={() => handleDelete(booking)} disabled={deletingId === booking.BookingID} className='rounded-md bg-red-100 px-3 py-1 font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50'>{deletingId === booking.BookingID ? 'Deleting...' : 'Delete'}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
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

export default Bookings
