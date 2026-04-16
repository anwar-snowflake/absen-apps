import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { FileText, Download, Filter, Search, UserCheck, Users, BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function RekapAbsensi() {
  const { currentUser, attendance } = useApp();
  const [activeTab, setActiveTab] = useState<'guru' | 'siswa'>(currentUser?.role === 'admin' ? 'guru' : 'siswa');
  const [search, setSearch] = useState('');

  const filteredAttendance = attendance.filter(a => {
    const matchesTab = a.role === activeTab;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const chartData = useMemo(() => {
    const dailyData: Record<string, any> = {};
    
    // Get last 14 days
    const dates = Array.from(new Set(attendance.filter(a => a.role === activeTab).map(a => a.date))).sort() as string[];
    const lastDates = dates.slice(-14);

    lastDates.forEach(date => {
      const dayRecords = attendance.filter(a => a.date === date && a.role === activeTab);
      dailyData[date] = {
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        hadir: dayRecords.filter(r => r.status === 'hadir').length,
        izin: dayRecords.filter(r => r.status === 'izin').length,
        sakit: dayRecords.filter(r => r.status === 'sakit').length,
        alfa: dayRecords.filter(r => r.status === 'alfa').length,
      };
    });

    return Object.values(dailyData);
  }, [attendance, activeTab]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
    attendance.filter(a => a.role === activeTab).forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return [
      { name: 'Hadir', value: counts.hadir, color: '#10b981' },
      { name: 'Izin', value: counts.izin, color: '#3b82f6' },
      { name: 'Sakit', value: counts.sakit, color: '#f59e0b' },
      { name: 'Alfa', value: counts.alfa, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [attendance, activeTab]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rekap Absensi</h1>
          <p className="text-slate-500">Laporan riwayat kehadiran {activeTab === 'guru' ? 'guru' : 'siswa'}.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Download size={20} /> Ekspor PDF
        </button>
      </div>

      <div className="flex p-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-md">
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('guru')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-bold transition-all ${
              activeTab === 'guru' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck size={18} /> Absensi Guru
          </button>
        )}
        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-bold transition-all ${
            activeTab === 'siswa' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={18} /> Absensi Siswa
        </button>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <BarChartIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tren Kehadiran</h2>
              <p className="text-xs text-slate-500">Visualisasi status kehadiran 14 hari terakhir</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="hadir" fill="#10b981" radius={[4, 4, 0, 0]} name="Hadir" />
                  <Bar dataKey="izin" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Izin" />
                  <Bar dataKey="sakit" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Sakit" />
                  <Bar dataKey="alfa" fill="#ef4444" radius={[4, 4, 0, 0]} name="Alfa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BarChartIcon size={48} className="opacity-10 mb-2" />
                <p className="text-sm">Belum ada data untuk ditampilkan di grafik</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Distribusi Status</h2>
              <p className="text-xs text-slate-500">Persentase kehadiran keseluruhan</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <PieChartIcon size={48} className="opacity-10 mb-2" />
                <p className="text-sm">Belum ada data</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Cari nama ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm">
            <Filter size={18} /> Filter Tanggal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                        {record.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{record.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      record.status === 'hadir' ? 'bg-emerald-100 text-emerald-700' :
                      record.status === 'izin' ? 'bg-blue-100 text-blue-700' :
                      record.status === 'sakit' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAttendance.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Belum ada data rekapitulasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
