import { Languages, Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Language } from '@/translations';

const languageNames = {
  en: 'English',
  te: 'తెలుగు (Telugu)',
  hi: 'हिंदी (Hindi)',
};

export const LanguageThemeSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-card/50 backdrop-blur-sm border-white/20 hover:bg-card/70"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">{languageNames[language]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/20">
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`cursor-pointer ${language === lang ? 'bg-primary/20' : ''}`}
            >
              {languageNames[lang]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-card/50 backdrop-blur-sm border-white/20 hover:bg-card/70"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/20">
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={`cursor-pointer ${theme === 'dark' ? 'bg-primary/20' : ''}`}
          >
            <Moon className="w-4 h-4 mr-2" />
            {t('darkMode')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={`cursor-pointer ${theme === 'light' ? 'bg-primary/20' : ''}`}
          >
            <Sun className="w-4 h-4 mr-2" />
            {t('lightMode')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
