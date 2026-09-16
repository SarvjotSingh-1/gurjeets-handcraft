import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  Heart,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Phone,
  Layers,
  Palette,
  Ruler,
  Feather,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';

export const HowItsMadePage = () => {
  const customOrderWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    "Hello Gurjeet, I read through the 'How It's Made' craft story and would like to start a custom woolen order with you!"
  );

  // The 6 Immersive Timeline Stages
  const stages = [
    {
      step: '01',
      title: 'Choosing the Yarn',
      subtitle: 'Fiber Selection & Tactile Feel',
      desc: 'Every piece begins with yarn selection. Gurjeet tests natural wools, pure merino, and gentle fiber blends for softness against delicate neck and face skin. We prioritize yarn twist and loft so the garment insulates deeply in cold weather without causing itchiness or stiff friction.',
      visualIcon: '🧶',
      badge: 'Step 01 &bull; Natural Wool',
      imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
      highlights: ['Soft merino & highland wools', 'Skin-friendly, breathable loft', 'Natural thermal insulation'],
    },
    {
      step: '02',
      title: 'Planning the Design',
      subtitle: 'Stitch Architecture & Proportions',
      desc: 'Before the first loop is cast on, the stitch structure is planned. Whether crafting an elastic 2x2 ribbing for a scarf, honeycomb cables for a muffler, or structural shells for a wind-resistant beanie, stitch counts and dimensions are mapped to ensure a comfortable, flattering drape.',
      visualIcon: '📐',
      badge: 'Step 02 &bull; Stitch Pattern',
      imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
      highlights: ['Custom head & neck sizing', 'Elastic ribbing & cable motifs', 'Balanced drape & proportion'],
    },
    {
      step: '03',
      title: 'Crochet / Knitting',
      subtitle: 'Row-by-Row Human Craft',
      desc: 'Working stitch by stitch with wooden knitting needles or metal crochet hooks, Gurjeet regulates tension purely through hand sensitivity. Unlike automated machinery that jerks fibers tight, hand tension leaves subtle air pockets in the wool, allowing the garment to breathe and stretch organically.',
      visualIcon: '🥢',
      badge: 'Step 03 &bull; Needle & Hook',
      imageUrl: 'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=800&auto=format&fit=crop&q=80',
      highlights: ['Guided entirely by human hands', 'Hours of focused attention', 'Living stretch in every stitch'],
    },
    {
      step: '04',
      title: 'Shaping & Finishing',
      subtitle: 'Weaving Ends & Steam Blocking',
      desc: 'Once the main knitting or crochet is cast off, the delicate finishing begins. Loose yarn tails are hand-woven deeply into the stitch matrix with tapestry needles so nothing unravels. The piece is then gently steam-blocked to open the stitches and lock in final proportions.',
      visualIcon: '✂️',
      badge: 'Step 04 &bull; Tailored Finishing',
      imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80',
      highlights: ['Invisible hand-woven yarn ends', 'Gentle steam blocking for shape', 'Clean, durable border edges'],
    },
    {
      step: '05',
      title: 'Quality Check',
      subtitle: 'Inspection for Lasting Wear',
      desc: 'Each creation is inspected under natural studio light. Gurjeet examines the stitch uniformity, edge stretch, elasticity recovery, and seam softness. Only items that meet our personal standard of slow-craft excellence are approved for packaging.',
      visualIcon: '🔍',
      badge: 'Step 05 &bull; Personal Inspection',
      imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
      highlights: ['100% individual inspection', 'Checking seam softness', 'Verified elasticity & loft'],
    },
    {
      step: '06',
      title: 'Ready for You',
      subtitle: 'Thoughtful Packaging & Dispatch',
      desc: 'The completed woolen piece is folded into breathable, plastic-free tissue wrap, paired with handwritten wool care guidelines, and securely packaged. Gurjeet shares personal courier tracking directly with you on WhatsApp so you can follow its journey home.',
      visualIcon: '📦',
      badge: 'Step 06 &bull; Direct Dispatch',
      imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80',
      highlights: ['Eco-friendly breathable packaging', 'Handwritten care guidelines', 'Personal WhatsApp tracking update'],
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-36 max-w-5xl mx-auto">
      <SEO
        title="How It's Made: Slow Hand-Knitting & Crochet | Gurjeet's Handcraft"
        description="Explore the step-by-step handmade process at Gurjeet's Handcraft: from natural merino wool selection to wooden needle knitting, steam blocking, and finishing."
        keywords={[
          'how woolen scarves are made',
          'hand-knitting process',
          'artisan crochet technique',
          'steam blocking wool',
          'merino wool yarn curation',
        ]}
        canonical="/how-its-made"
      />

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-6 pt-4 sm:pt-8"
      >
        <div className="inline-flex items-center gap-2">
          <Badge variant="terracotta">Craftsmanship & Process</Badge>
          <span className="text-xs text-artisan-softBrown font-medium">
            &bull; Gurjeet's Handcraft
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-artisan-earthBrown tracking-tight leading-tight">
          How It's Made
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl text-artisan-softBrown max-w-2xl mx-auto leading-relaxed">
          From a raw skein of pure wool to a finished winter heirloom: an immersive look into the quiet craft of the needles.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-artisan-softBrown font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-artisan-terracotta" /> Hours of Hand Work
          </span>
          <span className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-artisan-terracotta" /> Hand-Knitted & Crocheted
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-artisan-terracotta" /> Made by Gurjeet
          </span>
        </div>
      </motion.section>

      {/* =========================================================================
          IMMERSIVE VISUAL TIMELINE (01 to 06)
          ========================================================================= */}
      <section className="space-y-16 sm:space-y-24">
        {stages.map((stage, index) => {
          const isEven = index % 2 === 1;

          return (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Frame Column */}
              <div
                className={`lg:col-span-6 ${
                  isEven ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="relative rounded-3xl overflow-hidden bg-artisan-cream border border-artisan-heather shadow-card aspect-[4/3] group">
                  <img
                    src={stage.imageUrl}
                    alt={stage.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-artisan"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-artisan-earthBrown/60 via-transparent to-transparent opacity-80" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-artisan-ivory/95 backdrop-blur-xs text-artisan-earthBrown border border-artisan-heather">
                      {stage.badge}
                    </span>
                  </div>

                  {/* Bottom Details */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-artisan-cream">
                    <span className="font-serif font-bold text-base tracking-wide">
                      {stage.title}
                    </span>
                    <span className="text-2xl">{stage.visualIcon}</span>
                  </div>
                </div>
              </div>

              {/* Story Narrative Column */}
              <div
                className={`lg:col-span-6 space-y-4 ${
                  isEven ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-artisan-terracotta">
                    {stage.step}
                  </span>
                  <span className="h-px flex-1 bg-artisan-heather/80" />
                  <span className="text-[11px] uppercase tracking-widest text-artisan-softBrown font-semibold">
                    {stage.subtitle}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
                  {stage.title}
                </h3>

                <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
                  {stage.desc}
                </p>

                {/* Highlights Pill List */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {stage.highlights.map((highlight, hIdx) => (
                    <span
                      key={hIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-artisan-cream border border-artisan-heather text-xs text-artisan-earthBrown font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-artisan-terracotta" />
                      <span>{highlight}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* =========================================================================
          HANDMADE VS MASS-PRODUCED SECTION (RESPECTFUL & BALANCED)
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-cream border border-artisan-heather p-8 sm:p-14 space-y-8 shadow-card">
        <div className="max-w-3xl space-y-3">
          <Badge variant="craft">Understanding the Difference</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Handmade Craft vs. Mass-Produced Knitwear
          </h2>
          <p className="text-sm text-artisan-softBrown leading-relaxed">
            Both industrial manufacturing and artisan handcraft serve distinct purposes in modern clothing. Here is a transparent look at what sets our slow handmade woolen pieces apart:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Industrial Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-3">
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Mass-Produced Knitwear
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Industrial looms operate at thousands of revolutions per minute to produce high-volume apparel. To withstand high mechanical tension, yarns are often blended with synthetic binders and pulled tightly into uniform stitches.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-artisan-softBrown border-t border-artisan-heather pt-3">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="font-semibold text-artisan-earthBrown">Minutes per sweater</span>
              </div>
              <div className="flex justify-between">
                <span>Tension:</span>
                <span className="font-semibold text-artisan-earthBrown">High automated tension</span>
              </div>
              <div className="flex justify-between">
                <span>Customization:</span>
                <span className="font-semibold text-artisan-earthBrown">Rigid standard sizing only</span>
              </div>
            </div>
          </div>

          {/* Handcrafted Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-artisan-ivory border border-artisan-terracotta/40 space-y-3 shadow-subtle">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-artisan-terracotta">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gurjeet's Handcraft</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Handmade Artisan Craft
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Every loop is guided by human fingers and wooden needles. The natural crimp and elasticity of pure wool are preserved, allowing the garment to mold comfortably to your body and hold living warmth without stiffness.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-artisan-softBrown border-t border-artisan-heather pt-3">
              <div className="flex justify-between">
                <span>Patience:</span>
                <span className="font-semibold text-artisan-terracotta">Several days per piece</span>
              </div>
              <div className="flex justify-between">
                <span>Tension:</span>
                <span className="font-semibold text-artisan-earthBrown">Gentle, natural stitch loft</span>
              </div>
              <div className="flex justify-between">
                <span>Customization:</span>
                <span className="font-semibold text-artisan-terracotta">Tailored sizes & custom shades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA SECTION: "WANT SOMETHING MADE SPECIALLY FOR YOU?"
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-espresso text-artisan-cream p-8 sm:p-14 text-center space-y-6 shadow-cozy">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-artisan-terracotta">
            Bespoke Atelier Service
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Want something made specially for you?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-cream/80 leading-relaxed max-w-xl mx-auto">
            Whether you need a specific scarf length, custom head circumference, or a special wool shade to match your favorite coat, Gurjeet can handcraft it to your personal specifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary CTA */}
          <Link to="/custom-orders">
            <Button size="lg" className="gap-2 shadow-card">
              <span>Start a Custom Order</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* WhatsApp Direct */}
          <a
            href={customOrderWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-card tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with Gurjeet on WhatsApp</span>
          </a>
        </div>

        <p className="text-[11px] text-artisan-cream/60">
          Personal craft queries welcome &bull; Call: {BUSINESS_CONFIG.displayPhone}
        </p>
      </section>
    </div>
  );
};

export default HowItsMadePage;
