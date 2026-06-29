import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-card border-t border-border mt-20 pb-20 md:pb-0">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="notranslate text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-4">
              Nidhi Grah Udyog
            </h3>
            <p className="text-muted-foreground text-xs sm:text-base mb-2 sm:mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full spice-backdrop grid place-items-center text-muted-foreground hover:text-primary hover:scale-110 transition-all">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="h-9 w-9 rounded-full spice-backdrop grid place-items-center text-muted-foreground hover:text-primary hover:scale-110 transition-all">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-base">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.contactUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-4">{t('footer.customerService')}</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-base">
              <li>
                <Link to="/my-orders" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.myOrders')}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.returnPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.faqs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-4">{t('footer.contactDetail')}</h4>
            <ul className="space-y-1 sm:space-y-3 text-xs sm:text-base">
              <li className="notranslate hidden sm:flex items-start space-x-3 text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>7, Industrial Area, Runija Road, Barnagar. PIN-456771 <br />
                      Ujjain, MP, India</span>
              </li>
              <li className="notranslate flex items-center space-x-2 sm:space-x-3 text-muted-foreground">
                <Phone className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>+91 93029 22251</span>
              </li>
              <li className="notranslate flex items-center space-x-2 sm:space-x-3 text-muted-foreground">
                <Mail className="h-3 w-3 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>www.nidhigrahudyog.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-4 sm:mt-8 pt-4 sm:pt-8 text-center text-muted-foreground text-xs sm:text-base">
          <p>&copy; 2025 <span className="notranslate">Nidhi Grah Udyog</span>. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

