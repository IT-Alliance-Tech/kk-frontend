"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  ChefHat,
  Menu,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Navigation() {
  const { profile } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'seller') return '/seller';
    return null;
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ChefHat className="h-8 w-8 text-emerald-600" />
            <span>Kitchen Kettels</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Products
            </Link>
            <Link href="/brands" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Brands
            </Link>
            <Link href="/categories" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Categories
            </Link>
            <Link href="/services" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-slate-700 hover:text-emerald-600 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{profile.full_name}</span>
                        <span className="text-xs text-slate-500">{profile.email}</span>
                        <Badge variant="secondary" className="mt-1 w-fit text-xs">
                          {profile.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getDashboardLink() && (
                      <DropdownMenuItem onClick={() => router.push(getDashboardLink()!)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant="outline" onClick={() => router.push('/login')}>
                  Login
                </Button>
                <Button onClick={() => router.push('/register')}>
                  Register
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link
              href="/products"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/brands"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Brands
            </Link>
            <Link
              href="/categories"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/services"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/about"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-slate-700 hover:text-emerald-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {!profile && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => router.push('/login')} className="flex-1">
                  Login
                </Button>
                <Button onClick={() => router.push('/register')} className="flex-1">
                  Register
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
