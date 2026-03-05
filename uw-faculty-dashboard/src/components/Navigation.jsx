export default function Navigation({ sections, active, onChange }) {
  return (
    <nav className="bg-white border-b border-uw-gray-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-1 py-1 -mb-px scrollbar-hide">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => onChange(section.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                active === section.id
                  ? 'border-uw-gold text-uw-black'
                  : 'border-transparent text-uw-gray-600 hover:text-uw-black hover:border-uw-gray-400'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
