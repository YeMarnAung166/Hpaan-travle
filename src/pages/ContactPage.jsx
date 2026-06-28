import ContentPage from '../components/ContentPage';
import { Helmet } from 'react-helmet-async';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Hpa-An Travel</title>
        <meta name="description" content="Get in touch with the Hpa-An Travel team." />
        <meta property="og:title" content="Contact Us" />
        <meta property="og:description" content="Get in touch with the Hpa-An Travel team." />
        <meta property="og:type" content="website" />
      </Helmet>
      <ContentPage slug="contact" defaultTitle="Contact Us" />
    </>
  );
}
