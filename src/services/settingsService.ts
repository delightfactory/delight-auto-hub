
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, AppearanceSettings } from "@/types/db";

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
