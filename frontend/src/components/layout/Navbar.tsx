import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCartCount } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCategories } from '@/hooks/useProducts';
import { cn } from '@/utils/cn';

export function Navbar() {
  const { token, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const cartCount = useCartCount();
  const { data: wishlist } = useWishlist();
  const { data: categories = [] } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const canManageProducts = profile?.role === 'admin' || profile?.role === 'sales_person';

  const handleSignOut = () => {
    signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/products${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-card">
      {/* Primary bar: logo, search, account/cart -- Flipkart-style density */}
      <div className="border-b border-ink/8">
        <div className="container-lumos flex h-16 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-baseline gap-1.5">
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">Lumos</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-forest">Market</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl sm:block">
            <div className="flex items-center rounded-md border border-ink/15 bg-paper-dim px-3 focus-within:border-forest focus-within:bg-white">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, categories…"
                className="h-10 w-full bg-transparent px-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
          </form>

          <nav className="ml-auto flex items-center gap-2 sm:gap-3">
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
                  className="flex items-center gap-2 rounded-md border border-ink/15 py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink hover:border-ink/30"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-xs font-bold uppercase text-ink">
                    {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                  </span>
                  <span className="hidden max-w-[100px] truncate sm:inline">{profile?.full_name || 'Account'}</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-11 w-52 rounded-md border border-ink/10 bg-white py-2 shadow-card-hover"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="border-b border-ink/8 px-4 py-2">
                      <p className="truncate text-sm font-medium text-ink">{profile?.full_name || profile?.email}</p>
                      <p className="eyebrow">{profile?.role.replace('_', ' ')}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink"
                      onClick={() => setMenuOpen(false)}
                    >
                      Order history
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink sm:hidden"
                      onClick={() => setMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    {canManageProducts && (
                      <Link
                        to="/dashboard/products"
                        className="block px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink"
                        onClick={() => setMenuOpen(false)}
                      >
                        Manage products
                      </Link>
                    )}
                    {profile?.role === 'admin' && (
                      <Link
                        to="/dashboard/admin"
                        className="block px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin dashboard
                      </Link>
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
                <span className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-deep">
                  Login
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Secondary bar: category quick links */}
      {categories.length > 0 && (
        <div className="border-b border-ink/8 bg-white">
          <div className="container-lumos">
            <div className="scroll-rail py-2.5">
              <Link
                to="/products"
                className="shrink-0 rounded-md px-3 py-1 text-xs font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                All products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1 text-xs font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink'
                  )}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20s-7-4.4-9.5-9C.7 7.2 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.2 19.5 11c-2.5 4.6-7.5 9-7.5 9Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
