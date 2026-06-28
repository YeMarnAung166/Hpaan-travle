import ContentPage from '../components/ContentPage';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Hpa-An Travel</title>
        <meta name="description" content="How we handle your data and privacy on Hpa-An Travel." />
        <meta property="og:title" content="Privacy Policy" />
        <meta property="og:description" content="How we handle your data and privacy on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <ContentPage slug="privacy" defaultTitle="Privacy Policy" />
    </>
  );
}
