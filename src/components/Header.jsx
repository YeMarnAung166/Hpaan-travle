import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Hpa-An Travel</Link>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">Itineraries</Link>
          <Link to="/map" className="hover:underline">Map</Link>
          <Link to="/business" className="hover:underline">Directory</Link>
        </nav>
      </div>
    </header>
  );
}