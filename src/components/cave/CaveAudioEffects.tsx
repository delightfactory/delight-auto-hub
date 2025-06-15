import React, { useEffect, useRef, useCallback } from 'react';

/**
 * مكون CaveAudioEffects
 * 
 * يوفر هذا المكون واجهة برمجية لتشغيل المؤثرات الصوتية في تجربة المغارة
 * يقوم بتحميل الأصوات بشكل كسول (lazy) عند الحاجة فقط لتحسين الأداء
 * ويوفر وظائف لتشغيل الأصوات المختلفة مثل فتح الباب، إضافة للسلة، جمع العملات، إلخ
 */

interface AudioContextRef {
  context: AudioContext | null;
  initialized: boolean;
  sounds: Record<string, HTMLAudioElement>;
}

export const useCaveAudio = () => {
  const audioContextRef = useRef<AudioContextRef>({
    context: null,
    initialized: false,
    sounds: {}
  });

  // تهيئة السياق الصوتي بعد تفاعل المستخدم لتجنب سياسات التشغيل التلقائي للمتصفح
  const initAudio = useCallback(() => {
    if (!audioContextRef.current.initialized) {
      try {
        audioContextRef.current.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current.initialized = true;
        console.log('تم تهيئة سياق الصوت بنجاح');
      } catch (error) {
        console.error('فشل في تهيئة سياق الصوت:', error);
      }
    }
    return audioContextRef.current.initialized;
  }, []);

  // تحميل ملف صوتي بشكل كسول
  const loadSound = useCallback((soundName: string, volume: number = 1.0): HTMLAudioElement => {
    if (audioContextRef.current.sounds[soundName]) {
      return audioContextRef.current.sounds[soundName];
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    fetch(`/sounds/${soundName}.mp3`)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        audio.src = url;
        audio.load();
      })
      .catch(err => console.error(`فشل في تحميل الصوت ${soundName}:`, err));
    audioContextRef.current.sounds[soundName] = audio;
    return audio;
  }, []);

  // تشغيل صوت معين
  const playSound = useCallback((soundName: string, volume: number = 1.0) => {
    if (!initAudio()) return;

    // تشغيل الصوت مباشرة من public لتجنّب أخطاء Range وNotSupported
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = volume;
    audio.play().catch(error => {
      console.error(`فشل في تشغيل الصوت ${soundName}:`, error);
    });
  }, [initAudio]);

  // وظائف مساعدة لتشغيل أصوات محددة
  const playCaveDoor = useCallback(() => playSound('cave-door', 0.6), [playSound]);
  const playCartAdd = useCallback(() => playSound('cart-add', 0.5), [playSound]);
  const playCoinCollect = useCallback(() => playSound('coin-collect', 0.4), [playSound]);
  const playTreasureFound = useCallback(() => playSound('treasure-found', 0.7), [playSound]);
  const playLevelUp = useCallback(() => playSound('level-up', 0.6), [playSound]);

  // إضافة مستمع لتفاعل المستخدم لتهيئة السياق الصوتي
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudio();
      window.removeEventListener('pointerdown', handleUserInteraction);
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', handleUserInteraction);
  }, [initAudio]);

  return {
    playSound,
    playCaveDoor,
    playCartAdd,
    playCoinCollect,
    playTreasureFound,
    playLevelUp
  };
};

// مكون لتحميل الأصوات مسبقًا (اختياري)
export const CaveAudioPreloader: React.FC = () => {
  const { playSound } = useCaveAudio();

  useEffect(() => {
    // تحميل الأصوات مسبقًا بصوت 0 (بدون تشغيل)
    const preloadSounds = async () => {
      const sounds = ['cave-door', 'cart-add', 'coin-collect', 'treasure-found', 'level-up'];
      sounds.forEach(sound => {
        const audio = new Audio(`/sounds/${sound}.mp3`);
        audio.volume = 0;
        audio.preload = 'auto';
        // تشغيل وإيقاف فوري لتحميل الملف
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(e => {
            // تجاهل أخطاء التشغيل التلقائي
          });
        }
      });
    };

    // تحميل الأصوات بعد تفاعل المستخدم
    const handleUserInteraction = () => {
      preloadSounds();
      window.removeEventListener('pointerdown', handleUserInteraction);
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', handleUserInteraction);
  }, []);

  return null; // مكون غير مرئي
};

export default useCaveAudio;