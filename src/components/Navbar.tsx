import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { X, ShoppingBag } from "lucide-react";
import CartDropdown from "./CartDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Package } from 'lucide-react';

interface NavbarProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkTheme, toggleTheme }) => {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const navigation = [
    { name: "الرئيسية", href: "/" },
    { name: "المنتجات", href: "/products" },
    { name: "المقالات", href: "/articles" },
    { name: "المصنع", href: "/factory" },
    { name: "المغارة", href: "/cave", icon: <ShoppingBag className="h-4 w-4" /> },
    { name: "تتبع الطلبات", href: "/orders", icon: <Package className="h-4 w-4" /> },
    { name: "تواصل معنا", href: "/contact" },
  ];

  return (
    <nav className="bg-amazon-secondary text-white py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="text-2xl font-extrabold font-amazon">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-amazon-orange" />
            متجر أمازون
          </Link>
        </div>

        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden lg:flex space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="hover:text-amazon-orange transition-colors duration-200 flex items-center gap-1"
            >
              {item?.icon}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Cart and Theme Toggler Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggler */}
          <Button
            onClick={toggleTheme}
            className="bg-amazon-dark hover:bg-amazon-orange text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline touch-target"
          >
            {isDarkTheme ? "إضاءة" : "إظلام"}
          </Button>

          {/* Cart Button (Visible on Mobile) */}
          {isMobile ? (
            <>
              <Button
                onClick={() => setIsOpen(true)}
                className="lg:hidden bg-amazon-dark hover:bg-amazon-orange text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline relative touch-target"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-amazon-warning text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </div>
                )}
              </Button>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="p-0 border-0 bg-transparent">
                  <div className="h-full bg-white dark:bg-gray-900 rounded-l-lg shadow-xl overflow-hidden flex flex-col">
                    <SheetHeader className="p-3 border-b flex items-center justify-between bg-amazon-secondary">
                      <SheetTitle className="flex items-center gap-2 text-white font-amazon">
                        <ShoppingBag className="h-4 w-4 text-amazon-orange" />
                        سلة المشتريات
                      </SheetTitle>
                      <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none touch-target text-white">
                        <X className="h-4 w-4" />
                        <span className="sr-only">إغلاق</span>
                      </SheetClose>
                    </SheetHeader>
                    <div className="flex-grow overflow-auto max-h-[calc(100vh-60px)]">
                      <CartDropdown inFloatingMode={true} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <CartDropdown />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
