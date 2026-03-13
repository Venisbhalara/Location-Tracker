import { useEffect, useState } from 'react'
import { getContacts, createContact, updateContact, deleteContact } from '../services/api'
import toast from 'react-hot-toast'

const emptyForm = { name: '', phone: '', email: '', notes: '' }

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [form,     setForm]     = useState(emptyForm)
  const [editId,   setEditId]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)

  const load = async (q = '') => {
    setLoading(true)
    try {
      const res = await getContacts({ search: q, limit: 50 })
      setContacts(res.data.contacts)
    } catch { toast.error('Failed to load contacts.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (c) => { setForm({ name: c.name, phone: c.phone, email: c.email || '', notes: c.notes || '' }); setEditId(c.id); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) {
        await updateContact(editId, form)
        toast.success('Contact updated!')
      } else {
        await createContact(form)
        toast.success('Contact added!')
      }
      setShowForm(false); load(search)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try { await deleteContact(id); toast.success('Deleted.'); load(search) }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">+ Add Contact</button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        <input type="text" placeholder="Search by name, phone or email..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card mb-6 border-indigo-500/40">
          <h2 className="font-semibold text-white mb-4">{editId ? 'Edit Contact' : 'New Contact'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" required placeholder="Full name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" required placeholder="Phone number"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="email@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Optional notes"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm" disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Contact'}
              </button>
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-slate-400">No contacts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="card hover:border-slate-700 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{c.name}</p>
                  <p className="text-sm text-slate-400">📞 {c.phone}</p>
                  {c.email && <p className="text-xs text-slate-500">✉️ {c.email}</p>}
                  {c.notes && <p className="text-xs text-slate-600 mt-1 italic truncate">{c.notes}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-3 border-t border-slate-800">
                <button onClick={() => openEdit(c)} className="text-xs text-indigo-400 hover:underline">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Contacts
