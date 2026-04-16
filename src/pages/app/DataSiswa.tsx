import { useState, FormEvent } from 'react';
import { useApp, Major } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, UserPlus, X, Trash2, Edit2, Database } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DataSiswa() {
  const { students, addStudent, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [newStudent, setNewStudent] = useState({
    nism: '',
    name: '',
    kelas: '',
  });

  const majors: Major[] = ['Akuntansi', 'Bisnis Ritel', 'DKV', 'Perkantoran', 'RPL'];
  const grades = ['10', '11', '12'];
  const subClasses = ['1', '2'];

  const allClassOptions = grades.flatMap(g => 
    majors.flatMap(m => 
      subClasses.map(s => `${g} ${m} ${s}`)
    )
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addStudent(newStudent);
      setNewStudent({ nism: '', name: '', kelas: '' });
      setIsModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data siswa telah ditambahkan.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
      });
    }
  };

  const seedDummyData = async () => {
    const result = await Swal.fire({
      title: 'Seed Data Dummy?',
      text: "Ini akan menambahkan 10 data siswa contoh ke database.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tambahkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const dummyNames = ['Ahmad Fauzi', 'Budi Santoso', 'Citra Lestari', 'Dedi Kurniawan', 'Eka Putri', 'Fajar Ramadhan', 'Gita Permata', 'Hadi Wijaya', 'Indah Sari', 'Joko Susilo'];
      
      for (let i = 0; i < 10; i++) {
        const randomMajor = majors[Math.floor(Math.random() * majors.length)];
        const randomGrade = grades[Math.floor(Math.random() * grades.length)];
        const randomSub = subClasses[Math.floor(Math.random() * subClasses.length)];
        
        await addStudent({
          nism: `2024${Math.floor(1000 + Math.random() * 9000)}`,
          name: dummyNames[i],
          kelas: `${randomGrade} ${randomMajor} ${randomSub}`
        });
      }
      
      Swal.fire('Berhasil!', '10 data siswa dummy telah ditambahkan.', 'success');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nism.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-500">Kelola informasi seluruh siswa di sekolah.</p>
        </div>
        <div className="flex gap-3">
          {currentUser?.role === 'admin' && (
            <button 
              onClick={seedDummyData}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              <Database size={20} /> Seed Dummy
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <UserPlus size={20} /> Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96 mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari NISM atau Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">NISM</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{student.nism}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{student.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.kelas}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Siswa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Tambah Siswa Baru</h2>
                  <p className="text-blue-100 text-sm">Lengkapi data siswa di bawah ini.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">NISM</label>
                    <input
                      required
                      type="text"
                      value={newStudent.nism}
                      onChange={(e) => setNewStudent({ ...newStudent, nism: e.target.value })}
                      placeholder="Contoh: 12345678"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      required
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nama lengkap siswa"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kelas</label>
                    <select
                      required
                      value={newStudent.kelas}
                      onChange={(e) => setNewStudent({ ...newStudent, kelas: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Pilih Kelas</option>
                      {allClassOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
