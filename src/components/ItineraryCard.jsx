import { Link } from 'react-router-dom';

export default function ItineraryCard({ itinerary }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={itinerary.image} 
        alt={itinerary.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{itinerary.title}</h3>
        <p className="text-gray-600 mb-2">{itinerary.duration}</p>
        <p className="text-gray-500 text-sm mb-4">{itinerary.description}</p>
        <Link 
          to={`/itinerary/${itinerary.id}`}
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}