const StatsCards = ({ posts }) => {
  const published = posts.filter(p => p.published).length;
  const drafts = posts.filter(p => !p.published).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      
      {/* Published */}
      <div className="rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 p-6 text-white shadow-lg hover:scale-[1.02] transition">
        <p className="text-emerald-100">Published Posts</p>
        <h3 className="mt-2 text-4xl font-bold">{published}</h3>
      </div>

      {/* Drafts */}
      <div className="rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg hover:scale-[1.02] transition">
        <p className="text-amber-100">Drafts</p>
        <h3 className="mt-2 text-4xl font-bold">{drafts}</h3>
      </div>

    </div>
  );
};

export default StatsCards;
