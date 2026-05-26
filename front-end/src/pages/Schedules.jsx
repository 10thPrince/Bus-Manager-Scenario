import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const initialForm = {
    routeName: '',
    departurePoint: '',
    destination: '',
    departureTime: '',
    estimatedArrivalTime: '',
    ticketPrice: '',
    scheduleStatus: 'Active',
    busId: '',
}

const normalizeTime = (value) => {
    return value ? String(value).slice(0, 5) : ''
}

const Schedules = () => {
    const [schedules, setSchedules] = useState([])
    const [buses, setBuses] = useState([])
    const [form, setForm] = useState(initialForm)
    const [editingScheduleId, setEditingScheduleId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const { user } = useAuth()

    const isAdmin = user?.role === 'admin'

    const fetchSchedules = async () => {
        setLoading(true)
        try {
            const res = await api.get('/schedule/getAll')
            setSchedules(res.data?.data || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load schedules')
        } finally {
            setLoading(false)
        }
    }

    const fetchBuses = async () => {
        try {
            const res = await api.get('/bus/getAll')
            setBuses(res.data?.data || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load buses')
        }
    }

    useEffect(() => {
        fetchSchedules()
        fetchBuses()
    }, [])

    const getBusLabel = (id) => {
        const bus = buses.find((item) => String(item.BusID) === String(id))
        return bus ? `${bus.PlateNumber} (${bus.BusType})` : `Bus #${id}`
    }

    const resetForm = () => {
        setForm(initialForm)
        setEditingScheduleId(null)
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
                ticketPrice: Number(form.ticketPrice),
                busId: Number(form.busId),
            }
            const res = editingScheduleId
                ? await api.put(`/schedule/update/${editingScheduleId}`, payload)
                : await api.post('/schedule/create', payload)

            toast.success(res.data?.message || `Schedule ${editingScheduleId ? 'updated' : 'created'} successfully`)
            resetForm()
            fetchSchedules()
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${editingScheduleId ? 'update' : 'create'} schedule`)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (schedule) => {
        setEditingScheduleId(schedule.ScheduleID)
        setForm({
            routeName: schedule.RouteName || '',
            departurePoint: schedule.DeparturePoint || '',
            destination: schedule.Destination || '',
            departureTime: normalizeTime(schedule.DepartureTime),
            estimatedArrivalTime: normalizeTime(schedule.EstimatedArrivalTime),
            ticketPrice: schedule.TicketPrice || '',
            scheduleStatus: schedule.ScheduleStatus || 'Active',
            busId: schedule.BusID || '',
        })
    }

    const handleDelete = async (schedule) => {
        if (!window.confirm(`Delete schedule ${schedule.RouteName}?`)) return

        setDeletingId(schedule.ScheduleID)
        try {
            const res = await api.delete(`/schedule/delete/${schedule.ScheduleID}`)
            toast.success(res.data?.message || 'Schedule deleted successfully')
            if (editingScheduleId === schedule.ScheduleID) resetForm()
            fetchSchedules()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete schedule')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <Navbar />
            <main className='mx-auto max-w-7xl px-4 py-6'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Schedules</h1>
                    <p className='text-gray-600'>Create routes, departure times, ticket prices, and status for each bus.</p>
                </div>

                <div className='grid gap-6 xl:grid-cols-[420px_1fr]'>
                    <form onSubmit={handleSubmit} className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <div className='mb-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>{editingScheduleId ? 'Update Schedule' : 'Add Schedule'}</h2>
                            {!isAdmin && <p className='mt-1 text-sm text-orange-700'>Admin role is required to save schedules.</p>}
                        </div>

                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='flex flex-col gap-2 sm:col-span-2'>
                                <label htmlFor='routeName' className='font-medium text-gray-700'>Route Name</label>
                                <input id='routeName' value={form.routeName} onChange={(e) => updateForm('routeName', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='Kigali - Musanze' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='departurePoint' className='font-medium text-gray-700'>Departure Point</label>
                                <input id='departurePoint' value={form.departurePoint} onChange={(e) => updateForm('departurePoint', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='Nyabugogo' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='destination' className='font-medium text-gray-700'>Destination</label>
                                <input id='destination' value={form.destination} onChange={(e) => updateForm('destination', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='Musanze' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='departureTime' className='font-medium text-gray-700'>Departure Time</label>
                                <input id='departureTime' type='time' value={form.departureTime} onChange={(e) => updateForm('departureTime', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='estimatedArrivalTime' className='font-medium text-gray-700'>Arrival Time</label>
                                <input id='estimatedArrivalTime' type='time' value={form.estimatedArrivalTime} onChange={(e) => updateForm('estimatedArrivalTime', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='ticketPrice' className='font-medium text-gray-700'>Ticket Price</label>
                                <input id='ticketPrice' type='number' min='0' value={form.ticketPrice} onChange={(e) => updateForm('ticketPrice', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' placeholder='5000' required />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='scheduleStatus' className='font-medium text-gray-700'>Status</label>
                                <select id='scheduleStatus' value={form.scheduleStatus} onChange={(e) => updateForm('scheduleStatus', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required>
                                    <option value='Active'>Active</option>
                                    <option value='Delayed'>Delayed</option>
                                    <option value='Cancelled'>Cancelled</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-2 sm:col-span-2'>
                                <label htmlFor='busId' className='font-medium text-gray-700'>Bus</label>
                                <select id='busId' value={form.busId} onChange={(e) => updateForm('busId', e.target.value)} className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500' required>
                                    <option value=''>Select bus</option>
                                    {buses.map((bus) => (
                                        <option key={bus.BusID} value={bus.BusID}>{bus.PlateNumber} - {bus.BusType}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='mt-5 flex gap-3'>
                            <button type='submit' disabled={saving || !isAdmin} className='flex-1 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'>
                                {saving ? 'Saving...' : editingScheduleId ? 'Update Schedule' : 'Save Schedule'}
                            </button>
                            {editingScheduleId && (
                                <button type='button' onClick={resetForm} className='rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50'>Cancel</button>
                            )}
                        </div>
                    </form>

                    <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Schedule List</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                    <tr>
                                        <th className='px-5 py-3'>Route</th>
                                        <th className='px-5 py-3'>Bus</th>
                                        <th className='px-5 py-3'>Departure</th>
                                        <th className='px-5 py-3'>Arrival</th>
                                        <th className='px-5 py-3'>Price</th>
                                        <th className='px-5 py-3'>Status</th>
                                        <th className='px-5 py-3'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {loading ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='7'>Loading schedules...</td></tr>
                                    ) : schedules.length === 0 ? (
                                        <tr><td className='px-5 py-4 text-gray-500' colSpan='7'>No schedules found.</td></tr>
                                    ) : (
                                        schedules.map((schedule) => (
                                            <tr key={schedule.ScheduleID} className='text-gray-700'>
                                                <td className='px-5 py-4'>
                                                    <p className='font-medium text-gray-900'>{schedule.RouteName}</p>
                                                    <p className='text-sm text-gray-500'>{schedule.DeparturePoint} to {schedule.Destination}</p>
                                                </td>
                                                <td className='px-5 py-4'>{getBusLabel(schedule.BusID)}</td>
                                                <td className='px-5 py-4'>{normalizeTime(schedule.DepartureTime)}</td>
                                                <td className='px-5 py-4'>{normalizeTime(schedule.EstimatedArrivalTime)}</td>
                                                <td className='px-5 py-4'>{schedule.TicketPrice}</td>
                                                <td className='px-5 py-4'>{schedule.ScheduleStatus}</td>
                                                <td className='px-5 py-4'>
                                                    <div className='flex gap-2'>
                                                        <button type='button' onClick={() => handleEdit(schedule)} disabled={!isAdmin} className='rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50'>Edit</button>
                                                        <button type='button' onClick={() => handleDelete(schedule)} disabled={!isAdmin || deletingId === schedule.ScheduleID} className='rounded-md bg-red-100 px-3 py-1 font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50'>{deletingId === schedule.ScheduleID ? 'Deleting...' : 'Delete'}</button>
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

export default Schedules
