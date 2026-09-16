import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, FileText, Heart, MessageCircle, Phone } from 'lucide-react';
import Container from '../../components/common/Container';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';

export const PolicyPage = () => {
  const location = useLocation();

  // Determine active policy based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('shipping')) return 'shipping';
    if (path.includes('returns')) return 'returns';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms')) return 'terms';
    return 'shipping';
  };

  const activeTab = getActiveTab();

  const tabMeta = {
    shipping: {
      title: "Shipping & Delivery Information | Gurjeet's Handcraft",
      desc: 'Transparent handmade shipping timelines, dispatch preparation, and eco-friendly packaging details for Gurjeet’s Handcraft.',
    },
    returns: {
      title: "Returns & Exchange Policy | Gurjeet's Handcraft",
      desc: 'Information regarding returns, handmade piece exchanges, and customer support for Gurjeet’s Handcraft.',
    },
    privacy: {
      title: "Privacy Policy | Gurjeet's Handcraft",
      desc: 'How Gurjeet’s Handcraft respects and protects customer contact and order information.',
    },
    terms: {
      title: "Terms of Craft & Service | Gurjeet's Handcraft",
      desc: 'Terms of service and handcrafted woolen commission agreements for Gurjeet’s Handcraft.',
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.shipping;

  const tabs = [
    { id: 'shipping', label: 'Shipping Information', path: '/shipping-information', icon: Truck },
    { id: 'returns', label: 'Returns & Exchange', path: '/returns-information', icon: RotateCcw },
    { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Craft', path: '/terms', icon: FileText },
  ];

  return (
    <Container className="py-8 sm:py-14 max-w-4xl space-y-10">
      <SEO
        title={currentMeta.title}
        description={currentMeta.desc}
        canonical={location.pathname}
      />

      {/* Header */}
      <div className="text-center space-y-3 border-b border-artisan-heather/80 pb-8">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-artisan-softBrown font-semibold bg-artisan-cream px-3 py-1 rounded-full border border-artisan-heather">
          <Heart className="w-3.5 h-3.5 text-artisan-terracotta fill-artisan-terracotta" />
          <span>Handmade Studio Policies</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-artisan-earthBrown tracking-tight">
          Customer Care & Studio Policies
        </h1>
        <p className="text-sm text-artisan-softBrown max-w-2xl mx-auto leading-relaxed">
          Because every woolen creation is crafted by Gurjeet's own hands, our policies are built around authenticity, transparency, and personal care.
        </p>
      </div>

      {/* Policy Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-artisan-cream border border-artisan-heather">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-artisan-ivory text-artisan-terracotta shadow-xs border border-artisan-heather/60'
                  : 'text-artisan-softBrown hover:text-artisan-earthBrown'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Policy Content Sections */}
      <div className="rounded-3xl bg-artisan-cream/80 border border-artisan-heather p-6 sm:p-10 shadow-xs text-artisan-earthBrown space-y-8">
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Handmade Shipping & Delivery Information
              </h2>
              <p className="text-xs text-artisan-softBrown mt-1">
                Last updated: September 2026 &bull; Handcrafted with care in India
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-artisan-softBrown">
              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  1. Handcrafting Timelines vs Dispatch
                </h3>
                <p>
                  Every piece in our shop is personally crocheted or hand-knitted by Gurjeet.
                  <strong> Ready to ship</strong> items are dispatched within 1–2 business days.
                  <strong> Made to order</strong> and custom sized creations typically require 3–7 crafting days before dispatch, depending on complexity and yarn batching.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  2. Trusted Courier Partners
                </h3>
                <p>
                  We dispatch orders across India via reputable speed courier networks (India Post Speed Post, Blue Dart, Delhivery).
                  Transit time is generally 3–6 business days depending on your postal pin code.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  3. Personal Tracking Updates
                </h3>
                <p>
                  Once your parcel is securely packed in eco-conscious packaging, Gurjeet will directly share your courier tracking number via WhatsApp ({BUSINESS_CONFIG.displayPhone}) and SMS.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Returns, Exchanges & Damaged Deliveries
              </h2>
              <p className="text-xs text-artisan-softBrown mt-1">
                Genuine artisan commitment &bull; Fair and thoughtful customer care
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-artisan-softBrown">
              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  1. The Nature of Handmade Crafts
                </h3>
                <p>
                  Because every scarf, glove, beanie, and muffler is made by human hands, slight natural variations in stitch tension, yarn hue, and texture are hallmarks of authentic slow craft, not defects.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  2. Transit Damage or Discrepancy
                </h3>
                <p>
                  In the rare event that your package arrives damaged or an incorrect item was delivered, please inform Gurjeet within 48 hours of receipt via WhatsApp at {BUSINESS_CONFIG.displayPhone} with photos of the parcel. We will happily replace it or arrange an agreeable solution.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  3. Custom & Made-to-Order Pieces
                </h3>
                <p>
                  Custom orders made to specific bespoke measurements or custom color blends are crafted uniquely for you and cannot be restocked. Gurjeet will clarify all dimensions and yarn colors with you before commencing crafting to ensure total delight.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Artisan Privacy Policy
              </h2>
              <p className="text-xs text-artisan-softBrown mt-1">
                Respecting your personal information and privacy
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-artisan-softBrown">
              <p>
                At <strong>Gurjeet's Handcraft</strong>, we respect and value your privacy. We collect only the information strictly necessary to fulfill your woolen order request and communicate with you about your custom pieces:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your full name, delivery address, and contact phone number.</li>
                <li>Your WhatsApp communication regarding product inquiries, custom requests, and sizing preferences.</li>
              </ul>
              <p>
                We <strong>never</strong> sell, rent, or share your contact details with third-party advertising companies. Your phone number is strictly used for order updates and crafting confirmations directly from Gurjeet.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Terms of Craft & Service
              </h2>
              <p className="text-xs text-artisan-softBrown mt-1">
                Understanding our artisan-to-customer relationship
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-artisan-softBrown">
              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  1. Order Request Confirmation
                </h3>
                <p>
                  Submitting an order request on our website does not immediately trigger an automated charge. Gurjeet personally reviews every order request, checks pure wool yarn stock, and confirms the schedule with you via WhatsApp or phone.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1">
                <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                  2. Genuine Wool Care Responsibility
                </h3>
                <p>
                  Our creations are made with delicate woolen yarns that must be hand washed gently in cold water and dried flat in the shade. We cannot accept liability for shrinkage or felting resulting from machine washing or hot drying.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Studio Direct Assistance Card */}
        <div className="mt-8 pt-6 border-t border-artisan-heather/80 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-artisan-ivory border border-artisan-heather">
          <div>
            <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
              Have questions about a policy or custom piece?
            </h4>
            <p className="text-xs text-artisan-softBrown">
              Speak directly with Gurjeet for any clarifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BUSINESS_CONFIG.whatsappBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-artisan-earthBrown border border-[#25D366]/40 hover:bg-[#25D366]/20 transition"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Gurjeet</span>
            </a>

            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-artisan-cream text-artisan-earthBrown border border-artisan-heather hover:bg-artisan-sandstone transition"
            >
              <Phone className="w-3.5 h-3.5 text-artisan-softBrown" />
              <span>{BUSINESS_CONFIG.displayPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default PolicyPage;
