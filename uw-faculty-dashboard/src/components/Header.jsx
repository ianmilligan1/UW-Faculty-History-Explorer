export default function Header() {
  return (
    <header className="bg-uw-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          <span className="text-uw-gold">The University of Waterloo</span>
          <span className="text-white">, 1963–1978</span>
        </h1>
        <p className="text-lg sm:text-xl text-white mt-1 font-light">
          An Interactive History
        </p>
        <p className="text-uw-gray-500 mt-3 max-w-2xl text-sm sm:text-base">
          Exploring the growth and evolution of faculty at the University of Waterloo
          through data drawn from official university calendars.
        </p>
      </div>
    </header>
  );
}
