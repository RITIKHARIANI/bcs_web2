'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  Target,
  Calendar,
  Building2,
  GraduationCap,
  Mail,
  Edit
} from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  created_at: Date
}

interface ProfileViewProps {
  user: {
    id: string
    name: string
    email: string
    about: string | null
    speciality: string | null
    interested_fields: string[]
    university: string | null
    avatar_url: string | null
    role: string
    created_at: Date
    courses: Course[]
  }
  moduleCount: number
  isOwnProfile: boolean
}

export function ProfileView({ user, moduleCount, isOwnProfile }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview')

  const stats = [
    {
      icon: BookOpen,
      label: 'Courses Created',
      value: user.courses.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: FileText,
      label: 'Modules Created',
      value: moduleCount,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Target,
      label: 'Research Interests',
      value: user.interested_fields.length,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: new Date(user.created_at).getFullYear(),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 h-64">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="absolute top-6 right-6">
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors shadow-lg font-medium"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-12">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Avatar and Basic Info */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    width={160}
                    height={160}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white text-5xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Metadata */}
              <div className="flex-1 text-center sm:text-left mt-4 sm:mt-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-sm font-medium mb-3">
                  <GraduationCap className="h-4 w-4" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>

                {/* University and Speciality */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-gray-600 text-sm">
                  {user.university && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{user.university}</span>
                    </div>
                  )}
                  {user.speciality && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{user.speciality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className={`${stat.bgColor} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'courses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Courses ({user.courses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* About Section */}
                {user.about && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {user.about}
                    </p>
                  </div>
                )}

                {/* Research Interests */}
                {user.interested_fields.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Research Interests
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {user.interested_fields.map((field) => (
                        <span
                          key={field}
                          className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800 rounded-lg text-sm font-medium border border-purple-200 hover:border-purple-300 transition-colors"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!user.about && user.interested_fields.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No additional information available.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                {user.courses.length > 0 ? (
                  <div className="grid gap-4">
                    {user.courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group block border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {course.title}
                            </h3>
                            {course.description && (
                              <p className="text-gray-600 line-clamp-2 mb-3">
                                {course.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No published courses yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
