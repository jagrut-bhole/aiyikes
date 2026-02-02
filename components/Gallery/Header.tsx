"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Settings, User, LogOut, User2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';


export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Generate', path: '/generate' },
    { name: 'Your Remixes', path: '/ur-remixes' }
  ];

  const isActive = (path: string) => pathname === path;

  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-15">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div onClick={() => router.push('/')} className="text-2xl font-bold text-white tracking-wider cursor-pointer">
            AIYIKES
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${isActive(link.path)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {link.name}
              </div>
            ))}
          </nav>

          {/* Right side: Avatar dropdown + Mobile menu */}
          <div className="flex items-center gap-10">
            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name || "User"} />
                    ) : (
                      <AvatarFallback className="bg-neutral-800">
                        <User2 className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-gray-800">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-gray-200 focus:bg-gray-800 focus:text-white cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="text-gray-200 focus:bg-gray-800 focus:text-white cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <div
                  key={link.path}
                  onClick={() => {
                    router.push(link.path);
                    setIsMenuOpen(false);
                  }}
                  className={`text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive(link.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.name}
                </div>
              ))}{" "}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};