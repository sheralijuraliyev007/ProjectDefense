import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Input,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { MagnifyingGlassIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../shared/LanguageSwitcher';

export default function Header() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { label: t('nav.home'), href: '/', public: true },
    { label: t('nav.positions'), href: '/positions', public: true },
    ...(isAuthenticated ? [
      ...(hasRole(['Candidate']) ? [
        { label: t('nav.profile'), href: '/profile' },
        { label: t('nav.myCvs'), href: '/profile/cvs' },
      ] : []),
      ...(hasRole(['Recruiter', 'Administrator']) ? [
        { label: t('nav.positions'), href: '/recruiter/positions' },
        { label: t('nav.attributes'), href: '/recruiter/attributes' },
      ] : []),
      ...(hasRole(['Administrator']) ? [
        { label: t('nav.users'), href: '/admin/users' },
      ] : []),
    ] : []),
  ];

  return (
    <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand>
          <Link to="/" className="font-bold text-xl text-primary">
            CV Manager
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.filter(item => item.public || isAuthenticated).map((item) => (
          <NavbarItem key={item.href}>
            <Link to={item.href} className="text-foreground hover:text-primary transition-colors">
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <Input
          className="w-64 hidden md:block"
          placeholder={t('search.placeholder')}
          startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        
        <Button isIconOnly variant="light" onPress={toggleTheme}>
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </Button>
        
        <LanguageSwitcher />
        
        {isAuthenticated ? (
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                src={user?.photoUrl}
                name={`${user?.firstName} ${user?.lastName}`}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="profile" onPress={() => navigate('/profile')}>
                {t('user.profile')}
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={() => {
                  logout();
                  navigate('/');
                }}>
                  {t('user.logout')}
              </DropdownItem>

            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button color="primary" onPress={() => navigate('/login')}>
            {t('auth.login')}
          </Button>
        )}
      </NavbarContent>

      <NavbarMenu>
        {navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link to={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}