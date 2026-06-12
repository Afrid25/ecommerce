type ResponsiveSearchBarProps = {
  placeholder?: string;
  action?: string;
};

export default function ResponsiveSearchBar({
  placeholder = "Search phones, fashion, groceries, beauty, sports...",
  action = "/shop",
}: ResponsiveSearchBarProps) {
  return (
    <form action={action} className="w-full">
      <label htmlFor="home-marketplace-search" className="sr-only">
        Search marketplace products
      </label>
      <div className="flex flex-col gap-2 rounded-[18px] bg-white p-2 shadow-[0_18px_48px_rgba(0,0,0,0.22)] sm:flex-row">
        <input
          id="home-marketplace-search"
          name="search"
          placeholder={placeholder}
          className="min-h-12 min-w-0 flex-1 rounded-[14px] border border-transparent px-4 text-sm text-[#172018] outline-none focus:border-[#FF6A00]"
        />
        <button
          type="submit"
          className="min-h-12 rounded-[14px] bg-[#FF6A00] px-6 text-sm font-semibold text-white transition hover:bg-[#e65f00]"
        >
          Search
        </button>
      </div>
    </form>
  );
}
