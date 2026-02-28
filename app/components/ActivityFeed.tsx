'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Activity types
type ActivityType = 'lead' | 'quote' | 'order' | 'conversion' | 'payment';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    customer?: string;
    status?: string;
  };
}

// Activity type configuration with icons and colors
const activityConfig: Record<ActivityType, { icon: string; label: string; color: string; bgColor: string }> = {
  lead: { icon: '👤', label: 'New Lead', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  quote: { icon: '📄', label: 'Quote', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  order: { icon: '🛒', label: 'Order', color: 'text-green-400', bgColor: 'bg-emerald-500/10' },
  conversion: { icon: '✅', label: 'Conversion', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  payment: { icon: '💳', label: 'Payment', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
};

// Filter options
const filterOptions: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lead', label: 'Leads' },
  { value: 'quote', label: 'Quotes' },
  { value: 'order', label: 'Orders' },
  { value: 'conversion', label: 'Conversions' },
  { value: 'payment', label: 'Payments' },
];

// Mock data generator
const generateMockActivities = (count: number, offset: number): Activity[] => {
  const types: ActivityType[] = ['lead', 'quote', 'order', 'conversion', 'payment'];
  const customers = ['TechCorp Inc.', 'GrowthLabs', 'DataDriven Co.', 'InnovateTech', 'StartupXYZ', 'Enterprise Solutions', 'Digital Dynamics', 'CloudFirst Ltd', 'DataSphere Inc', 'NexGen Systems'];
  const titles: Record<ActivityType, string[]> = {
    lead: ['New lead captured', 'Lead from contact form', 'Lead from demo request', 'Lead from webinar', 'Lead from referral'],
    quote: ['Quote requested', 'Quote generated', 'Quote updated', 'Quote sent', 'Quote revised'],
    order: ['Order placed', 'Order confirmed', 'Order processing', 'Order shipped', 'New order received'],
    conversion: ['Lead converted', 'Trial upgraded', 'Deal closed', 'Opportunity won'],
    payment: ['Payment received', 'Invoice paid', 'Subscription renewed', 'Payment processed'],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const titleOptions = titles[type];
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const hoursAgo = offset + i + Math.floor(Math.random() * 3);

    return {
      id: `act-${offset + i}-${Date.now()}`,
      type,
      title,
      description: type === 'payment' || type === 'order'
        ? `from ${customer}`
        : `Customer inquiry from ${customer}`,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000 - Math.random() * 30 * 60 * 1000),
      metadata: {
        amount: type === 'order' || type === 'payment' || type === 'quote'
          ? Math.floor(Math.random() * 10000) + 500
          : undefined,
        customer,
        status: type === 'order' ? ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)] : undefined,
      },
    };
  });
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format timestamp for tooltip
const formatFullTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

interface ActivityFeedProps {
  className?: string;
}

export default function ActivityFeed({ className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Load initial activities
  useEffect(() => {
    const initialActivities = generateMockActivities(ITEMS_PER_PAGE, 0);
    setActivities(initialActivities);
  }, []);

  // Load more activities
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const newActivities = generateMockActivities(ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
      
      // Stop after 50 items for demo
      if ((page + 1) * ITEMS_PER_PAGE >= 50) {
        setHasMore(false);
      }
      
      setActivities(prev => [...prev, ...newActivities]);
      setPage(prev => prev + 1);
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  // Filter activities
  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  // Get counts for filter badges
  const getActivityCount = (type: ActivityType | 'all'): number => {
    if (type === 'all') return activities.length;
    return activities.filter(a => a.type === type).length;
  };

  return (
    <div className={`bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Recent Activity</h2>
          <span className="text-sm text-zinc-500">{filteredActivities.length} items</span>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === option.value
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'
              }`}
            >
              {option.value !== 'all' && (
                <span>{activityConfig[option.value as ActivityType].icon}</span>
              )}
              <span>{option.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                filter === option.value ? 'bg-purple-500/20' : 'bg-zinc-700/50'
              }`}>
                {getActivityCount(option.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <span className="text-4xl mb-3 block">📭</span>
            No activities found
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const config = activityConfig[activity.type];
            return (
              <div
                key={activity.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                title={formatFullTimestamp(activity.timestamp)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <span className="text-lg">{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-zinc-100 group-hover:text-purple-300">
                          {activity.title}
                        </p>
                        <p className="text-sm text-zinc-500 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                        {activity.metadata?.amount && (
                          <p className="text-sm font-semibold text-emerald-400">
                            ${activity.metadata.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status badge for orders */}
                    {activity.metadata?.status && (
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          activity.metadata.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : activity.metadata.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {activity.metadata.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="p-4 flex justify-center">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-purple-400 rounded-full animate-spin"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          </div>
        )}

        {/* End of list */}
        {!hasMore && filteredActivities.length > 0 && (
          <div className="p-4 text-center text-zinc-600 text-sm">
            You&apos;ve reached the end
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="h-1" />
      </div>
    </div>
  );
}
