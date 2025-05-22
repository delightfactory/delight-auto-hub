
import { supabase } from "@/integrations/supabase/client";
import { 
  NavLink, 
  HeroSettings, 
  Testimonial, 
  CTASettings,
  FooterSettings,
  SocialLink
} from "@/types/db";

// Navigation links service
export const navLinksService = {
  getNavLinks: async (): Promise<NavLink[]> => {
    try {
      const { data, error } = await supabase
        .from('nav_links')
        .select('*')
        .order('order_position', { ascending: true })
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching navigation links:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getNavLinks:', error);
      return [];
    }
  },
  
  updateNavLink: async (navLink: Partial<NavLink> & { id: string }): Promise<NavLink | null> => {
    try {
      const { data, error } = await supabase
        .from('nav_links')
        .update(navLink)
        .eq('id', navLink.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating navigation link:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateNavLink:', error);
      return null;
    }
  },
  
  createNavLink: async (navLink: Omit<NavLink, 'id' | 'created_at' | 'updated_at'>): Promise<NavLink | null> => {
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
      
      return data;
    } catch (error) {
      console.error('Error in createNavLink:', error);
      return null;
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
      return false;
    }
  }
};

// Hero settings service
export const heroSettingsService = {
  getHeroSettings: async (): Promise<HeroSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching hero settings:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getHeroSettings:', error);
      return null;
    }
  },
  
  updateHeroSettings: async (settings: Partial<HeroSettings>): Promise<HeroSettings | null> => {
    try {
      // Get first record id if not provided
      if (!settings.id) {
        const { data: existingData } = await supabase
          .from('hero_settings')
          .select('id')
          .limit(1)
          .maybeSingle();
          
        if (existingData) {
          settings.id = existingData.id;
        }
      }
      
      if (settings.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('hero_settings')
          .update(settings)
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating hero settings:', error);
          throw error;
        }
        
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('hero_settings')
          .insert([settings])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating hero settings:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error in updateHeroSettings:', error);
      return null;
    }
  }
};

// Testimonials service
export const testimonialsService = {
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order_position', { ascending: true })
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTestimonials:', error);
      return [];
    }
  },
  
  updateTestimonial: async (testimonial: Partial<Testimonial> & { id: string }): Promise<Testimonial | null> => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update(testimonial)
        .eq('id', testimonial.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating testimonial:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateTestimonial:', error);
      return null;
    }
  },
  
  createTestimonial: async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial | null> => {
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
      
      return data;
    } catch (error) {
      console.error('Error in createTestimonial:', error);
      return null;
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
      return false;
    }
  }
};

// CTA settings service
export const ctaSettingsService = {
  getCTASettings: async (): Promise<CTASettings | null> => {
    try {
      const { data, error } = await supabase
        .from('cta_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching CTA settings:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getCTASettings:', error);
      return null;
    }
  },
  
  updateCTASettings: async (settings: Partial<CTASettings>): Promise<CTASettings | null> => {
    try {
      // Get first record id if not provided
      if (!settings.id) {
        const { data: existingData } = await supabase
          .from('cta_settings')
          .select('id')
          .limit(1)
          .maybeSingle();
          
        if (existingData) {
          settings.id = existingData.id;
        }
      }
      
      if (settings.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('cta_settings')
          .update(settings)
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating CTA settings:', error);
          throw error;
        }
        
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('cta_settings')
          .insert([settings])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating CTA settings:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error in updateCTASettings:', error);
      return null;
    }
  }
};

// Footer settings service
export const footerSettingsService = {
  getFooterSettings: async (): Promise<FooterSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching footer settings:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getFooterSettings:', error);
      return null;
    }
  },
  
  updateFooterSettings: async (settings: Partial<FooterSettings>): Promise<FooterSettings | null> => {
    try {
      // Get first record id if not provided
      if (!settings.id) {
        const { data: existingData } = await supabase
          .from('footer_settings')
          .select('id')
          .limit(1)
          .maybeSingle();
          
        if (existingData) {
          settings.id = existingData.id;
        }
      }
      
      if (settings.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('footer_settings')
          .update(settings)
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating footer settings:', error);
          throw error;
        }
        
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('footer_settings')
          .insert([settings])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating footer settings:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error in updateFooterSettings:', error);
      return null;
    }
  }
};

// Social links service
export const socialLinksService = {
  getSocialLinks: async (): Promise<SocialLink[]> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('order_position', { ascending: true })
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching social links:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getSocialLinks:', error);
      return [];
    }
  },
  
  updateSocialLink: async (socialLink: Partial<SocialLink> & { id: string }): Promise<SocialLink | null> => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .update(socialLink)
        .eq('id', socialLink.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating social link:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateSocialLink:', error);
      return null;
    }
  },
  
  createSocialLink: async (socialLink: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<SocialLink | null> => {
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
      
      return data;
    } catch (error) {
      console.error('Error in createSocialLink:', error);
      return null;
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
      return false;
    }
  }
};
