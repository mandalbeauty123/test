import { Button } from "@/components/ui/button";
import { Sprout, Leaf, TrendingUp, Camera, CloudSun, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Theme Toggle */}
      <div className="container mx-auto px-4 pt-4 flex justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full transition-all duration-300 hover:ring-2 hover:ring-primary/50"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 pb-8 fade-in-up">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <Sprout className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            {t('appName')}
          </h1>
          <p className="text-2xl md:text-3xl text-primary font-semibold mb-6">
            {t('tagline')}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('welcome')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="text-lg px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              onClick={() => navigate('/auth')}
            >
              {t('getStarted')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('learnMore')}
            </Button>
          </div>
        </div>

        <div id="features" className="mt-40 pt-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t('features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {t('aiAdvisory')}
              </h3>
              <p className="text-muted-foreground">
                {t('aiAdvisoryDesc')}
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {t('marketLinkage')}
              </h3>
              <p className="text-muted-foreground">
                {t('marketLinkageDesc')}
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {t('cropDiagnosis')}
              </h3>
              <p className="text-muted-foreground">
                {t('cropDiagnosisDesc')}
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CloudSun className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {t('weatherInfo')}
              </h3>
              <p className="text-muted-foreground">
                {t('weatherInfoDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="font-semibold text-primary mb-2">
                IGNITION IDEATORS
              </p>
              <p className="text-foreground font-medium">
                Beauty Mandal, Nitara Rani, Priyanshi Kumari, Sweta Kumari
              </p>
            </div>
            <p className="text-center text-muted-foreground text-sm mt-4">
              © {new Date().getFullYear()} {t('appName')} - Ramgarh Engineering College
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;