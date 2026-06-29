import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesAPI, type Category } from "@/lib/api/categories";
import CachedImage from "@/components/CachedImage";
import { useTranslation } from "react-i18next";

interface CategoryCapsulesProps {
  /** When provided, marks the matching capsule active (used on the Products page). */
  activeCategory?: string;
  /**
   * Optional click override. When omitted the capsule navigates to
   * /products?category=<id>. The "all" capsule passes "all".
   */
  onSelect?: (categoryId: string) => void;
}

/**
 * Swiggy-style horizontal row of circular category capsules.
 * Self-contained: fetches its own categories and degrades gracefully
 * (renders nothing) if the request fails or returns empty.
 */
const CategoryCapsules = ({ activeCategory, onSelect }: CategoryCapsulesProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((data) => setCategories(data.results || []))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  if (categories.length === 0) return null;

  const handleClick = (id: string) => {
    if (onSelect) onSelect(id);
    else if (id === "all") navigate("/products");
    else navigate(`/products?category=${id}`);
  };

  const Capsule = ({
    id,
    name,
    image,
    isActive,
  }: {
    id: string;
    name: string;
    image?: string;
    isActive: boolean;
  }) => (
    <button
      onClick={() => handleClick(id)}
      className="group shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 w-16 sm:w-20 active-press"
    >
      <span
        className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full spice-backdrop border grid place-items-center overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${
          isActive ? "border-primary border-2" : "border-border"
        }`}
      >
        {image ? (
          <CachedImage src={image} alt={name} className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
        ) : (
          <span className="text-lg sm:text-2xl font-bold text-primary notranslate">
            {name.charAt(0)}
          </span>
        )}
      </span>
      <span
        className={`text-[10px] sm:text-xs font-medium text-center leading-tight line-clamp-2 ${
          isActive ? "text-primary font-semibold" : "text-foreground"
        }`}
      >
        {name}
      </span>
    </button>
  );

  return (
    <div className="flex gap-4 sm:gap-7 overflow-x-auto no-scrollbar py-1">
      <Capsule
        id="all"
        name={t('category.allSpices')}
        isActive={activeCategory === "all" || activeCategory === undefined}
      />
      {categories.map((c) => (
        <Capsule
          key={c.id}
          id={String(c.id)}
          name={c.name}
          image={c.image}
          isActive={activeCategory === String(c.id)}
        />
      ))}
    </div>
  );
};

export default CategoryCapsules;
