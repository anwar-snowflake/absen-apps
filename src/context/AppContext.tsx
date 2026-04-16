import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export type Role = 'admin' | 'guru';
export type Major = 'Akuntansi' | 'Bisnis Ritel' | 'DKV' | 'Perkantoran' | 'RPL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  major?: Major;
}

export interface Student {
  id: string;
  nism: string;
  name: string;
  kelas: string;
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  studentId?: string;
  name: string;
  role: 'guru' | 'siswa';
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  timestamp: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  attendance: AttendanceRecord[];
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'timestamp'>) => Promise<void>;
  updateAttendance: (id: string, status: AttendanceRecord['status']) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  isLoading: boolean;
  isConfigured: boolean;
  refreshData: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = !!supabase;

  // Initial session check
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      console.log('Fetching profile for:', userId);
      
      // Timeout 20 detik untuk fetch profile (lebih lama untuk antisipasi cold start Supabase)
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Waktu pengambilan profil habis. Pastikan proyek Supabase Anda tidak dalam status "Paused" (Tertidur) dan koneksi internet stabil.')), 20000)
      );

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new one...');
        // Profile doesn't exist, create it
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const role: Role = (count === 0) ? 'admin' : 'guru';
        
        const newProfile = {
          id: userId,
          email,
          name: email.split('@')[0],
          role,
          major: null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (!createError) {
          setCurrentUser(createdProfile as User);
          await fetchData();
        } else {
          console.error('Error creating profile:', createError);
        }
      } else if (profile) {
        setCurrentUser(profile as User);
        await fetchData();
      } else if (error) {
        console.error('Supabase error fetching profile:', error);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message || err);
      // Jika timeout, beri tahu user via alert dengan opsi retry
      if (err.message?.includes('Waktu pengambilan profil habis')) {
        Swal.fire({
          icon: 'warning',
          title: 'Koneksi Lambat',
          text: err.message,
          showCancelButton: true,
          confirmButtonText: 'Coba Lagi',
          cancelButtonText: 'Tutup',
          confirmButtonColor: '#2563eb',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    if (!supabase) return;
    try {
      console.log('Fetching app data...');
      
      // Timeout 10 detik untuk fetch data
      const dataPromise = Promise.all([
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*')
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Waktu pengambilan data habis.')), 10000)
      );

      const results = await Promise.race([dataPromise, timeoutPromise]) as any;
      const [studentsRes, attendanceRes] = results;

      if (studentsRes.data) setStudents(studentsRes.data);
      if (attendanceRes.data) setAttendance(attendanceRes.data);
      
      console.log('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const logout = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan keluar dari aplikasi!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      Swal.fire({
        title: 'Berhasil Keluar!',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      });
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (!error && data) {
      setStudents([...students, data]);
    }
  };

  const addAttendance = async (record: Omit<AttendanceRecord, 'id' | 'timestamp'>) => {
    if (!supabase) return;
    const newRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('attendance')
      .insert([newRecord])
      .select()
      .single();

    if (!error && data) {
      setAttendance([...attendance, data]);
    }
  };

  const updateAttendance = async (id: string, status: AttendanceRecord['status']) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('attendance')
      .update({ status, timestamp: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setAttendance(attendance.map(a => a.id === id ? { ...a, status, timestamp: new Date().toISOString() } : a));
    }
  };

  const deleteAttendance = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (!error) {
      setAttendance(attendance.filter(a => a.id !== id));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabase || !currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);

    if (!error) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      logout, 
      students, 
      addStudent, 
      attendance, 
      addAttendance,
      updateAttendance,
      deleteAttendance,
      isLoading,
      isConfigured,
      refreshData: fetchData,
      updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
