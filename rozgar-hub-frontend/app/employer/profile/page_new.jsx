'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileProgressTracker from '@/components/ProfileProgressTracker';
import axios from 'axios';

export default function EmployerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          setError('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                  {profile.companyName?.charAt(0).toUpperCase() || profile.name?.charAt(0).toUpperCase() || '🏢'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.companyName || profile.name}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500">{profile.phone || 'No phone'}</p>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            {profile.companyType && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm mb-1">Company Type</p>
                <p className="text-2xl font-bold text-blue-600">{profile.companyType}</p>
              </div>
            )}

            {/* Company Size Card */}
            {profile.companySize && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm mb-1">Company Size</p>
                <p className="text-2xl font-bold text-orange-600">{profile.companySize}</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Progress Tracker - Modified for Employer */}
        {profile && (
          <div className="mb-8">
            <ProfileProgressTracker profile={profile} userRole="employer" />
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <a
            href="/dashboard/employer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-purple-500"
          >
            <p className="text-2xl">📋</p>
            <h3 className="font-bold text-gray-900 mt-2">My Requests</h3>
            <p className="text-sm text-gray-600">View your job postings</p>
          </a>

          <a
            href="/dashboard/employer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-green-500"
          >
            <p className="text-2xl">➕</p>
            <h3 className="font-bold text-gray-900 mt-2">Post a Job</h3>
            <p className="text-sm text-gray-600">Create new job posting</p>
          </a>

          <a
            href="/chat"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-t-4 border-blue-500"
          >
            <p className="text-2xl">💬</p>
            <h3 className="font-bold text-gray-900 mt-2">Messages</h3>
            <p className="text-sm text-gray-600">Chat with workers</p>
          </a>
        </div>
      </div>
    </div>
  );
}
