import ContentPage from '../components/ContentPage';
import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Hpa-An Travel</title>
        <meta name="description" content="Terms and conditions for using Hpa-An Travel." />
        <meta property="og:title" content="Terms of Service" />
        <meta property="og:description" content="Terms and conditions for using Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <ContentPage slug="terms" defaultTitle="Terms of Service" />
    </>
  );
}
