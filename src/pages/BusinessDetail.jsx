import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setBusiness(data);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Business not found</h2>
        <Link to="/business" className="text-green-600 underline">Back to directory</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/business" className="text-green-600 hover:underline">← Back to directory</Link>
      <img src={business.image} alt={business.name} className="w-full h-64 object-cover rounded-lg my-4" />
      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
      <p className="text-gray-600 mb-2">{business.address}</p>
      <p className="text-gray-700 mb-4">{business.description}</p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold">Contact</h3>
        <p>Phone: <a href={`tel:${business.phone}`} className="text-green-600">{business.phone}</a></p>
        <a
          href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Contact via WhatsApp
        </a>
      </div>
    </div>
  );
}