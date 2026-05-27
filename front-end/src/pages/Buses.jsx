import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const Buses = () => {
    const [buses, setBuses] = useState([])
    const [plateNumber, setPlateNumber] = useState('')
    const [totalSeats, setTotalSeats] = useState('')
    const [busType, setBusType] = useState('')
    const [editingBusId, setEditingBusId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const { user } = useAuth()

    const isAdmin = user?.role === 'admin'

    const fetchBuses = async () => {
        setLoading(true)
        try {
            const res = await api.get('/bus/getAll')
            setBuses(res.data?.data || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load buses')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBuses()
    }, [])

    const resetForm = () => {
        setPlateNumber('')
        setTotalSeats('')
        setBusType('')
        setEditingBusId(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                plateNumber,
                totalSeats: Number(totalSeats),
                busType,
            }
            const res = editingBusId
                ? await api.put(`/bus/update/${editingBusId}`, payload)
                : await api.post('/bus/create', payload)

            toast.success(res.data?.message || `Bus ${editingBusId ? 'updated' : 'created'} successfully`)
            resetForm()
            fetchBuses()
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${editingBusId ? 'update' : 'create'} bus`)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (bus) => {
        setEditingBusId(bus.BusID)
        setPlateNumber(bus.PlateNumber)
        setTotalSeats(bus.TotalSeats)
        setBusType(bus.BusType)
    }

    const handleDelete = async (bus) => {
        if (!window.confirm(`Delete bus ${bus.PlateNumber}?`)) return

        setDeletingId(bus.BusID)
        try {
            const res = await api.delete(`/bus/delete/${bus.BusID}`)
            toast.success(res.data?.message || 'Bus deleted successfully')
            if (editingBusId === bus.BusID) resetForm()
            fetchBuses()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete bus')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <Navbar />
            <main className='px-4 py-6 md:ml-64 md:px-6 lg:px-8'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Buses</h1>
                    <p className='text-gray-600'>Manage bus plate numbers, seat capacity, and bus types.</p>
                </div>

                <div className='grid gap-6 lg:grid-cols-[360px_1fr]'>
                    <form onSubmit={handleSubmit} className='rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
                        <div className='mb-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>{editingBusId ? 'Update Bus' : 'Add Bus'}</h2>
                            {!isAdmin && <p className='mt-1 text-sm text-orange-700'>Admin role is required to save bus records.</p>}
                        </div>

                        <div className='mb-4 flex flex-col gap-2'>
                            <label htmlFor='plateNumber' className='font-medium text-gray-700'>Plate Number</label>
                            <input
                                id='plateNumber'
                                type='text'
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value)}
                                className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                                placeholder='RAD 123 A'
                                required
                            />
                        </div>

                        <div className='mb-4 flex flex-col gap-2'>
                            <label htmlFor='totalSeats' className='font-medium text-gray-700'>Total Seats</label>
                            <input
                                id='totalSeats'
                                type='number'
                                min='1'
                                value={totalSeats}
                                onChange={(e) => setTotalSeats(e.target.value)}
                                className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                                placeholder='45'
                                required
                            />
                        </div>

                        <div className='mb-5 flex flex-col gap-2'>
                            <label htmlFor='busType' className='font-medium text-gray-700'>Bus Type</label>
                            <input
                                id='busType'
                                type='text'
                                value={busType}
                                onChange={(e) => setBusType(e.target.value)}
                                className='rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500'
                                placeholder='Express'
                                required
                            />
                        </div>

                        <div className='flex gap-3'>
                            <button
                                type='submit'
                                disabled={saving || !isAdmin}
                                className='flex-1 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
                            >
                                {saving ? 'Saving...' : editingBusId ? 'Update Bus' : 'Save Bus'}
                            </button>
                            {editingBusId && (
                                <button
                                    type='button'
                                    onClick={resetForm}
                                    className='rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50'
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <section className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
                        <div className='border-b border-gray-200 px-5 py-4'>
                            <h2 className='text-lg font-semibold text-gray-900'>Bus List</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left'>
                                <thead className='bg-gray-50 text-sm uppercase text-gray-500'>
                                    <tr>
                                        <th className='px-5 py-3'>ID</th>
                                        <th className='px-5 py-3'>Plate Number</th>
                                        <th className='px-5 py-3'>Seats</th>
                                        <th className='px-5 py-3'>Type</th>
                                        <th className='px-5 py-3'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {loading ? (
                                        <tr>
                                            <td className='px-5 py-4 text-gray-500' colSpan='5'>Loading buses...</td>
                                        </tr>
                                    ) : buses.length === 0 ? (
                                        <tr>
                                            <td className='px-5 py-4 text-gray-500' colSpan='5'>No buses found.</td>
                                        </tr>
                                    ) : (
                                        buses.map((bus) => (
                                            <tr key={bus.BusID} className='text-gray-700'>
                                                <td className='px-5 py-4 font-medium'>{bus.BusID}</td>
                                                <td className='px-5 py-4'>{bus.PlateNumber}</td>
                                                <td className='px-5 py-4'>{bus.TotalSeats}</td>
                                                <td className='px-5 py-4'>{bus.BusType}</td>
                                                <td className='px-5 py-4'>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleEdit(bus)}
                                                            disabled={!isAdmin}
                                                            className='rounded-md bg-blue-100 px-3 py-1 font-medium text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50'
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type='button'
                                                            disabled={!isAdmin || deletingId === bus.BusID}
                                                            onClick={() => handleDelete(bus)}
                                                            className='rounded-md bg-red-100 px-3 py-1 font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50'
                                                        >
                                                            {deletingId === bus.BusID ? 'Deleting...' : 'Delete'}
                                                        </button>
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

export default Buses
