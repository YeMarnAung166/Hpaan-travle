export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12 py-6">
      <div className="container-custom text-center text-sm">
        <p>© {new Date().getFullYear()} Hpa-An Travel Guide. All rights reserved.</p>
        <p className="mt-2">Discover the beauty of Hpa-An, Myanmar.</p>
      </div>
    </footer>
  );
}