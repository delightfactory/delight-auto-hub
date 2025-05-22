
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, AppearanceSettings, NavLink, HeroSettings, Testimonial, CTASettings, FooterSettings, SocialLink } from "@/types/db";

// خدمات إدارة إعدادات الموقع
export const siteSettingsService = {
  getSiteSettings: async (): Promise<SiteSettings> => {
    try {
      // استخدام supabase.from() بدلاً من select()
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
      
      // إذا لم تكن هناك بيانات، قم بإرجاع إعدادات افتراضية
      if (!data) {
        return {
          siteName: "المتجر الإلكتروني",
          siteDescription: "متجر إلكتروني عربي",
          contactEmail: "info@store.com",
          phoneNumber: "",
          address: "",
          enableRegistration: true,
          enableComments: false,
          theme: {
            primaryColor: "#FF0000",
            secondaryColor: "#0000FF",
            textColor: "#333333",
            backgroundColor: "#FFFFFF"
          }
        };
      }
      
      return data as SiteSettings;
    } catch (error) {
      console.error('Error in getSiteSettings:', error);
      // إرجاع إعدادات افتراضية في حالة الخطأ
      return {
        siteName: "المتجر الإلكتروني",
        siteDescription: "متجر إلكتروني عربي",
        contactEmail: "info@store.com",
        phoneNumber: "",
        address: "",
        enableRegistration: true,
        enableComments: false,
        theme: {
          primaryColor: "#FF0000",
          secondaryColor: "#0000FF",
          textColor: "#333333",
          backgroundColor: "#FFFFFF"
        }
      };
    }
  },
  
  updateSiteSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    try {
      // استخدام المصفوفة في upsert
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([settings])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating site settings:', error);
        throw error;
      }
      
      return data as SiteSettings;
    } catch (error) {
      console.error('Error in updateSiteSettings:', error);
      throw error;
    }
  }
};

// خدمات إدارة إعدادات المظهر
export const appearanceService = {
  getAppearanceSettings: async (): Promise<AppearanceSettings> => {
    try {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching appearance settings:', error);
        throw error;
      }
      
      // إذا لم تكن هناك بيانات، قم بإرجاع إعدادات افتراضية
      if (!data) {
        return {
          theme: {
            primaryColor: "#FF0000",
            secondaryColor: "#0000FF",
            textColor: "#333333",
            backgroundColor: "#FFFFFF"
          },
          layout: "fluid",
          contentWidth: "large",
          darkMode: true,
          responsive: {
            mobile: { enabled: true, collapsibleMenu: true },
            tablet: { enabled: true, sidebarMenu: true },
            desktop: { enabled: true, topMenu: true }
          },
          fonts: {
            heading: "Cairo",
            body: "Tajawal"
          },
          logo: "",
          favicon: "",
          homeSettings: {
            showBanner: false,
            showFeaturedProducts: true,
            showNewProducts: true,
            showTestimonials: false
          }
        };
      }
      
      return data as AppearanceSettings;
    } catch (error) {
      console.error('Error in getAppearanceSettings:', error);
      // إرجاع إعدادات افتراضية في حالة الخطأ
      return {
        theme: {
          primaryColor: "#FF0000",
          secondaryColor: "#0000FF",
          textColor: "#333333",
          backgroundColor: "#FFFFFF"
        },
        layout: "fluid",
        contentWidth: "large",
        darkMode: true,
        responsive: {
          mobile: { enabled: true, collapsibleMenu: true },
          tablet: { enabled: true, sidebarMenu: true },
          desktop: { enabled: true, topMenu: true }
        },
        fonts: {
          heading: "Cairo",
          body: "Tajawal"
        },
        logo: "",
        favicon: "",
        homeSettings: {
          showBanner: false,
          showFeaturedProducts: true,
          showNewProducts: true,
          showTestimonials: false
        }
      };
    }
  },
  
  updateAppearanceSettings: async (settings: Partial<AppearanceSettings>): Promise<AppearanceSettings> => {
    try {
      const { data, error } = await supabase
        .from('appearance_settings')
        .upsert([settings])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating appearance settings:', error);
        throw error;
      }
      
      return data as AppearanceSettings;
    } catch (error) {
      console.error('Error in updateAppearanceSettings:', error);
      throw error;
    }
  }
};

// خدمات إدارة روابط التنقل
export const navLinkService = {
  getAllNavLinks: async (): Promise<NavLink[]> => {
    try {
      const { data, error } = await supabase
        .from('nav_links')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
      }
      
      return data as NavLink[] || [];
    } catch (error) {
      console.error('Error in getAllNavLinks:', error);
      return [];
    }
  },
  
  createNavLink: async (navLink: Omit<NavLink, 'id' | 'created_at' | 'updated_at'>): Promise<NavLink> => {
    try {
      const { data, error } = await supabase
        .from('nav_links')
        .insert([navLink])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating navigation link:', error);
        throw error;
      }
      
      return data as NavLink;
    } catch (error) {
      console.error('Error in createNavLink:', error);
      throw error;
    }
  },
  
  updateNavLink: async (id: string, navLink: Partial<NavLink>): Promise<NavLink> => {
    try {
      const { data, error } = await supabase
        .from('nav_links')
        .update(navLink)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating navigation link:', error);
        throw error;
      }
      
      return data as NavLink;
    } catch (error) {
      console.error('Error in updateNavLink:', error);
      throw error;
    }
  },
  
  deleteNavLink: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('nav_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting navigation link:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteNavLink:', error);
      throw error;
    }
  }
};

// خدمات إدارة إعدادات البطل
export const heroSettingsService = {
  getHeroSettings: async (): Promise<HeroSettings> => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching hero settings:', error);
        throw error;
      }
      
      return data as HeroSettings;
    } catch (error) {
      console.error('Error in getHeroSettings:', error);
      throw error;
    }
  },
  
  updateHeroSettings: async (settings: Partial<HeroSettings>): Promise<HeroSettings> => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .upsert([settings])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating hero settings:', error);
        throw error;
      }
      
      return data as HeroSettings;
    } catch (error) {
      console.error('Error in updateHeroSettings:', error);
      throw error;
    }
  }
};

// خدمات إدارة الشهادات
export const testimonialService = {
  getAllTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }
      
      return data as Testimonial[] || [];
    } catch (error) {
      console.error('Error in getAllTestimonials:', error);
      return [];
    }
  },
  
  getActiveTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching active testimonials:', error);
        throw error;
      }
      
      return data as Testimonial[] || [];
    } catch (error) {
      console.error('Error in getActiveTestimonials:', error);
      return [];
    }
  },
  
  createTestimonial: async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonial])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating testimonial:', error);
        throw error;
      }
      
      return data as Testimonial;
    } catch (error) {
      console.error('Error in createTestimonial:', error);
      throw error;
    }
  },
  
  updateTestimonial: async (id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update(testimonial)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating testimonial:', error);
        throw error;
      }
      
      return data as Testimonial;
    } catch (error) {
      console.error('Error in updateTestimonial:', error);
      throw error;
    }
  },
  
  deleteTestimonial: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting testimonial:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteTestimonial:', error);
      throw error;
    }
  }
};

// خدمات إدارة إعدادات الـ CTA
export const ctaSettingsService = {
  getCTASettings: async (): Promise<CTASettings> => {
    try {
      const { data, error } = await supabase
        .from('cta_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching CTA settings:', error);
        throw error;
      }
      
      return data as CTASettings;
    } catch (error) {
      console.error('Error in getCTASettings:', error);
      throw error;
    }
  },
  
  updateCTASettings: async (settings: Partial<CTASettings>): Promise<CTASettings> => {
    try {
      const { data, error } = await supabase
        .from('cta_settings')
        .upsert([settings])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating CTA settings:', error);
        throw error;
      }
      
      return data as CTASettings;
    } catch (error) {
      console.error('Error in updateCTASettings:', error);
      throw error;
    }
  }
};

// خدمات إدارة إعدادات الفوتر
export const footerSettingsService = {
  getFooterSettings: async (): Promise<FooterSettings> => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching footer settings:', error);
        throw error;
      }
      
      return data as FooterSettings;
    } catch (error) {
      console.error('Error in getFooterSettings:', error);
      throw error;
    }
  },
  
  updateFooterSettings: async (settings: Partial<FooterSettings>): Promise<FooterSettings> => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .upsert([settings])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating footer settings:', error);
        throw error;
      }
      
      return data as FooterSettings;
    } catch (error) {
      console.error('Error in updateFooterSettings:', error);
      throw error;
    }
  }
};

// خدمات إدارة روابط التواصل الاجتماعي
export const socialLinkService = {
  getAllSocialLinks: async (): Promise<SocialLink[]> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching social links:', error);
        throw error;
      }
      
      return data as SocialLink[] || [];
    } catch (error) {
      console.error('Error in getAllSocialLinks:', error);
      return [];
    }
  },
  
  getActiveSocialLinks: async (): Promise<SocialLink[]> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching active social links:', error);
        throw error;
      }
      
      return data as SocialLink[] || [];
    } catch (error) {
      console.error('Error in getActiveSocialLinks:', error);
      return [];
    }
  },
  
  createSocialLink: async (socialLink: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<SocialLink> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert([socialLink])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating social link:', error);
        throw error;
      }
      
      return data as SocialLink;
    } catch (error) {
      console.error('Error in createSocialLink:', error);
      throw error;
    }
  },
  
  updateSocialLink: async (id: string, socialLink: Partial<SocialLink>): Promise<SocialLink> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .update(socialLink)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating social link:', error);
        throw error;
      }
      
      return data as SocialLink;
    } catch (error) {
      console.error('Error in updateSocialLink:', error);
      throw error;
    }
  },
  
  deleteSocialLink: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting social link:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteSocialLink:', error);
      throw error;
    }
  }
};
