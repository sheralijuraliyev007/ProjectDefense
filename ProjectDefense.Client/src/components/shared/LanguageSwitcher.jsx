import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly variant="light" aria-label="Change language">
          <LanguageIcon className="w-5 h-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        selectedKeys={[i18n.language]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0];
          i18n.changeLanguage(selected);
        }}
      >
        {languages.map((lang) => (
          <DropdownItem key={lang.code}>
            {lang.flag} {lang.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}