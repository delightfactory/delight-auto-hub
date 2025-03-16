
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Tag, Calendar, Clock, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/ThemeContext';

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
};

const articleData: Article[] = [
  {
    id: '1',
    title: 'كيفية تنظيف محرك السيارة بشكل آمن',
    excerpt: 'خطوات سهلة وأمنة للحفاظ على محرك سيارتك نظيفاً وبحالة ممتازة',
    category: 'العناية بالمحرك',
    date: '10 مايو 2023',
    readTime: '5 دقائق',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
    featured: true
  },
  {
    id: '2',
    title: 'أفضل منتجات تلميع السيارة في 2023',
    excerpt: 'استعراض لأفضل منتجات التلميع والعناية بالسيارات في السوق',
    category: 'العناية الخارجية',
    date: '28 أبريل 2023',
    readTime: '7 دقائق',
    imageUrl: 'https://images.unsplash.com/photo-1553423300-19dbce9c5d3f'
  },
  {
    id: '3',
    title: 'كيفية إزالة الخدوش من طلاء السيارة',
    excerpt: 'نصائح احترافية لإزالة الخدوش وإعادة الطلاء إلى حالته الأصلية',
    category: 'إصلاحات',
    date: '15 أبريل 2023',
    readTime: '6 دقائق',
    imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73'
  },
  {
    id: '4',
    title: 'طرق الحفاظ على مقصورة السيارة نظيفة',
    excerpt: 'خطوات بسيطة للحفاظ على المقصورة الداخلية للسيارة بحالة جيدة',
    category: 'العناية الداخلية',
    date: '3 أبريل 2023',
    readTime: '4 دقائق',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888'
  },
  {
    id: '5',
    title: 'مواسم تغيير إطارات السيارة',
    excerpt: 'متى يجب عليك تغيير إطارات سيارتك وكيفية اختيار النوع المناسب',
    category: 'الإطارات',
    date: '22 مارس 2023',
    readTime: '8 دقائق',
    imageUrl: 'https://images.unsplash.com/photo-1527247111969-5215bcde0422'
  }
];

const ArticlesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  
  // Simulating data fetching with a delay
  useEffect(() => {
    setIsLoading(true);
    // Simulate network request
    const timer = setTimeout(() => {
      setArticles(articleData);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle search
  const filteredArticles = React.useMemo(() => {
    if (!searchTerm.trim()) return articles;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(lowerSearchTerm) || 
      article.excerpt.toLowerCase().includes(lowerSearchTerm) ||
      article.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [articles, searchTerm]);
  
  const featuredArticle = articles.find(article => article.featured);

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://placehold.co/800x400/e2e8f0/1e293b?text=Delight+Car+Articles';
  };

  return (
    <div className={`min-h-screen w-full transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      <PageHeader 
        title="مقالات العناية بالسيارات" 
        subtitle="نصائح وإرشادات احترافية للعناية بسيارتك والحفاظ عليها بحالة ممتازة"
        backgroundImage="https://images.unsplash.com/photo-1550355291-bbee04a92027"
        className="mb-16"
      />
      
      <div className="container-custom pt-8 pb-24">
        {/* Search bar */}
        <div className={`relative mb-12 max-w-xl mx-auto transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-2 rounded-xl`}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="ابحث عن مقالات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pr-10 py-6 rounded-lg border-none transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index} 
                className={`rounded-xl overflow-hidden shadow-md h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="h-48 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-20 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featuredArticle && searchTerm === '' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`mb-16 overflow-hidden rounded-2xl shadow-xl transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="overflow-hidden h-64 md:h-auto relative">
                    <img 
                      src={featuredArticle.imageUrl} 
                      alt={featuredArticle.title} 
                      className="w-full h-full object-cover transform transition hover:scale-105 duration-700"
                      onError={handleImageError}
                    />
                    <div className="absolute top-4 right-4 bg-delight-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      مقال مميز
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center mb-3">
                      <Tag size={16} className={`ml-2 ${theme === 'dark' ? 'text-delight-400' : 'text-delight-600'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{featuredArticle.category}</span>
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {featuredArticle.title}
                    </h2>
                    <p className={`mb-6 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="flex items-center">
                          <Calendar size={16} className="ml-1 text-delight-600" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{featuredArticle.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="ml-1 text-delight-600" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{featuredArticle.readTime}</span>
                        </div>
                      </div>
                      <Button 
                        variant="link" 
                        className={`font-medium transition-colors ${theme === 'dark' ? 'text-delight-400 hover:text-delight-300' : 'text-delight-600 hover:text-delight-700'}`}
                      >
                        قراءة المقال
                        <ChevronRight size={16} className="mr-1 inline" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Articles list */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.filter(article => !article.featured || searchTerm !== '').map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover transform transition hover:scale-105 duration-500"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <Tag size={16} className={`ml-2 ${theme === 'dark' ? 'text-delight-400' : 'text-delight-600'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{article.category}</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {article.title}
                    </h3>
                    <p className={`mb-4 line-clamp-3 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {article.excerpt}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex items-center">
                          <Calendar size={14} className="ml-1 text-delight-600" />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{article.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="ml-1 text-delight-600" />
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{article.readTime}</span>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className={`text-sm font-medium p-0 transition-colors ${theme === 'dark' ? 'text-delight-400 hover:text-delight-300' : 'text-delight-600 hover:text-delight-700'}`}
                      >
                        قراءة المزيد
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredArticles.length === 0 && (
              <div className="text-center py-20">
                <Book size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-medium mb-2">لم يتم العثور على مقالات</h3>
                <p className={`transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  جرب استخدام كلمات بحث مختلفة
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
