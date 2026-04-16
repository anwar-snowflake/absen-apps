import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
// ...
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <CheckCircle size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              Hadirin
            </span>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 inline-block">
              Solusi Absensi Sekolah Modern
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Kelola Kehadiran dengan <br />
              <span className="text-blue-600">Lebih Cerdas & Cepat</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Hadirin adalah platform absensi digital yang dirancang khusus untuk sekolah. 
              Meningkatkan efisiensi administrasi guru dan memberikan data kehadiran siswa yang akurat secara real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
              >
                Mulai Sekarang <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all">
                Pelajari Fitur
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="text-blue-600" size={32} />}
              title="Manajemen Siswa"
              description="Kelola data siswa per kelas dengan mudah. Tambah, edit, dan pantau status kehadiran mereka setiap hari."
            />
            <FeatureCard 
              icon={<Clock className="text-blue-600" size={32} />}
              title="Absensi Real-time"
              description="Proses absensi yang cepat untuk guru dan siswa. Data langsung tersimpan dan dapat diakses kapan saja."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-blue-600" size={32} />}
              title="Rekapitulasi Akurat"
              description="Laporan kehadiran otomatis yang detail. Memudahkan evaluasi kedisiplinan siswa dan kinerja guru."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <p>© 2026 Hadirin Digital Attendance. Dibuat untuk masa depan pendidikan.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
