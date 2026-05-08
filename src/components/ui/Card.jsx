export default function Card({ children, className = '', hover = true, noPadding = false }) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''} ${className}`}>
      {noPadding ? children : <div className="p-4">{children}</div>}
    </div>
  );
}