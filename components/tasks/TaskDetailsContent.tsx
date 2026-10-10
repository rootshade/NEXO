"use client";

import { useState } from "react";

import {
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    Mic,
    Trash2,
    User,
    X,
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

    const [isDeleteModalOpen, setIsDeleteModalOpen] =
        useState(false);

    function handleDelete() {
        setIsDeleteModalOpen(false);

        console.log("Delete task:", taskId);
    }

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
                                <User
                                    size={18}
                                    className="text-slate-400"
                                />
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
                        />

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsDeleteModalOpen(true)
                            }
                            className="
                                mt-3
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-red-500/20
                                bg-red-500/10
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                text-red-400
                                transition
                                hover:bg-red-500/20
                                hover:text-red-300
                            "
                        >
                            <Trash2 size={16} />
                            Delete Task
                        </button>
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        px-4
                        backdrop-blur-sm
                    "
                    onClick={() =>
                        setIsDeleteModalOpen(false)
                    }
                >
                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-6
                            shadow-2xl
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        size-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-red-500/10
                                        text-red-400
                                    "
                                >
                                    <Trash2 size={20} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Delete Task
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Task #{taskId}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsDeleteModalOpen(false)
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    text-slate-500
                                    transition
                                    hover:bg-slate-800
                                    hover:text-white
                                "
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="mt-6">
                            <p className="text-sm leading-6 text-slate-400">
                                Are you sure you want to delete this task?
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setIsDeleteModalOpen(false)
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-800
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-slate-300
                                    transition
                                    hover:bg-slate-700
                                    hover:text-white
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="
                                    rounded-xl
                                    bg-red-500
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-red-600
                                "
                            >
                                Delete Task
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}