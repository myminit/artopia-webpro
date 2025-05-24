'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string; // เพิ่มถ้าต้องการ
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;  // เพิ่ม logout ใน context type
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {}, // default noop
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch {
        setUser(null); // ยังไม่ login
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ฟังก์ชัน logout
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');  // เรียก API ลบ cookie ที่ server
      setUser(null);                        // เคลียร์ user state กลับเป็น null
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
