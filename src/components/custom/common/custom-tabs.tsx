'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface CustomTabsProps {
    defaultValue: string;
    children: ReactNode;
    className?: string;
    onValueChange?: (value: string) => void;
}

export function CustomTabs({ defaultValue, children, className, onValueChange }: CustomTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        onValueChange?.(value);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={cn('w-full cursor-pointer', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

interface CustomTabsListProps {
    children: ReactNode;
    className?: string;
}

export function CustomTabsList({ children, className }: CustomTabsListProps) {
    return (
        <div
            className={cn(
                'flex items-center border-b border-gray-200 dark:border-gray-700',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

interface CustomTabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function CustomTabsTrigger({ value, children, className }: CustomTabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('CustomTabsTrigger must be used within CustomTabs');
    }

    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(value)}
            className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                className
            )}
        >
            {children}
            {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
        </button>
    );
}

interface CustomTabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function CustomTabsContent({ value, children, className }: CustomTabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('CustomTabsContent must be used within CustomTabs');
    }

    const { activeTab } = context;

    if (activeTab !== value) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            className={cn('mt-6 focus:outline-none', className)}
        >
            {children}
        </div>
    );
}
