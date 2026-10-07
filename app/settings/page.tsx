"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <User className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Profile Information
            </h2>

            <p className="text-sm text-slate-400">
              Update your personal information.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                defaultValue="Mohammad"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="email"
                defaultValue="user@nexo.local"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Shield className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Security
            </h2>

            <p className="text-sm text-slate-400">
              Manage your account security.
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Current Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your current password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 max-w-xl">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            New Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="password"
              placeholder="Enter a new password"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            <Lock className="h-4 w-4" />
            Update Password
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Bell className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Notifications
            </h2>

            <p className="text-sm text-slate-400">
              Control how you receive notifications.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                Task Notifications
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Receive notifications when a task is assigned to you.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-white"
            />
          </label>

          <div className="h-px bg-slate-800" />

          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                Message Notifications
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Receive notifications when you receive a new message.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-white"
            />
          </label>
        </div>
      </section>
    </div>
  );
}