import Link from 'next/link';
import { Search, ShoppingCart, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Group 1: Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            eCommerce Insights
          </span>
        </Link>

        {/* Group 2: Search - Centered and takes available space */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-md lg:max-w-lg">
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 pl-8 w-full rounded-md border shadow-sm"
            />
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Group 3: Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Visit Store
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/40/40?random=user" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>
              <UserCircle className="h-full w-full text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
