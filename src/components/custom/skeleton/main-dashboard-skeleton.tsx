import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const DashboardSkeleton = () => {
    return (
        <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
            {/* Sidebar Skeleton */}
            <aside className="w-64 bg-gray-800 dark:bg-gray-950 border-r border-border/50 flex flex-col p-4 space-y-6">
                {/* Logo/Title Skeleton */}
                <Skeleton className="h-8 w-32 rounded-md shimmer" />

                {/* Menu Items Skeleton */}
                <nav className="flex flex-col space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => ( // Assuming ~5 menu items like Dashboard, Doctors, etc.
                        <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-5 w-5 rounded-full shimmer" /> {/* Icon */}
                            <Skeleton className="h-4 w-32 rounded shimmer" /> {/* Label */}
                        </div>
                    ))}
                </nav>

                {/* Footer/User Skeleton */}
                <div className="mt-auto">
                    <Skeleton className="h-10 w-full rounded-md shimmer" /> {/* User profile or logout */}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                {/* Navbar Skeleton */}
                <header className="bg-background/95 backdrop-blur supports-[backdrop-blur]:bg-background/60 sticky top-0 z-40 w-full border-b shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Title/Logo */}
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded-md shimmer" /> {/* Icon/Logo */}
                            <Skeleton className="h-6 w-48 rounded shimmer" /> {/* Title: Clinic Management System */}
                        </div>

                        {/* Right: User/Notifications */}
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded-full shimmer" /> {/* Notification Bell */}
                            <Skeleton className="h-8 w-8 rounded-full shimmer" /> {/* User Avatar */}
                        </div>
                    </div>
                </header>

                {/* Main Content Skeleton (Mimicking Doctors Page Table) */}
                <div className="p-6">
                    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg p-6">
                        {/* Header: Title, Count, Buttons */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/30">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-8 w-64 rounded-full shimmer" /> {/* "Doctors" Title */}
                                <Skeleton className="h-4 w-40 rounded shimmer" /> {/* "Total Active Doctors: 8" */}
                            </div>
                            <div className="flex space-x-3">
                                <Skeleton className="h-10 w-32 rounded-lg shimmer" /> {/* "Add Doctor" Button */}
                                <Skeleton className="h-10 w-40 rounded-lg shimmer" /> {/* Tabs: "All Active Doctors" */}
                                <Skeleton className="h-10 w-40 rounded-lg shimmer" /> {/* "Removed Doctors" */}
                            </div>
                        </div>

                        {/* Table Skeleton */}
                        <div className="overflow-x-auto rounded-lg border border-border/20">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr className="border-b border-border/30">
                                        {/* Columns: Name, Specialty, Phone, Employee Code, Status, Actions */}
                                        <th className="p-3 text-left font-semibold"><Skeleton className="h-5 w-24 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                        <th className="p-3 text-left font-semibold"><Skeleton className="h-5 w-28 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                        <th className="p-3 text-left font-semibold"><Skeleton className="h-5 w-24 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                        <th className="p-3 text-left font-semibold"><Skeleton className="h-5 w-32 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                        <th className="p-3 text-center font-semibold"><Skeleton className="h-5 w-20 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                        <th className="p-3 text-right font-semibold"><Skeleton className="h-5 w-20 rounded-sm shimmer bg-muted-foreground/60" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 8 }).map((_, i) => ( // Matching ~8 rows from image
                                        <tr key={i} className="border-t border-border/10 hover:bg-muted/20 transition-colors duration-200">
                                            <td className="p-3"><Skeleton className="h-4 w-40 rounded shimmer" /></td> {/* Name */}
                                            <td className="p-3"><Skeleton className="h-4 w-32 rounded shimmer" /></td> {/* Specialty */}
                                            <td className="p-3"><Skeleton className="h-4 w-28 rounded shimmer" /></td> {/* Phone */}
                                            <td className="p-3"><Skeleton className="h-4 w-24 rounded shimmer" /></td> {/* Employee Code */}
                                            <td className="p-3 text-center"><Skeleton className="h-4 w-16 mx-auto rounded-full shimmer" /></td> {/* Status Badge */}
                                            <td className="p-3 text-right"><Skeleton className="h-6 w-20 rounded-md shimmer" /></td> {/* Actions (e.g., ... menu) */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardSkeleton