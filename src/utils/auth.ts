import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ee76f8f9`;

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'manager' | 'delivery_partner';
}

export const authService = {
  async signup(email: string, password: string, name: string, role: string = 'consumer') {
    try {
      const response = await fetch(`${serverUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Signup failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  async getProfile(accessToken: string): Promise<User | null> {
    try {
      const response = await fetch(`${serverUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) return null;
      
      return data.profile;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },
};

export const apiService = {
  async request(endpoint: string, options: RequestInit = {}) {
    const session = await authService.getSession();
    const token = session?.access_token || publicAnonKey;
    
    const response = await fetch(`${serverUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  },
};