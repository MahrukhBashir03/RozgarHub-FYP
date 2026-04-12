'use client';

import React from 'react';

const ProfileProgressTracker = ({ profile, userRole }) => {
  if (!profile || !profile.profileProgress) {
    return <div className="text-center text-gray-500">Loading profile...</div>;
  }

  const { profileProgress, points = 0, jobsPosted = 0 } = profile;
  const percentage = Math.round(profileProgress.profilePercentage) || 0;

  // Define checklist items based on role
  const getChecklistItems = () => {
    const items = [
      {
        label: 'Profile Photo',
        completed: profileProgress.profilePhoto,
        icon: '🖼️',
      },
      {
        label: 'Documents',
        completed: profileProgress.documents,
        icon: '📄',
      },
      {
        label: 'Category/Specialty',
        completed: profileProgress.category,
        icon: '🏷️',
      },
    ];

    // Add driver-specific requirement
    if (userRole === 'worker') {
      items.push({
        label: 'Driving License (if driver)',
        completed: profileProgress.drivingLicense,
        icon: '🚗',
        optional: !profile.category || profile.category.toLowerCase() !== 'driver',
      });

      // Add first post requirement
      items.push({
        label: 'First Job Application',
        completed: profileProgress.firstPost,
        icon: '💼',
      });
    } else if (userRole === 'employer') {
      // Employer needs these
      items.push({
        label: 'First Job Post',
        completed: profileProgress.firstPost,
        icon: '📝',
        link: '/dashboard/employer',
        linkText: 'Post a Job',
      });
    }

    return items;
  };

  const items = getChecklistItems();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-md border border-blue-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Progress</h2>
        <p className="text-gray-600">Complete your profile to earn points and access all features</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-lg font-bold text-blue-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Points Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <p className="text-gray-600 text-sm">Total Points</p>
          <p className="text-2xl font-bold text-blue-600">{points}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <p className="text-gray-600 text-sm">Jobs Posted</p>
          <p className="text-2xl font-bold text-green-600">{jobsPosted}</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Completion Checklist</h3>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-2 border-b border-gray-100 last:border-b-0">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    disabled
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {item.label}
                  </label>
                  {item.optional && (
                    <span className="text-xs text-gray-500">(Optional)</span>
                  )}
                </div>
              </div>
              {!item.completed && item.link && (
                <a
                  href={item.link}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                >
                  {item.linkText}
                </a>
              )}
              {item.completed && (
                <span className="text-sm text-green-600 font-semibold">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {percentage === 100 ? (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold text-center">
          🎉 Profile Complete! You've unlocked all features.
        </div>
      ) : (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm text-center">
          Complete {100 - percentage}% more to unlock all features
        </div>
      )}
    </div>
  );
};

export default ProfileProgressTracker;
