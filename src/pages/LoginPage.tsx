import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      MySwal.fire({
        icon: 'error',
        title: 'Konfigurasi Diperlukan',
        text: 'Supabase tidak terkonfigurasi. Silakan hubungi administrator.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }
    
    setLoading(true);

    try {
      console.log('Memulai proses login...');
      
      // Buat promise timeout 15 detik
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Waktu login habis. Silakan periksa koneksi internet atau konfigurasi Supabase Anda.')), 15000)
      );

      // Jalankan login dengan timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const result = await Promise.race([loginPromise, timeoutPromise]) as any;
      const { data, error: signInError } = result;

      if (signInError) {
        console.error('Login error:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Akun tidak ditemukan atau kata sandi salah.');
        }
        throw signInError;
      }

      if (data?.user) {
        console.log('Login berhasil!');
        await MySwal.fire({
          icon: 'success',
          title: 'Berhasil Masuk',
          text: 'Selamat datang kembali!',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/app');
      } else {
        throw new Error('Gagal mendapatkan data pengguna.');
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Gagal Masuk',
        text: err.message || 'Terjadi kesalahan saat autentikasi.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!supabase) {
      MySwal.fire({
        icon: 'error',
        title: 'Konfigurasi Kosong',
        text: 'URL atau Key Supabase belum diisi di panel Secrets.',
      });
      return;
    }

    MySwal.fire({
      title: 'Mengetes Koneksi...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      
      MySwal.fire({
        icon: 'success',
        title: 'Koneksi Berhasil',
        text: 'Aplikasi terhubung ke database Supabase dengan baik.',
      });
    } catch (err: any) {
      console.error('Connection test failed:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: `Gagal terhubung ke database: ${err.message || 'Unknown error'}. Pastikan URL benar dan proyek tidak dalam status "Paused".`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-8 bg-gradient-to-br from-blue-700 to-blue-500 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Selamat Datang</h2>
          <p className="opacity-80">Masuk ke panel Hadirin Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'} 
              <LogIn size={20} />
            </button>
            
            <button
              type="button"
              onClick={testConnection}
              className="w-full py-2 text-blue-600 font-semibold text-sm text-center block hover:bg-blue-50 rounded-xl transition-all"
            >
              Tes Koneksi Database
            </button>

            <Link
              to="/"
              className="w-full py-3 text-slate-500 font-bold text-sm text-center block hover:bg-slate-50 rounded-xl transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
