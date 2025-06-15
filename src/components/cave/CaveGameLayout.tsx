import React, { Suspense, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaveAudio } from './CaveAudioEffects';

/**
 * CaveGameLayout
 * تخطيط مستوحى من الألعاب يوفر:
 * - خلفية خشبية / ذهبية ثلاثية الأبعاد باستخدام SVG متكرر (حجم صغير).
 * - رسوم متحركة لفتح "الباب" عند تحميل المكون لأول مرة.
 * - تأثيرات صوتية تُحمّل بشكل كسول بعد تفاعل المستخدم لتجنب حظر التشغيل التلقائي.
 *
 * اعتبارات الأداء:
 * 1. CSS/SVG خالص، بدون صور كبيرة. نمط SVG للخلفية هو نسيج خشبي 4×4.
 * 2. رسوم متحركة أولية فقط (انزلاق الباب) - بدون حركة ثقيلة مستمرة.
 * 3. ملف الصوت أقل من 100 كيلوبايت MP3، مستضاف في /sounds ويتم جلبه بكسل فقط عند أول تفاعل للمستخدم.
 */

interface Props {
  children: React.ReactNode;
}

const CaveGameLayout: React.FC<Props> = ({ children }) => {
  const { playSound } = useCaveAudio();

  // تهيئة الصوت بشكل كسول بعد أول إيماءة من المستخدم للامتثال لسياسات المتصفحات
  useEffect(() => {
    const handleUserGesture = () => {
      playSound('cave-door', 0.6);
      window.removeEventListener('pointerdown', handleUserGesture);
    };
    window.addEventListener('pointerdown', handleUserGesture, { once: true });
    return () => window.removeEventListener('pointerdown', handleUserGesture);
  }, [playSound]);

  return (
    <div className="relative min-h-screen overflow-hidden font-cairo bg-gray-900 text-white" dir="rtl">
      {/* نسيج خشبي خفيف الوزن ثابت */}
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'%3E%3Crect width=\'4\' height=\'4\' fill=\'%232c1e0f\'/%3E%3Crect width=\'4\' height=\'2\' fill=\'%23342110\'/%3E%3C/svg%3E')] bg-repeat [background-size:4px_4px]" />

      {/* تراكب تدرج ذهبي للعمق */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-900/20 via-yellow-900/10 to-transparent" />

      {/* رسوم متحركة لفتح الباب */}
      <AnimatePresence>
        <motion.div
          key="door"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
          className="absolute inset-0 bg-[#2c1e0f] z-20"
        />
      </AnimatePresence>

      {/* المحتوى يظهر تدريجياً */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.4 }}
        className="relative z-10 min-h-screen"
      >
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
          </div>
        }>
          {children}
        </Suspense>
      </motion.div>

      {/* تأثير الجسيمات الذهبية */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-300/30"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: 0
            }}
            animate={{
              y: [null, Math.random() * 100 + '%'],
              x: [null, Math.random() * 100 + '%'],
              scale: [0, Math.random() * 2 + 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CaveGameLayout;
