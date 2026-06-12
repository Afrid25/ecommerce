type SearchBarProps = {
  defaultValue?: string;
  action?: string;
};

export default function SearchBar({ defaultValue = "", action = "/shop" }: SearchBarProps) {
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="store-search">
        Search products
      </label>
      <input
        id="store-search"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search for products, brands, materials..."
        className="min-h-12 flex-1 rounded-[18px] border border-[var(--border)] bg-white px-5 text-sm outline-none transition focus:border-[var(--primary)] dark:bg-white/5"
      />
      <button type="submit" className="rounded-[18px] bg-[#FF6A00] px-7 py-3 text-sm font-semibold text-white">
        Search
      </button>
    </form>
  );
}
