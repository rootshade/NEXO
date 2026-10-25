"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Save,
  User,
  X,
} from "lucide-react";
import {
  isDeveloperProfile,
  isSettings,
  readValidatedJSON,
  writeValidatedJSON,
} from "@/data/settingsStorage.cjs";

type DeveloperProfile = {
  fullName: string;
  githubUsername: string;
  githubUrl: string;
};

const defaultDeveloperProfile: DeveloperProfile = {
  fullName: "",
  githubUsername: "",
  githubUrl: "",
};

type Settings = {
  fullName: string;
  email: string;
  language: string;
  notifications: boolean;
};

const defaultSettings: Settings = {
  fullName: "Mohammad",
  email: "mohammad@nexo.local",
  language: "English",
  notifications: true,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [saved, setSaved] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [developerProfile, setDeveloperProfile] =
    useState<DeveloperProfile>(defaultDeveloperProfile);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storage = window.localStorage;
        const settingsResult = readValidatedJSON(storage, "nexo-settings", isSettings);
        const profileResult = readValidatedJSON(
          storage,
          "nexo-developer-profile",
          isDeveloperProfile
        );

        if (settingsResult.ok && settingsResult.found) {
          setSettings(settingsResult.value as Settings);
        }
        if (profileResult.ok && profileResult.found) {
          setDeveloperProfile(profileResult.value as DeveloperProfile);
        }

        if (settingsResult.ok && profileResult.ok) {
          setStorageReady(true);
          setStorageError("");
        } else {
          setStorageReady(false);
          setStorageError(
            "Saved settings could not be read safely. Existing browser data was left unchanged; saving is paused to prevent data loss."
          );
        }
      } catch {
        setStorageReady(false);
        setStorageError(
          "Browser storage is unavailable. Settings cannot be loaded or saved right now."
        );
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleChange(
    field: keyof Settings,
    value: string | boolean
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function handleSave() {
    if (!storageReady) {
      setStorageError(
        "Saving is paused because existing settings could not be read safely."
      );
      setSaved(false);
      return;
    }

    try {
      const storage = window.localStorage;
      const settingsResult = writeValidatedJSON(
        storage,
        "nexo-settings",
        settings,
        isSettings
      );
      if (!settingsResult.ok) {
        setStorageError(
          "Settings could not be saved. Check browser storage availability and try again."
        );
        setSaved(false);
        return;
      }

      const profileResult = writeValidatedJSON(
        storage,
        "nexo-developer-profile",
        developerProfile,
        isDeveloperProfile
      );
      if (!profileResult.ok) {
        setStorageError(
          "Your basic settings were saved, but the developer profile could not be saved. Please try again."
        );
        setSaved(false);
        return;
      }

      setStorageError("");
      window.dispatchEvent(new Event("nexo-settings-updated"));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setStorageError(
        "Browser storage is unavailable. Your changes may not have been saved."
      );
      setSaved(false);
    }
  }

  function openPasswordModal() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
    setShowPasswordModal(true);
  }

  function closePasswordModal() {
    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordSuccess(false);
  }

  function handlePasswordChange() {
    setPasswordError("");
    setPasswordSuccess(false);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    /*
     * NEXO has no authenticated backend yet, so it cannot verify the
     * current password or safely persist a password change. Never claim
     * success or store credentials in localStorage.
     */
    setPasswordError(
      "Password changes are unavailable until backend authentication is connected. No password was changed."
    );
  }

  return (
    <div className="space-y-6">
      {/* Page hero */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 shadow-xl shadow-indigo-950/20 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">NEXO WORKSPACE</div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Manage your account and application preferences.
        </p>
        </div>
      </div>

      {/* Profile */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/10 p-2.5">
              <User
                size={19}
                className="text-indigo-300"
              />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Profile
              </h2>

              <p className="text-sm text-slate-500">
                Manage your personal information.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 px-5 py-6 md:grid-cols-2 sm:px-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={settings.fullName}
              onChange={(event) =>
                handleChange(
                  "fullName",
                  event.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border border-slate-700/80
                bg-slate-950
                px-4 py-3
                text-sm text-white
                outline-none
                transition
                focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
              "
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={settings.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border border-slate-700/80
                bg-slate-950
                px-4 py-3
                text-sm text-white
                outline-none
                transition
                focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
              "
            />
          </div>
        </div>
      </section>

      {/* Developer Profile */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/10 p-2.5">
              <Code2 size={19} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Developer Profile</h2>
              <p className="text-sm text-slate-500">Your personal developer details are shown only in Settings.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 px-5 py-6 md:grid-cols-2 sm:px-6">
          <div>
            <label htmlFor="developerFullName" className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
            <input
              id="developerFullName"
              type="text"
              autoComplete="name"
              value={developerProfile.fullName}
              onChange={(event) => {
                setDeveloperProfile((current) => ({ ...current, fullName: event.target.value }));
                setSaved(false);
              }}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>
          <div>
            <label htmlFor="githubUsername" className="mb-2 block text-sm font-medium text-slate-300">GitHub Username</label>
            <input
              id="githubUsername"
              type="text"
              autoComplete="off"
              value={developerProfile.githubUsername}
              onChange={(event) => {
                setDeveloperProfile((current) => ({ ...current, githubUsername: event.target.value.replace(/^@/, "") }));
                setSaved(false);
              }}
              placeholder="Your GitHub username"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="githubProfileUrl" className="mb-2 block text-sm font-medium text-slate-300">GitHub Profile Link</label>
            <div className="relative">
              <ExternalLink size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="githubProfileUrl"
                type="url"
                autoComplete="url"
                value={developerProfile.githubUrl}
                onChange={(event) => {
                  setDeveloperProfile((current) => ({ ...current, githubUrl: event.target.value }));
                  setSaved(false);
                }}
                placeholder="https://github.com/your-username"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>
            {developerProfile.githubUrl.trim() && /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/.test(developerProfile.githubUrl.trim()) && (
              <a href={developerProfile.githubUrl.trim()} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
                <Code2 size={16} /> Preview GitHub profile <ExternalLink size={14} />
              </a>
            )}
            <p className="mt-2 text-xs text-slate-500">These details are saved in this browser and are not displayed elsewhere in NEXO.</p>
          </div>
        </div>
      </section>

      {/* About NEXO */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2.5">
              <Code2 size={19} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="font-semibold text-white">About NEXO</h2>
              <p className="text-sm text-slate-500">Application information and source repository.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-white">NEXO Workspace</p>
            <p className="mt-1 text-sm text-slate-400">Frontend development build</p>
            <p className="mt-2 text-xs text-slate-500">Version: Development</p>
          </div>
          <a href="https://github.com/rootshade/NEXO" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/40 hover:bg-slate-800 hover:text-white">
            <Code2 size={17} /> NEXO Repository <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* Preferences */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/10 p-2.5">
              <Bell
                size={19}
                className="text-indigo-300"
              />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Customize your NEXO experience.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-6">
          {/* Language */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Language
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Select the application language.
              </p>
            </div>

            <select
              value={settings.language}
              onChange={(event) =>
                handleChange(
                  "language",
                  event.target.value
                )
              }
              className="
                rounded-xl
                border border-slate-700/80
                bg-slate-950
                px-4 py-2.5
                text-sm text-white
                outline-none
                focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
              "
            >
              <option>English</option>
              <option>Persian</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-5">
            <div className="flex items-center gap-3">
              <Bell
                size={18}
                className="text-slate-500"
              />

              <div>
                <p className="text-sm font-medium text-white">
                  Notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Receive notifications about new activity.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleChange(
                  "notifications",
                  !settings.notifications
                )
              }
              className={`
                relative
                h-6 w-11
                shrink-0
                rounded-full
                transition-colors
                ${
                  settings.notifications
                    ? "bg-cyan-300"
                    : "bg-slate-700"
                }
              `}
              aria-label="Toggle notifications"
            >
              <span
                className={`
                  absolute
                  left-1
                  top-1
                  h-4 w-4
                  rounded-full
                  transition-transform
                  ${
                    settings.notifications
                      ? "translate-x-5 bg-slate-900"
                      : "translate-x-0 bg-slate-400"
                  }
                `}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/10 p-2.5">
              <Lock
                size={19}
                className="text-indigo-300"
              />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Security
              </h2>

              <p className="text-sm text-slate-500">
                Manage your account security.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Password
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Change your account password.
              </p>
            </div>

            <button
              type="button"
              onClick={openPasswordModal}
              className="
                rounded-xl
                border border-slate-700
                px-4 py-2.5
                text-sm
                font-medium
                text-slate-300
                transition
                hover:bg-slate-800
                hover:text-white
              "
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Save */}
      {storageError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {storageError}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Check size={17} />
            Settings saved successfully.
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!storageReady}
          className="disabled:cursor-not-allowed disabled:opacity-50 
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-cyan-300
            px-5 py-2.5
            text-sm
            font-semibold
            text-slate-950
            transition
            hover:bg-cyan-200
          "
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div
            className="
              w-full max-w-md
              rounded-2xl
              border border-slate-700/80
              bg-slate-900
              shadow-2xl
            "
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 to-slate-900 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Password updates will be enabled after backend integration.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-5 py-6 sm:px-6">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Current Password
                </label>

                <div className="relative">
                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border border-slate-700/80
                      bg-slate-950
                      px-4 py-3 pr-11
                      text-sm text-white
                      outline-none
                      focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                      hover:text-white
                    "
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border border-slate-700/80
                      bg-slate-950
                      px-4 py-3 pr-11
                      text-sm text-white
                      outline-none
                      focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                      hover:text-white
                    "
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Minimum 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border border-slate-700/80
                      bg-slate-950
                      px-4 py-3 pr-11
                      text-sm text-white
                      outline-none
                      focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                      hover:text-white
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {passwordError}
                  </p>
                </div>
              )}

              {/* Success */}
              {passwordSuccess && (
                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Check
                      size={17}
                      className="text-emerald-400"
                    />

                    <p className="text-sm text-emerald-400">
                      Demo validation complete. Your password has not been changed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-700/80 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePasswordModal}
                className="
                  rounded-xl
                  border border-slate-700
                  px-4 py-2.5
                  text-sm
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={passwordSuccess}
                className="
                  rounded-xl
                  bg-cyan-300
                  px-4 py-2.5
                  text-sm
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-cyan-200
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
