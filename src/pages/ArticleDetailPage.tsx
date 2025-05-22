import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Tag, Share2, Bookmark, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/context/ThemeContext';
import { articleService } from '@/services/articleService';
import { Comment } from '@/types/db';

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [likes, setLikes] = useState(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [articleData, setArticleData] = useState<any | null>(null);

  // جلب بيانات المقال والتعليقات عند التحميل
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const art = await articleService.getArticle(slug!);
        setArticleData(art);
        setLikes(art.likes || 0);
        const cmts = await articleService.getComments(art.id);
        setComments(cmts);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [slug]);

  // التعامل مع الإعجاب
  const handleLike = async () => {
    if (!slug) return;
    try {
      const newLikes = await articleService.likeArticle(slug!);
      setLikes(newLikes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentClick = () => setShowCommentBox(prev => !prev);
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert('تم نسخ رابط المقال'); };

  // إرسال التعليق
  const handleSendComment = async () => {
    if (!articleData || !commentContent.trim()) return;
    try {
      await articleService.postComment(articleData.id, commentContent);
      setCommentContent('');
      setShowCommentBox(false);
      const cmts = await articleService.getComments(articleData.id);
      setComments(cmts);
      alert('تم إرسال تعليقك!');
    } catch (err) {
      console.error(err);
      alert('خطأ في إرسال التعليق');
    }
  };

  // In a real app, you would fetch this data from an API using the articleId
  const article = {
    id: slug,
    title: 'كيفية تنظيف محرك السيارة بشكل آمن',
    category: 'العناية بالمحرك',
    date: '10 مايو 2023',
    readTime: '5 دقائق',
    author: 'محمد أحمد',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
    content: `
      <p class="mb-4">تنظيف محرك السيارة ليس مجرد خطوة تجميلية، بل هو جزء أساسي من صيانة السيارة. محرك نظيف يمكن أن يساعد في تحديد التسريبات بسهولة، ويمنع تراكم الأوساخ والزيوت التي قد تؤدي إلى تآكل المكونات بمرور الوقت.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4">لماذا يجب تنظيف محرك السيارة؟</h2>
      
      <p class="mb-4">هناك عدة أسباب تجعل تنظيف محرك سيارتك أمرًا مهمًا:</p>
      
      <ul class="list-disc pr-6 mb-6 space-y-2">
        <li>يساعد في الكشف المبكر عن التسريبات والمشاكل المحتملة.</li>
        <li>يمنع تراكم الأوساخ والزيوت التي قد تؤدي إلى تآكل المكونات.</li>
        <li>يحافظ على درجة حرارة المحرك المثالية عن طريق منع تراكم الحرارة.</li>
        <li>يزيد من القيمة الجمالية والسوقية للسيارة.</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4">المواد والأدوات التي ستحتاجها</h2>
      
      <ul class="list-disc pr-6 mb-6 space-y-2">
        <li>منظف محرك مناسب (يفضل منظف على أساس مائي).</li>
        <li>أكياس بلاستيكية أو ورق ألمنيوم.</li>
        <li>فرشاة ناعمة أو فرشاة أسنان قديمة.</li>
        <li>خرقة ميكروفايبر.</li>
        <li>خرطوم ماء أو ضاغط هواء.</li>
        <li>نظارات واقية وقفازات.</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4">خطوات تنظيف المحرك بأمان</h2>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">1. تحضير السيارة</h3>
      <p class="mb-4">تأكد من أن محرك السيارة بارد تمامًا. لا تحاول أبدًا تنظيف محرك ساخن لتجنب الصدمة الحرارية للمكونات وخطر الإصابة. انتظر على الأقل ساعتين بعد إيقاف تشغيل السيارة.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">2. حماية المكونات الحساسة</h3>
      <p class="mb-4">قبل أن تبدأ في التنظيف، قم بتغطية المكونات الكهربائية الحساسة مثل البطارية، صندوق الفيوز، ووحدة التحكم في المحرك. يمكنك استخدام أكياس بلاستيكية أو ورق الألمنيوم لهذا الغرض.</p>
      
      <div class="rounded-xl overflow-hidden my-8">
        <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3" alt="تنظيف محرك السيارة" class="w-full h-auto" />
        <p class="text-sm text-center mt-2">حماية المكونات الكهربائية أثناء التنظيف</p>
      </div>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">3. تطبيق المنظف</h3>
      <p class="mb-4">رش منظف المحرك على جميع أجزاء المحرك، مع الحرص على تجنب المناطق التي قمت بتغطيتها. اترك المنظف لمدة 5-10 دقائق للتفاعل مع الأوساخ والزيوت (اتبع تعليمات المنتج).</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">4. الفرك والتنظيف</h3>
      <p class="mb-4">استخدم فرشاة ناعمة أو فرشاة أسنان قديمة للوصول إلى المناطق الصعبة والتخلص من الأوساخ العنيدة. كن لطيفًا ولا تستخدم القوة المفرطة.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">5. الشطف</h3>
      <p class="mb-4">اشطف المحرك بلطف باستخدام خرطوم ماء على ضغط منخفض. حاول أن تبقي تيار الماء بعيدًا عن المكونات الكهربائية المغطاة. بدلاً من ذلك، يمكنك استخدام ضاغط هواء للتنظيف إذا كنت قلقًا بشأن استخدام الماء.</p>
      
      <div class="rounded-xl overflow-hidden my-8">
        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc" alt="شطف محرك السيارة" class="w-full h-auto" />
        <p class="text-sm text-center mt-2">شطف المحرك باستخدام ضغط منخفض من الماء</p>
      </div>
      
      <h3 class="text-lg font-semibold mt-6 mb-3">6. التجفيف</h3>
      <p class="mb-4">استخدم قطعة قماش ميكروفايبر نظيفة لتجفيف المحرك قدر الإمكان. يمكنك أيضًا تشغيل السيارة لبضع دقائق للمساعدة في تبخير أي ماء متبقي.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4">نصائح إضافية</h2>
      
      <ul class="list-disc pr-6 mb-6 space-y-2">
        <li>تجنب استخدام منظفات قوية أو مذيبات قد تتلف المكونات البلاستيكية أو المطاطية.</li>
        <li>لا تستخدم ضغط ماء عالي حتى لا تتسبب في دخول الماء إلى المكونات الكهربائية.</li>
        <li>قم بتنظيف المحرك مرة كل 3-6 أشهر للحفاظ عليه في حالة جيدة.</li>
        <li>بعد التنظيف، تحقق من أي تسريبات أو مشاكل قد تكون أكثر وضوحًا الآن.</li>
      </ul>
      
      <div class="bg-delight-50 rounded-xl p-6 mt-8 mb-6">
        <h3 class="text-lg font-bold mb-3 text-delight-700">تذكير مهم</h3>
        <p>إذا لم تكن متأكدًا من قدرتك على تنظيف المحرك بأمان، فمن الأفضل دائمًا الاستعانة بخدمات متخصصة. السلامة تأتي أولاً!</p>
      </div>
      
      <h2 class="text-xl font-bold mt-8 mb-4">الخلاصة</h2>
      
      <p class="mb-4">تنظيف محرك سيارتك ليس بالمهمة الصعبة إذا اتبعت الخطوات الصحيحة واتخذت الاحتياطات اللازمة. محرك نظيف لا يعني فقط سيارة تبدو أفضل، بل يعني أيضًا سيارة تعمل بشكل أفضل وتستمر لفترة أطول. حافظ على تنظيف محرك سيارتك بانتظام كجزء من روتين الصيانة العامة.</p>
      
      <div class="border p-6 rounded-xl mt-10">
        <h3 class="text-lg font-bold mb-3">هل لديك أسئلة؟</h3>
        <p class="mb-4">نحن هنا للمساعدة! اترك تعليقًا أدناه أو تواصل معنا مباشرة للحصول على المزيد من النصائح حول العناية بسيارتك.</p>
      </div>
    `,
    tags: ['تنظيف المحرك', 'صيانة السيارة', 'نصائح للعناية'],
    relatedArticles: [
      { id: '2', title: 'أفضل منتجات تلميع السيارة في 2023', imageUrl: 'https://images.unsplash.com/photo-1553423300-19dbce9c5d3f' },
      { id: '3', title: 'كيفية إزالة الخدوش من طلاء السيارة', imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73' }
    ]
  };

  return (
    <div className={`min-h-screen w-full transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* Hero section */}
      <div className="relative h-[60vh] max-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.imageUrl})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-gray-900' : 'from-black/80'} to-transparent`} />
        
        <div className="absolute bottom-0 w-full p-6 md:p-10">
          <div className="container-custom">
            <Button 
              variant="outline" 
              className="mb-6 text-white border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={() => navigate('/articles')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى المقالات
            </Button>
            
            <div className="flex items-center mb-4 space-x-3 space-x-reverse">
              <span className="bg-delight-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
              <span className="text-white/80 text-sm flex items-center">
                <Calendar size={16} className="ml-1" />
                {article.date}
              </span>
              <span className="text-white/80 text-sm flex items-center">
                <Clock size={16} className="ml-1" />
                {article.readTime}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
              {article.title}
            </h1>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-delight-600 flex items-center justify-center text-white text-lg font-bold">
                {article.author.charAt(0)}
              </div>
              <div className="mr-3">
                <p className="text-white font-medium">{article.author}</p>
                <p className="text-white/70 text-sm">خبير العناية بالسيارات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Article content */}
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main content */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`prose prose-lg max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
            
            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  {tag}
                </div>
              ))}
            </div>
            
            {/* تفاعلات المقال */}
            <div className="flex items-center space-x-6 rtl:space-x-reverse mt-8">
              <div className="flex items-center cursor-pointer" onClick={handleLike}>
                <ThumbsUp size={20} className="ml-1" />
                <span className="text-sm">{likes}</span>
              </div>
              <div className="flex items-center cursor-pointer" onClick={handleCommentClick}>
                <MessageCircle size={20} className="ml-1" />
                <span className="text-sm">تعليق</span>
              </div>
              <div className="flex items-center cursor-pointer" onClick={handleShare}>
                <Share2 size={20} className="ml-1" />
                <span className="text-sm">مشاركة</span>
              </div>
            </div>
            
            {showCommentBox && (
              <div className="mt-4">
                <textarea
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white"
                  rows={4}
                />
                <Button
                  onClick={handleSendComment}
                  className="mt-2"
                >
                  أرسل التعليق
                </Button>
              </div>
            )}
            
            {/* قائمة التعليقات */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">التعليقات</h4>
              {comments.length === 0 ? (
                <p className="text-gray-500">لا توجد تعليقات بعد.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="mb-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center mb-2">
                      {c.author.avatar_url ? (
                        <img
                          src={c.author.avatar_url}
                          alt={c.author.name}
                          className="h-8 w-8 rounded-full ml-2"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-400 ml-2" />
                      )}
                      <span className="font-medium">{c.author.name}</span>
                      <span className="text-xs text-gray-500 mr-2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-gray-100">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex justify-between items-center">
              <div className="flex space-x-4 space-x-reverse">
                <Button variant="outline" size="sm" className="flex items-center">
                  <ThumbsUp className="ml-2 h-4 w-4" />
                  إعجاب
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Share2 className="ml-2 h-4 w-4" />
                  مشاركة
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Bookmark className="ml-2 h-4 w-4" />
                  حفظ
                </Button>
              </div>
            </div>
            
            <Separator className="my-10" />
            
            {/* Author info */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-delight-600 flex items-center justify-center text-white text-2xl font-bold">
                  {article.author.charAt(0)}
                </div>
                <div className="mr-4">
                  <h3 className="text-xl font-bold mb-1">{article.author}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    خبير في مجال العناية بالسيارات مع خبرة تزيد عن 10 سنوات. يكتب محتوى متخصص لمساعدة أصحاب السيارات في الحفاظ على مركباتهم.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Related articles */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>مقالات ذات صلة</h3>
              
              <div className="space-y-6">
                {article.relatedArticles.map((related) => (
                  <div 
                    key={related.id} 
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => navigate(`/articles/${related.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={related.imageUrl} 
                        alt={related.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className={`font-medium line-clamp-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {related.title}
                      </h4>
                      <Button 
                        variant="link" 
                        className={`p-0 h-auto mt-1 ${theme === 'dark' ? 'text-delight-400' : 'text-delight-600'}`}
                      >
                        قراءة المقال
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Video section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10"
            >
              <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>فيديو توضيحي</h3>
              
              <div className={`rounded-xl overflow-hidden shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="aspect-video relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    شرح خطوات تنظيف محرك السيارة
                  </h4>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    فيديو مفصل يوضح جميع الخطوات المذكورة في المقال
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
