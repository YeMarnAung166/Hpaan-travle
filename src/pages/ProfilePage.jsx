import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProfileContext } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import AvatarUpload from '../components/AvatarUpload';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const user = useUser();
  const { t } = useLanguage();
  const { profile, loading, updateProfile, refresh } = useProfileContext();

  // Local state for form fields – initialised from profile when it loads
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Populate local state only when profile loads (and not on every render)
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]); // Only runs when profile object changes (stable now)

  if (!user) {
    return (
      <div className="container-custom text-center py-12">
        <h2 className="text-2xl font-bold">Please log in to view your profile</h2>
      </div>
    );
  }

  if (loading) return <div className="spinner mx-auto my-12"></div>;

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({ display_name: displayName, bio });
    setMessage(success ? 'Profile updated!' : 'Update failed');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
    if (success) refresh(); // refresh context to ensure consistency (optional)
  };

  const handleAvatarUpload = async (url) => {
    const success = await updateProfile({ avatar_url: url });
    if (success) refresh();
  };

  return (
    <div className="container-custom max-w-2xl">
      <h1 className="page-title">{t('profile.title') || 'My Profile'}</h1>
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <AvatarUpload avatarUrl={profile?.avatar_url} onUpload={handleAvatarUpload} />
        <Input
          label={t('profile.display_name') || 'Display Name'}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want to be seen"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-text mb-1">{t('profile.bio') || 'Bio'}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            className="w-full border border-neutral-mid rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50"
            placeholder="Tell others about yourself"
          />
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Changes'}
        </Button>
        {message && <p className="text-success text-sm">{message}</p>}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-serif font-semibold mb-4">{t('profile.my_photos') || 'My Photos'}</h2>
        <Link to={`/user-photos/${user.id}`} className="btn btn-secondary">
          {t('profile.view_my_photos') || 'View all my photos'}
        </Link>
      </div>
    </div>
  );
}