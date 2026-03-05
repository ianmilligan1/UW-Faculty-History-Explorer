export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-uw-gray-200 p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-uw-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-uw-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
