import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCartCount } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/utils/cn';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm tracking-wide transition-colors hover:text-gold-deep',
    isActive ? 'text-ink' : 'text-ink-muted'
  );

export function Navbar() {
  const { token, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const cartCount = useCartCount();
  const { data: wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  const canManageProducts = profile?.role === 'admin' || profile?.role === 'sales_person';

  const handleSignOut = () => {
    signOut();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/90 backdrop-blur-md">
      <div className="container-lumos flex h-20 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight text-ink">Lumos</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-gold-deep sm:inline">
            Market
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          {canManageProducts && (
            <NavLink to="/dashboard/products" className={navLinkClass}>
              Add Product
            </NavLink>
          )}
          {profile?.role === 'admin' && (
            <NavLink to="/dashboard/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          {profile?.role === 'sales_person' && (
            <NavLink to="/dashboard/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {token && (
            <Link
              to="/wishlist"
              className="relative hidden text-ink-muted transition-colors hover:text-ink sm:block"
              aria-label="Wishlist"
            >
              <HeartIcon />
              {wishlist.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ember text-[9px] font-medium text-paper">
                  {wishlist.length}
                </span>
              )}
            </Link>
          )}

          <Link to="/cart" className="relative text-ink-muted transition-colors hover:text-ink" aria-label="Cart">
            <BagIcon />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-medium text-ink">
                {cartCount}
              </span>
            )}
          </Link>

          {token ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 font-mono text-xs uppercase text-ink transition-colors hover:border-gold"
              >
                {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-12 w-52 rounded-xl border border-ink/10 bg-paper py-2 shadow-card-hover animate-fade-up"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-ink/8 px-4 py-2">
                    <p className="truncate text-sm text-ink">{profile?.full_name || profile?.email}</p>
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
                      className="block px-4 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink md:hidden"
                      onClick={() => setMenuOpen(false)}
                    >
                      Manage products
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
              <span className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-forest-deep">
                Sign in
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20s-7-4.4-9.5-9C.7 7.2 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.2 19.5 11c-2.5 4.6-7.5 9-7.5 9Z" />
    </svg>
  );
}
