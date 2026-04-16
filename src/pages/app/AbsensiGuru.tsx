import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Clock, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AbsensiGuru() {
  const { currentUser, addAttendance, attendance } = useApp();
  const [status, setStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alfa'>('hadir');
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const alreadyAbsen = attendance.find(a => a.userId === currentUser?.id && a.date === today);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (alreadyAbsen) {
      Swal.fire({
        icon: 'info',
        title: 'Sudah Absen',
        text: 'Anda sudah mengisi absensi hari ini.',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Absensi',
      text: `Apakah Anda yakin ingin mengisi absensi "Hadir" untuk hari ini?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hadir!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await addAttendance({
          userId: currentUser.id,
          name: currentUser.name,
          role: 'guru',
          date: today,
          status: 'hadir',
        });
        setSubmitted(true);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Kehadiran Anda telah dicatat.',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat mencatat absensi.',
        });
      }
    }
  };

  if (alreadyAbsen || submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Absensi Berhasil!</h1>
          <p className="text-slate-500 mb-8">
            Terima kasih, {currentUser?.name}. Kehadiran Anda telah tercatat untuk hari ini ({today}).
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl inline-block text-left">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Detail Absensi</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 capitalize">{alreadyAbsen?.status || 'hadir'}</p>
                <p className="text-xs text-slate-500">{new Date(alreadyAbsen?.timestamp || new Date()).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Absensi Mandiri Guru</h1>
        <p className="text-slate-500">Klik tombol di bawah untuk mencatat kehadiran hari ini.</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8"
      >
        <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <UserCheck size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase">Status</p>
            <p className="text-sm text-blue-800">Hari ini: {today}</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-3">
          <AlertCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Cukup satu kali klik untuk mencatat kehadiran Anda. Pastikan Anda sudah berada di sekolah.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-6 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
        >
          <CheckCircle size={24} />
          Saya Hadir Sekarang
        </button>
      </motion.div>
    </div>
  );
}
