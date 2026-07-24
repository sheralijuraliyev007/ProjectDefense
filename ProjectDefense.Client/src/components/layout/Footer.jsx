import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t border-default-200 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-default-500">
        <p>CV Manager</p>
      </div>
    </footer>
  );
}