import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Scissors,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Phone,
  Layers,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';

export const OurStoryPage = () => {
  const customIdeaWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    "Hello Gurjeet, I read your Story on the website and have a custom handmade woolen idea I would love to discuss with you!"
  );

  return (
    <div className="space-y-20 sm:space-y-28 max-w-5xl mx-auto">
      <SEO
        title="Our Story & Artisan Craftsmanship | Gurjeet's Handcraft"
        description="Discover the story behind Gurjeet's Handcraft: a slow-craft studio creating authentic hand-knitted and crocheted winter wear with natural merino wool."
        keywords={[
          'Gurjeet handcraft story',
          'artisan woolen studio',
          'hand-knitted heritage',
          'slow fashion Himachal wool',
          'authentic crochet craft',
        ]}
        canonical="/our-story"
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
          <Badge variant="terracotta">Behind the Needles</Badge>
          <span className="text-xs text-artisan-softBrown font-medium">
            &bull; Gurjeet's Handcraft
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-artisan-earthBrown tracking-tight leading-tight">
          Our Story
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl text-artisan-softBrown max-w-2xl mx-auto leading-relaxed">
          "Every piece begins with yarn, time and careful hands."
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-artisan-softBrown font-medium">
          <span className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-artisan-terracotta" /> 100% Hand-Crafted
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-artisan-terracotta" /> Crochet Hooks & Wooden Needles
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-artisan-terracotta" /> Handmade by Gurjeet
          </span>
        </div>
      </motion.section>

      {/* =========================================================================
          INTRODUCTION: SLOW TEXTILE ATELIER
          ========================================================================= */}
      <section className="p-8 sm:p-14 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 text-artisan-earthBrown leading-relaxed shadow-card">
        <div className="max-w-3xl space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
            A Quiet Dedication to Real Wool
          </h2>
          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            Welcome to <strong>Gurjeet's Handcraft</strong>. This is not a commercial factory, an automated assembly line, or an impersonal ecommerce reseller. It is a personal handmade woolen business where every scarf, beanie, pair of gloves, muffler, and pair of socks is made individually by hand.
          </p>
          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            In a world filled with synthetic fibers and fast-paced mass production, we believe there is quiet luxury in garments that take hours of patient human concentration to create. A woolen piece that is made slowly holds more than warmth—it carries the human touch in every single loop.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION: WHO IS GURJEET? (AUTHENTIC, EDITABLE CONTENT)
          ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Artisan Portrait Frame / Studio Badge */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm rounded-3xl bg-artisan-ivory p-8 border border-artisan-heather shadow-card text-center space-y-5">
            <div className="w-24 h-24 mx-auto rounded-full bg-artisan-sandstone/60 border border-artisan-heather flex items-center justify-center text-4xl shadow-subtle">
              🧶
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-artisan-terracotta block">
                The Maker
              </span>
              <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Gurjeet
              </h3>
              <p className="text-xs text-artisan-softBrown">
                Artisan & Founder &bull; Gurjeet's Handcraft
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-artisan-cream border border-artisan-heather text-xs text-artisan-softBrown text-left space-y-2">
              <div className="flex justify-between">
                <span>Tools:</span>
                <span className="font-semibold text-artisan-earthBrown">Crochet Hooks & Needles</span>
              </div>
              <div className="flex justify-between">
                <span>Craft Medium:</span>
                <span className="font-semibold text-artisan-earthBrown">Pure Wool & Soft Blends</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold text-artisan-earthBrown">India</span>
              </div>
            </div>

            <div className="text-[11px] text-artisan-softBrown/80 italic">
              [Artisan Photo: You can place Gurjeet's authentic portrait or studio photo here]
            </div>
          </div>
        </div>

        {/* Right Column: Personal Introduction Narrative */}
        <div className="md:col-span-7 space-y-5">
          <Badge variant="craft">Meet the Maker</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Who is Gurjeet?
          </h2>

          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            Gurjeet is the sole maker behind every piece shown on this website. Working from a dedicated home workspace, Gurjeet sits with wooden knitting needles and crochet hooks, personally crafting each row from hand-selected wool yarns.
          </p>

          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            There are no outside staff, no hired contractors, and no automated machinery. When you browse a scarf, select a beanie, or discuss a custom muffler length, you are connecting directly with Gurjeet herself.
          </p>

          {/* Editable Note Box for Owner */}
          <div className="p-5 rounded-2xl bg-artisan-sandstone/30 border border-artisan-heather/80 space-y-2">
            <h4 className="font-serif font-bold text-artisan-earthBrown text-xs uppercase tracking-wider">
              Artisan Profile Note
            </h4>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              "I love the quiet rhythm of the needles and the feeling of pure wool coming to life. When someone wears one of my scarves or beanies in freezing weather, I want them to feel genuine warmth and care."
              <span className="block font-semibold text-artisan-earthBrown mt-1">— Gurjeet</span>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: WHY HANDMADE? (THE SLOW CRAFT PHILOSOPHY)
          ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="terracotta">Our Philosophy</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Why Handmade?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            What makes hand-worked stitches feel so distinctly different from machine garments:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-8 rounded-3xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown/40 transition-colors shadow-subtle space-y-3">
            <span className="font-mono text-xs font-bold text-artisan-terracotta">01 / NATURAL ELASTICITY</span>
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Human Stitch Tension
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Industrial knitting machines stretch and pull fibers at high speeds, creating stiff, tense fabrics. Hand knitting allows the yarn to relax, leaving natural air pockets that trap body heat without suffocating the skin.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown/40 transition-colors shadow-subtle space-y-3">
            <span className="font-mono text-xs font-bold text-artisan-terracotta">02 / ENDURING HEIRLOOMS</span>
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Made for Generations
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Fast fashion is designed to unravel after a single season. Our woolen creations are crafted with securely woven-in ends, sturdy cast-ons, and durable fiber structures designed to be worn winter after winter.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown/40 transition-colors shadow-subtle space-y-3">
            <span className="font-mono text-xs font-bold text-artisan-terracotta">03 / RESPECT FOR THE MAKER</span>
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              A Human Relationship
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              When you wear a Gurjeet creation, you know exactly whose hands shaped it. You are not a transaction number in a warehouse database—you are wearing an authentic piece of human craft.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: THE CRAFT (CROCHET & KNITTING EXPLAINED BEAUTIFULLY)
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-cream border border-artisan-heather p-8 sm:p-14 space-y-10 shadow-card">
        <div className="max-w-3xl space-y-3">
          <Badge variant="craft">Two Ancient Traditions</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            The Craft: Crochet Hooks & Knitting Needles
          </h2>
          <p className="text-sm text-artisan-softBrown leading-relaxed">
            Gurjeet utilizes both hand-knitting and crochet, choosing the ideal craft technique for the functional personality of each woolen creation:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Knitting Card */}
          <div className="p-8 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🥢</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-artisan-terracotta font-semibold">
                Two Needles
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
              Hand-Knitting
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Knitting uses two needles to interloop continuous rows of yarn. It produces lightweight, highly elastic fabrics with supple drape and soft stretch.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-artisan-earthBrown">
              <div className="font-semibold text-artisan-terracotta">What Gurjeet Knits:</div>
              <ul className="space-y-1 pl-1 text-artisan-softBrown">
                <li>&bull; Textured ribbed scarves & long mufflers</li>
                <li>&bull; Snug woolen gloves with flexible finger movement</li>
                <li>&bull; Comfortable hand-knitted bed & lounge socks</li>
              </ul>
            </div>
          </div>

          {/* Crochet Card */}
          <div className="p-8 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🪝</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-artisan-terracotta font-semibold">
                Single Hook
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
              Hand-Crochet
            </h3>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Crochet uses a single hook to complete individual stitches one at a time. It produces dense, sculptural, wind-resistant textures with dimensional stitch relief.
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-artisan-earthBrown">
              <div className="font-semibold text-artisan-terracotta">What Gurjeet Crochets:</div>
              <ul className="space-y-1 pl-1 text-artisan-softBrown">
                <li>&bull; Structural winter beanies with turn-up ribbed brims</li>
                <li>&bull; Warm woolen kettle & mug cozies</li>
                <li>&bull; Textured accessories with distinctive stitch patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: BEHIND THE SCENES (WORKSPACE PHOTO PLACEHOLDERS)
          ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="terracotta">Behind the Scenes</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Inside the Studio Workspace
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            Authentic visual snapshots from the making process. Real workspace photography will be showcased here:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Yarn Selection */}
          <div className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 flex flex-col justify-between min-h-[240px] text-center space-y-4 shadow-subtle group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-artisan-softBrown group-hover:text-artisan-terracotta transition">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-artisan-terracotta font-semibold">
                Natural Fiber Curation
              </span>
              <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
                Pure Wool Hanks & Skeins
              </h4>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Carefully inspecting natural fibers, merino skeins, and winter wool color palettes before any needle begins.
              </p>
            </div>
            <div className="text-[11px] font-medium text-artisan-softBrown border-t border-artisan-heather/70 pt-3">
              100% Breathable Merino & Blends
            </div>
          </div>

          {/* Card 2: Work in Progress */}
          <div className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 flex flex-col justify-between min-h-[240px] text-center space-y-4 shadow-subtle group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-artisan-softBrown group-hover:text-artisan-terracotta transition">
              <Scissors className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-artisan-terracotta font-semibold">
                Slow Craftsmanship
              </span>
              <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
                Needles in Motion
              </h4>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Hand-knitting each pure merino piece row by row on long birchwood needles with uniform human tension.
              </p>
            </div>
            <div className="text-[11px] font-medium text-artisan-softBrown border-t border-artisan-heather/70 pt-3">
              Individual Hand-Crafted Stitches
            </div>
          </div>

          {/* Card 3: Finishing & Steam Blocking */}
          <div className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 flex flex-col justify-between min-h-[240px] text-center space-y-4 shadow-subtle group">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-artisan-softBrown group-hover:text-artisan-terracotta transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-artisan-terracotta font-semibold">
                Artisan Quality Control
              </span>
              <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
                Finishing & Quality Check
              </h4>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Tucking in all yarn ends seamlessly, gentle steam blocking for stitch drape, and plastic-free paper packaging.
              </p>
            </div>
            <div className="text-[11px] font-medium text-artisan-softBrown border-t border-artisan-heather/70 pt-3">
              Steam Blocked & Thoughtfully Wrapped
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: OUR PROMISE
          ========================================================================= */}
      <section className="p-8 sm:p-14 rounded-3xl sm:rounded-[36px] bg-artisan-ivory border border-artisan-heather space-y-8 shadow-card">
        <div className="max-w-2xl space-y-2">
          <Badge variant="craft">Core Commitments</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Our Promise to You
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            What you can always count on when acquiring a Gurjeet handcrafted piece:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <div className="flex items-center gap-2 text-artisan-terracotta">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-serif font-bold text-artisan-earthBrown text-base">
                Honest Product Information
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              We describe exact wool contents, dimensions, and realistic crafting timelines without inflated claims.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <div className="flex items-center gap-2 text-artisan-terracotta">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-serif font-bold text-artisan-earthBrown text-base">
                Careful Craftsmanship
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Every stitch is individually formed. We never cut corners on yarn cast-offs, seams, or edge borders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <div className="flex items-center gap-2 text-artisan-terracotta">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-serif font-bold text-artisan-earthBrown text-base">
                Personal Attention
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              You converse directly with Gurjeet. Sizing, shades, and special requests are confirmed personally.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <div className="flex items-center gap-2 text-artisan-terracotta">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-serif font-bold text-artisan-earthBrown text-base">
                Individual Quality Checking
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
              Each creation is steam-blocked, inspected for tension, and wrapped carefully before leaving the studio.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTAS: "EXPLORE THE HANDMADE COLLECTION" & "HAVE A CUSTOM IDEA?"
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-espresso text-artisan-cream p-8 sm:p-14 text-center space-y-6 shadow-cozy">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-artisan-terracotta">
            Connect with the Atelier
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Experience Real Wool?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-cream/80 leading-relaxed max-w-xl mx-auto">
            Browse our ready handcrafted collection or speak directly with Gurjeet to commission a custom woolen piece.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary CTA */}
          <Link to="/shop">
            <Button size="lg" className="gap-2 shadow-card">
              <span>Explore the Handmade Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* Secondary CTA */}
          <Link to="/custom-orders">
            <Button variant="secondary" size="lg">
              Have a Custom Idea?
            </Button>
          </Link>

          {/* WhatsApp Direct */}
          <a
            href={customIdeaWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-card tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default OurStoryPage;
