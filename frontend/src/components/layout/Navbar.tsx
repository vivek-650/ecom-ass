import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCartCount } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { SearchBar } from './SearchBar';
import { BagIcon, HeartIcon, ChevronDownIcon, GridIcon, PackageIcon, UsersIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';

export function Navbar() {
  const { token, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const cartCount = useCartCount();
  const { data: wishlist } = useWishlist();
  const { data: categories = [] } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);

  const canManageProducts = profile?.role === 'admin' || profile?.role === 'sales_person';

  const handleSignOut = () => {
    signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-card">
      {/* Primary bar: on mobile the search box drops to its own full-width
          row (there's no other way to search on a small screen, so it can't
          just be hidden); from sm: up it's inline between the logo and the
          account/cart icons, single row. */}
      <div className="border-b border-ink/8">
        <div className="container-lumos flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 sm:h-16 sm:flex-nowrap sm:gap-x-6 sm:gap-y-0 sm:py-0">
          <Link to="/" className="order-1 flex shrink-0 items-baseline gap-1.5">
            <span className="font-display text-lg font-extrabold tracking-tight text-ink sm:text-xl">Lumos</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-forest">Market</span>
          </Link>

          <div className="order-3 w-full sm:order-2 sm:w-auto sm:max-w-xl sm:flex-1">
            <SearchBar />
          </div>

          <nav className="order-2 ml-auto flex items-center gap-1 sm:order-3 sm:gap-3">
            {token && (
              <Link
                to="/wishlist"
                className="relative hidden rounded-md p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink sm:block"
                aria-label="Wishlist"
              >
                <HeartIcon />
                {wishlist.length > 0 && (
                  <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ember text-[9px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/cart"
              className="relative rounded-md p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Cart"
            >
              <BagIcon />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-md border border-ink/15 py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-ink hover:border-ink/30"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold uppercase text-white">
                    {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                  </span>
                  <span className="hidden max-w-[100px] truncate sm:inline">{profile?.full_name || 'Account'}</span>
                  <ChevronDownIcon size={14} className="text-ink-muted" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-11 w-56 rounded-md border border-ink/10 bg-white py-2 shadow-card-hover"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="border-b border-ink/8 px-4 py-2">
                      <p className="truncate text-sm font-medium text-ink">{profile?.full_name || profile?.email}</p>
                      <p className="eyebrow">{profile?.role.replace('_', ' ')}</p>
                    </div>
                    <MenuLink to="/orders" icon={PackageIcon} onNavigate={() => setMenuOpen(false)}>
                      Order history
                    </MenuLink>
                    <MenuLink to="/wishlist" icon={HeartIcon} onNavigate={() => setMenuOpen(false)} className="sm:hidden">
                      Wishlist
                    </MenuLink>
                    {canManageProducts && (
                      <MenuLink to="/dashboard/products" icon={GridIcon} onNavigate={() => setMenuOpen(false)}>
                        Manage products
                      </MenuLink>
                    )}
                    {profile?.role === 'admin' && (
                      <MenuLink to="/dashboard/admin" icon={UsersIcon} onNavigate={() => setMenuOpen(false)}>
                        Admin dashboard
                      </MenuLink>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-ember hover:bg-ember/5"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <span className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-deep">
                  Login
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Secondary bar: category quick links with icons */}
      {categories.length > 0 && (
        <div className="border-b border-ink/8 bg-white">
          <div className="container-lumos">
            <div className="scroll-rail py-2">
              <Link
                to="/products"
                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <GridIcon size={15} />
                All products
              </Link>
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink'
                    )}
                  >
                    <Icon size={15} />
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  to,
  icon: Icon,
  onNavigate,
  className,
  children,
}: {
  to: string;
  icon: typeof PackageIcon;
  onNavigate: () => void;
  className?: string;
  children: string;
}) {
  return (
    <Link
      to={to}
      className={cn('flex items-center gap-2.5 px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink', className)}
      onClick={onNavigate}
    >
      <Icon size={15} />
      {children}
    </Link>
  );
}
