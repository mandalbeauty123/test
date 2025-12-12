import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Header from "@/components/Header";
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingUp, Camera, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) {
        navigate("/auth");
      }
      setLoading(false);
    });

    // get current session on mount
    supabase.auth.getSession().then(({ data: getSessionData }) => {
      const s = getSessionData?.session ?? null;
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        navigate("/auth");
      }
      setLoading(false);
    });

    // cleanup
    const subscription = data?.subscription ?? undefined;
    return () => subscription?.unsubscribe();
  }, [navigate]);

  // while checking auth, show a simple placeholder (avoid returning null)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // if user still null after auth check, optionally redirect or show message:
  if (!user) {
    // already redirected in effect, but keep a fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          Not signed in — redirecting to sign in...
          <div className="mt-2">
            <Button type="button" onClick={() => navigate("/auth")}>
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 fade-in-up">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("welcome")}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Button
              type="button"
              onClick={() => navigate("/advisory")}
              variant="outline"
              className="h-40 w-full flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary"
            >
              <Leaf className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">{t("advisory")}</span>
            </Button>
          </div>

          <div>
            <Button
              type="button"
              onClick={() => navigate("/market")}
              variant="outline"
              className="h-40 w-full flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 bg-secondary/10 border-secondary/20 hover:bg-secondary/20 text-secondary"
            >
              <TrendingUp className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">{t("market")}</span>
            </Button>
          </div>

          <div>
            <Button
              type="button"
              onClick={() => navigate("/diagnosis")}
              variant="outline"
              className="h-40 w-full flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 bg-accent/10 border-accent/20 hover:bg-accent/20 text-accent"
            >
              <Camera className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">{t("diagnosis")}</span>
            </Button>
          </div>

          {/* GeoOne / Geospatial card — use Link for robust client navigation */}
          <div>
            <Link to="/geospatial" className="block h-40 w-full">
              <Button
                type="button"
                variant="outline"
                className="h-40 w-full flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700"
              >
                <Globe className="w-10 h-10" />
                <span className="text-xl font-semibold text-foreground">
                  {t("geospatial") || "GeoOne – Geospatial AI"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Satellite monitoring · NDVI · Change detection
                </span>
              </Button>
            </Link>
          </div>
        </div>

        <WeatherWidget />
      </main>

      <footer className="bg-card border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6" />
            <p className="text-center text-muted-foreground text-sm">
              © 2025 {t("appName")} by IGNITION IDEATORS — {t("tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
