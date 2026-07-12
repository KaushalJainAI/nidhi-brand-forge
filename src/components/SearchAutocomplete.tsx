import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { searchAPI, Suggestion } from "@/lib/api/search";
import { matchPages } from "@/lib/searchablePages";
import { LANG_STORAGE_KEY } from "@/i18n/index";
import { useTranslation } from "react-i18next";

interface SearchAutocompleteProps {
  inputClassName?: string;
  placeholder?: string;
}

const SearchAutocomplete = ({
  inputClassName = "",
  placeholder,
}: SearchAutocompleteProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const lang = localStorage.getItem(LANG_STORAGE_KEY) ?? "en";
  const { data } = useQuery({
    queryKey: ["suggest", lang, debouncedQuery],
    queryFn: () => searchAPI.suggest(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  const suggestions: Suggestion[] =
    debouncedQuery.length >= 2 ? data?.suggestions ?? [] : [];

  // Client-side matches for navigable pages (cart, policies, orders, …) so the
  // search box also acts as a "go to page" jump list, not just product search.
  const pageMatches =
    debouncedQuery.length >= 2 ? matchPages(debouncedQuery) : [];

  // Close the dropdown on navigation. On the search results page keep the box
  // populated with the active query (so it's visible / editable); everywhere
  // else reset it after navigating to a result.
  useEffect(() => {
    setOpen(false);
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      setQuery(params.get("q") ?? params.get("search") ?? "");
    } else {
      setQuery("");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToSearchPage = () => {
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const goToSuggestion = (s: Suggestion) => {
    navigate(s.type === "combo" ? `/combos/${s.slug}` : `/products/${s.slug}`);
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <Command
        shouldFilter={false}
        className="overflow-visible bg-transparent"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            (e.target as HTMLElement).blur();
          }
        }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4 z-10" />
          <CommandPrimitive.Input
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              // cmdk handles arrows + Enter on highlighted items; plain Enter
              // with nothing highlighted falls through to the search page.
              if (e.key === "Enter" && !showDropdown) {
                e.preventDefault();
                goToSearchPage();
              }
            }}
            placeholder={placeholder ?? t('nav.search')}
            className={cn(
              "flex h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 py-1 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary hover:border-primary/50",
              inputClassName,
            )}
          />
        </div>
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden">
            <CommandList>
              {pageMatches.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('search.pages')}
                  </div>
                  {pageMatches.map((p) => (
                    <CommandItem
                      key={`page-${p.path}`}
                      value={`page-${p.path}`}
                      onSelect={() => navigate(p.path)}
                      className="cursor-pointer gap-3 px-3 py-2"
                    >
                      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <p.icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-1 flex-col truncate notranslate">
                        <span className="truncate">{p.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {p.description}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                  {suggestions.length > 0 && (
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground border-t border-border">
                      {t('search.products')}
                    </div>
                  )}
                </>
              )}
              {suggestions.map((s) => (
                <CommandItem
                  key={`${s.type}-${s.id}`}
                  value={`${s.type}-${s.id}`}
                  onSelect={() => goToSuggestion(s)}
                  className="cursor-pointer gap-3 px-3 py-2"
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt=""
                      className="h-9 w-9 rounded-full spice-backdrop object-contain p-0.5 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full spice-backdrop flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate notranslate">{s.name}</span>
                  <span className="text-sm font-semibold text-primary notranslate">
                    ₹{s.price}
                  </span>
                </CommandItem>
              ))}
              <CommandItem
                key="search-all"
                value="search-all"
                onSelect={goToSearchPage}
                className="cursor-pointer gap-2 px-3 py-2 border-t border-border text-muted-foreground"
              >
                <Search className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('search.searchFor', { query: query.trim() })}</span>
              </CommandItem>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
};

export default SearchAutocomplete;
