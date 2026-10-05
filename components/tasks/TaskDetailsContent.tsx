"use client";

import { useState } from "react";

import {
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    Mic,
    User,
} from "lucide-react";

import TaskActions from "./TaskActions";

type TaskStatus =
    | "Pending"
    | "In Progress"
    | "Completed";

type TaskDetailsContentProps = {
    taskId: string;
};

export default function TaskDetailsContent({
    taskId,
}: TaskDetailsContentProps) {
    const [status, setStatus] =
        useState<TaskStatus>("In Progress");

    return (
        <>
            {/* Task Header */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="mb-2 text-sm text-slate-500">
                            Task #{taskId}
                        </p>

                        <h1 className="text-2xl font-bold text-white">
                            Design login page
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Create and finalize the login page design for the NEXO platform.
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        {status}
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Task Description
                        </h2>

                        <p className="text-sm leading-7 text-slate-400">
                            Design a clean and modern login page for the NEXO platform.
                            The design should be responsive, simple, and consistent with
                            the overall dark interface of the application.
                        </p>
                    </section>

                    {/* Attachments */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Attachments
                        </h2>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                                <ImageIcon
                                    size={20}
                                    className="text-slate-400"
                                />

                                <span className="text-sm text-slate-300">
                                    Login UI
                                </span>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                                <Mic
                                    size={20}
                                    className="text-slate-400"
                                />

                                <span className="text-sm text-slate-300">
                                    Voice Note
                                </span>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                                <CheckCircle2
                                    size={20}
                                    className="text-slate-400"
                                />

                                <span className="text-sm text-slate-300">
                                    Requirements
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <aside className="space-y-6">
                    {/* Task Status */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Task Status
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock3 size={16} />
                                    Status
                                </span>

                                <span className="text-sm text-white">
                                    {status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">
                                    Priority
                                </span>

                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                    High
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Assigned To */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Assigned To
                        </h2>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                                <User size={18} className="text-slate-400" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Mohammad
                                </p>

                                <p className="text-xs text-slate-500">
                                    Developer
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Actions
                        </h2>

                        <TaskActions
                            status={status}
                            onStatusChange={setStatus}
                        />ّ
                    </section>

                    {/* Task ID */}
                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <p className="text-xs text-slate-500">
                            Task ID
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                            #{taskId}
                        </p>
                    </section>
                </aside>
            </div>
        </>
    );
}