import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gem, ArrowRight } from 'lucide-react';
import CaveParticles from './CaveParticles';
import { cn } from '@/lib/utils';
import { useCaveAudio } from './CaveAudioEffects';

interface CaveHeroProps {
  className?: string;
}

const CaveHero: React.FC<CaveHeroProps> = ({ className }) => {
  const caveAudio = useCaveAudio();
  return (
    <section
      className={cn(
        'cave-hero-gold-frame relative isolate overflow-hidden text-center flex flex-col items-center justify-center h-[55vh] md:h-[65vh] px-4 -mt-12 md:-mt-16 rounded-lg',
        className,
      )}
    >
      {/* Background texture */}
      <img
        src="/images/cave-texture.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 mix-blend-overlay pointer-events-none select-none"
      />
      {/* Emerald gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#032019]/70 to-[#010406]/90" />

      {/* Decorative particles */}
      <CaveParticles count={20} duration={12} />

      {/* Headline & CTA */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-amber-200 drop-shadow-[0_3px_2px_rgba(0,0,0,0.4)]"
        >
          ✨ اكتشف كنوز المغارة الحصرية
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-emerald-100/90 text-sm md:text-lg"
        >
          عروض لا تفوَّت، نقاط مكافأة مضاعفة، وتجربة تسوّق مليئة بالمفاجآت.
        </motion.p>
        <Link
          to="#events-section"
          onClick={() => caveAudio.playCoinCollect()}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm md:text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          ابدأ الاستكشاف الآن <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default CaveHero;
