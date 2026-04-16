import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { Users, UserCheck, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser, students, attendance } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'hadir').length;
  
  const stats = [
    { label: 'Total Siswa', value: students.length, icon: <Users className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Hadir Hari Ini', value: presentToday, icon: <UserCheck className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Total Absensi', value: attendance.length, icon: <Calendar className="text-purple-600" />, color: 'bg-purple-50' },
    { label: 'Persentase', value: students.length > 0 ? `${Math.round((presentToday / students.length) * 100)}%` : '0%', icon: <TrendingUp className="text-orange-600" />, color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Halo, {currentUser?.name}! 👋</h1>
        <p className="text-slate-500">Selamat datang di dashboard Hadirin. Berikut ringkasan hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Aktivitas Terbaru</h2>
            <Link to="/app/rekap" className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {attendance.length > 0 ? (
              [...attendance].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      record.role === 'guru' ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {record.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{record.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{record.role} • {record.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] text-slate-400">{record.date}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p>Belum ada aktivitas absensi hari ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
          <h2 className="text-xl font-bold mb-4">Informasi Sekolah</h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Pastikan semua guru dan siswa melakukan absensi sebelum pukul 08:00 WIB untuk pencatatan yang akurat.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <Clock size={20} className="text-sky-300" />
              <div>
                <p className="text-xs text-blue-200">Jam Masuk</p>
                <p className="font-bold">07:00 WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
              <Calendar size={20} className="text-sky-300" />
              <div>
                <p className="text-xs text-blue-200">Hari Kerja</p>
                <p className="font-bold">Senin - Jumat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
