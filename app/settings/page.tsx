"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  Lock,
  Save,
  User,
  X,
} from "lucide-react";

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
      const savedSettings =
        localStorage.getItem("nexo-settings");

      if (!savedSettings) {
        return;
      }

      try {
        const parsed: unknown = JSON.parse(savedSettings);

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "fullName" in parsed &&
          "email" in parsed &&
          "language" in parsed &&
          "notifications" in parsed &&
          typeof parsed.fullName === "string" &&
          typeof parsed.email === "string" &&
          typeof parsed.language === "string" &&
          typeof parsed.notifications === "boolean"
        ) {
          setSettings({
            fullName: parsed.fullName,
            email: parsed.email,
            language: parsed.language,
            notifications: parsed.notifications,
          });
        } else {
          localStorage.removeItem("nexo-settings");
        }
      } catch {
        localStorage.removeItem("nexo-settings");
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
    localStorage.setItem(
      "nexo-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
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
     * Password changes must be handled by the backend.
     * Never store passwords in localStorage.
     */
    setPasswordSuccess(true);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      closePasswordModal();
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
        <div className="border-b border-slate-700/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-800 p-2.5">
              <User
                size={19}
                className="text-slate-300"
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

        <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
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

      {/* Preferences */}
      <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
        <div className="border-b border-slate-700/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-800 p-2.5">
              <Bell
                size={19}
                className="text-slate-300"
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

        <div className="space-y-5 px-6 py-6">
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
          <div className="flex items-center justify-between gap-4 border-t border-slate-700/80 pt-5">
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
                    ? "bg-white"
                    : "bg-slate-700"
                }
              `}
              aria-label="Toggle notifications"
            >
              <span
                className={`
                  absolute
                  top-1
                  h-4 w-4
                  rounded-full
                  transition-transform
                  ${
                    settings.notifications
                      ? "translate-x-6 bg-slate-900"
                      : "translate-x-1 bg-slate-400"
                  }
                `}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
        <div className="border-b border-slate-700/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-800 p-2.5">
              <Lock
                size={19}
                className="text-slate-300"
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

        <div className="px-6 py-6">
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
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
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
            <div className="flex items-center justify-between border-b border-slate-700/80 px-6 py-5">
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
            <div className="space-y-5 px-6 py-6">
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
                  bg-white
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
