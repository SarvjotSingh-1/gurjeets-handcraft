import React from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Scissors,
  Package,
  Truck,
  Home,
  AlertOctagon,
  Check,
} from 'lucide-react';

export const TIMELINE_STAGES = [
  {
    key: 'Order Placed',
    label: 'Order Placed',
    shortLabel: 'Placed',
    description: 'Order received & logged in queue',
    icon: ShoppingBag,
  },
  {
    key: 'Payment Confirmed',
    label: 'Payment Confirmed',
    shortLabel: 'Payment',
    description: 'Artisan confirmed & payment finalized',
    icon: CheckCircle2,
  },
  {
    key: 'Processing',
    label: 'Processing',
    shortLabel: 'Processing',
    description: 'Pure Himalayan wool selected & prepared',
    icon: Sparkles,
  },
  {
    key: 'Handmade',
    label: 'Handmade',
    shortLabel: 'Handmade',
    description: 'Stitch-by-stitch handcrafted by Gurjeet',
    icon: Scissors,
  },
  {
    key: 'Packed',
    label: 'Packed',
    shortLabel: 'Packed',
    description: 'Carefully wrapped with woolen care guide',
    icon: Package,
  },
  {
    key: 'Shipped',
    label: 'Shipped',
    shortLabel: 'Shipped',
    description: 'Dispatched with postal courier tracking',
    icon: Truck,
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    shortLabel: 'Delivered',
    description: 'Delivered safely to keep you cozy',
    icon: Home,
  },
];

// Helper to normalize status including backward-compatible aliases
const normalizeStatus = (status) => {
  if (status === 'Inquiry') return 'Order Placed';
  if (status === 'Confirmed') return 'Payment Confirmed';
  return status;
};

export const VisualTimeline = ({ currentStatus = 'Order Placed', compact = false }) => {
  const isCancelled = currentStatus === 'Cancelled';
  const normalized = normalizeStatus(currentStatus);

  const currentStepIndex = TIMELINE_STAGES.findIndex((s) => s.key === normalized);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;
  const progressPercent = Math.min(100, Math.max(0, (activeIndex / (TIMELINE_STAGES.length - 1)) * 100));

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
        <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-serif font-bold text-sm text-rose-900">
            Order Request Cancelled
          </p>
          <p className="text-xs text-rose-700 leading-relaxed">
            This order has been marked as cancelled. If you wish to re-inquire or place a bespoke custom piece, please get in touch with Gurjeet directly via WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Desktop & Tablet Horizontal Timeline (md and up) */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background Connecting Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-artisan-heather/80 rounded-full z-0" />

          {/* Active Progress Fill Line */}
          <div
            className="absolute top-5 left-8 h-1 bg-artisan-terracotta rounded-full transition-all duration-500 ease-out z-0"
            style={{ width: `calc((100% - 4rem) * ${activeIndex / (TIMELINE_STAGES.length - 1)})` }}
          />

          {/* Steps Track */}
          <div className="relative z-10 flex justify-between items-start">
            {TIMELINE_STAGES.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isUpcoming = idx > activeIndex;
              const IconComponent = stage.icon;

              return (
                <div
                  key={stage.key}
                  className="flex flex-col items-center text-center w-24 group"
                >
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-artisan-sage text-white shadow-subtle'
                        : isCurrent
                        ? 'bg-artisan-terracotta text-white ring-4 ring-artisan-terracotta/20 shadow-md scale-110'
                        : 'bg-artisan-ivory text-artisan-taupe border border-artisan-heather'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <IconComponent className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-2.5 space-y-0.5">
                    <span
                      className={`block text-[11px] font-bold leading-tight ${
                        isCurrent
                          ? 'text-artisan-terracotta font-extrabold'
                          : isCompleted
                          ? 'text-artisan-earthBrown'
                          : 'text-artisan-taupe/70'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {!compact && (
                      <span className="block text-[9px] text-artisan-taupe/80 leading-tight">
                        {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : `Step ${idx + 1}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Mobile Stepper (sm & down): Clean Vertical Progression */}
      <div className="block md:hidden space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-artisan-heather/60 text-xs">
          <span className="font-semibold text-artisan-earthBrown">Craft Progress</span>
          <span className="font-bold text-artisan-terracotta">
            Stage {activeIndex + 1} of {TIMELINE_STAGES.length}: {TIMELINE_STAGES[activeIndex].label}
          </span>
        </div>

        {/* Vertical Stepper List */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-artisan-heather/80">
          {TIMELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;
            const IconComponent = stage.icon;

            return (
              <div key={stage.key} className="relative flex items-start gap-3 group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition ${
                    isCompleted
                      ? 'bg-artisan-sage text-white'
                      : isCurrent
                      ? 'bg-artisan-terracotta text-white ring-2 ring-artisan-terracotta/20 scale-110'
                      : 'bg-artisan-ivory text-artisan-taupe/60 border border-artisan-heather'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <IconComponent className="w-3 h-3" />
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-artisan-terracotta font-extrabold'
                          : isCompleted
                          ? 'text-artisan-earthBrown'
                          : 'text-artisan-taupe/60'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-artisan-terracotta/10 text-artisan-terracotta uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-artisan-taupe leading-tight">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisualTimeline;
