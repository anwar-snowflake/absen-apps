import { useState } from 'react';
import { useApp, Major } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Check, X, Info, ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AbsensiSiswa() {
  const { students, addAttendance, updateAttendance, deleteAttendance, attendance, currentUser, updateProfile } = useApp();
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];
  
  // Define classes based on major
  const majors: Major[] = ['Akuntansi', 'Bisnis Ritel', 'DKV', 'Perkantoran', 'RPL'];
  const grades = ['10', '11', '12'];
  const subClasses = ['1', '2'];

  const userMajor = currentUser?.major;

  const handleSetMajor = async (major: Major) => {
    try {
      await updateProfile({ major });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Jurusan Anda telah disetel ke ${major}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyetel jurusan.', 'error');
    }
  };

  if (!userMajor) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Pilih Jurusan Anda</h1>
          <p className="text-slate-500">Silakan pilih jurusan Anda untuk melihat kelas yang relevan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {majors.map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSetMajor(m)}
              className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{m}</h3>
              <p className="text-slate-500 text-sm mt-2">Klik untuk memilih</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const availableClasses = grades.flatMap(g => 
    subClasses.map(s => `${g} ${userMajor} ${s}`)
  );

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nism.includes(search);
    const matchesKelas = s.kelas === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  const handleAbsen = async (studentId: string, studentName: string, status: 'hadir' | 'izin' | 'sakit' | 'alfa') => {
    try {
      await addAttendance({
        studentId,
        name: studentName,
        role: 'siswa',
        date: today,
        status,
      });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Absensi ${studentName} (${status}) telah dicatat.`,
        timer: 1000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat mencatat absensi.',
      });
    }
  };

  const handleEdit = async (recordId: string, studentName: string) => {
    const { value: status } = await Swal.fire({
      title: `Ubah Absensi ${studentName}`,
      input: 'select',
      inputOptions: {
        hadir: 'Hadir',
        izin: 'Izin',
        sakit: 'Sakit',
        alfa: 'Alfa'
      },
      inputPlaceholder: 'Pilih status baru',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
    });

    if (status) {
      try {
        await updateAttendance(recordId, status);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Absensi telah diperbarui.',
          timer: 1000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat memperbarui absensi.',
        });
      }
    }
  };

  const handleDelete = async (recordId: string, studentName: string) => {
    const result = await Swal.fire({
      title: 'Hapus Absensi?',
      text: `Anda akan menghapus catatan absensi ${studentName}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteAttendance(recordId);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus!',
          text: 'Catatan absensi telah dihapus.',
          timer: 1000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus absensi.',
        });
      }
    }
  };

  const getStudentStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === today);
  };

  if (!selectedKelas) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pilih Kelas</h1>
          <p className="text-slate-500">Silakan pilih kelas yang sedang Anda ajar ({userMajor}).</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableClasses.map((kelas) => (
            <motion.button
              key={kelas}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedKelas(kelas)}
              className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{kelas}</h3>
              <p className="text-slate-500 text-sm">Klik untuk mengabsen kelas ini</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedKelas(null)}
            className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Absensi {selectedKelas}</h1>
            <p className="text-slate-500">Input kehadiran siswa hari ini ({today}).</p>
          </div>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">
          {today}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari NISM atau Nama Siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, i) => {
          const record = getStudentStatus(student.id);
          const status = record?.status;
          
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 rounded-[2rem] border transition-all ${
                status ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-500 font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.nism} • {student.kelas}</p>
                  </div>
                </div>
                {status && (
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                    status === 'izin' ? 'bg-blue-100 text-blue-700' :
                    status === 'sakit' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {status}
                  </div>
                )}
              </div>

              {!status ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAbsen(student.id, student.name, 'hadir')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Check size={16} /> Hadir
                  </button>
                  <button
                    onClick={() => handleAbsen(student.id, student.name, 'izin')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Info size={16} /> Izin
                  </button>
                  <button
                    onClick={() => handleAbsen(student.id, student.name, 'sakit')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-white transition-all"
                  >
                    <Info size={16} /> Sakit
                  </button>
                  <button
                    onClick={() => handleAbsen(student.id, student.name, 'alfa')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={16} /> Alfa
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-slate-400 text-sm italic">
                    Absensi tercatat
                  </div>
                  {status !== 'hadir' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(record.id, student.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id, student.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
          <Users size={64} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Siswa tidak ditemukan</h3>
          <p className="text-slate-500">Belum ada data siswa untuk kelas ini.</p>
        </div>
      )}
    </div>
  );
}
