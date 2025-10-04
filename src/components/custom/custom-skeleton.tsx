import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface CustomSkeletonProps {
  rowCount?: number; // Optional: Number of skeleton rows (default: 5)
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({ rowCount = 5 }) => {
  return (
    <div 
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg p-6" // Enhanced card with gradient border feel
      role="status"
      aria-live="polite"
    >
      {/* Enhanced Header: More realistic title and action button */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/30">
        <div className="flex items-center space-x-3">
          <Skeleton 
            className="h-8 w-64 rounded-full shimmer" // Longer, pill-shaped for title
          />
          <Skeleton className="h-4 w-20 rounded shimmer" /> {/* Subtitle/sub-header */}
        </div>
        <Skeleton className="h-10 w-28 rounded-lg shimmer" /> {/* Action button */}
      </div>

      {/* Enhanced Table: Overflow with subtle scroll shadow */}
      <div className="overflow-x-auto rounded-lg border border-border/20">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border/30">
              {/* Header cells with varied widths and bolder feel */}
              <th className="p-3 text-left font-semibold">
                <Skeleton className="h-5 w-20 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
              <th className="p-3 text-left font-semibold">
                <Skeleton className="h-5 w-24 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
              <th className="p-3 text-left font-semibold">
                <Skeleton className="h-5 w-28 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
              <th className="p-3 text-left font-semibold">
                <Skeleton className="h-5 w-32 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
              <th className="p-3 text-center font-semibold">
                <Skeleton className="h-5 w-20 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
              <th className="p-3 text-right font-semibold">
                <Skeleton className="h-5 w-16 rounded-sm shimmer bg-muted-foreground/60" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <tr 
                key={i} 
                className="border-t border-border/10 hover:bg-muted/20 transition-colors duration-200" // Subtle hover for polish
              >
                {/* Varied cell content to mimic real data */}
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full shimmer" /> {/* Avatar-like */}
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40 rounded shimmer" /> {/* Name */}
                      <Skeleton className="h-3 w-24 rounded-full shimmer opacity-70" /> {/* Subtitle */}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-32 rounded shimmer" /> {/* Email/Specialty */}
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-28 rounded shimmer" /> {/* Phone */}
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20 rounded-full shimmer" /> {/* Short text */}
                    <Skeleton className="h-3 w-24 rounded-full shimmer opacity-80" /> {/* Longer text */}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <Skeleton className="h-4 w-12 mx-auto rounded-full shimmer" /> {/* Status badge */}
                </td>
                <td className="p-3 text-right">
                  <Skeleton className="h-8 w-16 rounded-lg shimmer" /> {/* Action button/icon */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: Subtle footer loading indicator */}
      {rowCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center">
          <Skeleton className="h-3 w-48 rounded-full shimmer opacity-60" />
        </div>
      )}
    </div>
  );
};

export default CustomSkeleton;