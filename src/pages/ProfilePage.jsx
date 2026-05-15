import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useProfileContext } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import AvatarUpload from '../components/AvatarUpload';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const user = useUser();
  const { t } = useLanguage();
  const { profile, loading, updateProfile, refresh } = useProfileContext();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    const fetchPhotoCount = async () => {
      if (!user) return;
      const { count, error } = await supabase
        .from('user_photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (!error) setPhotoCount(count || 0);
    };
    fetchPhotoCount();
  }, [user]);

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
  };

  const handleAvatarUpload = async (url) => {
    const success = await updateProfile({ avatar_url: url });
    if (success) refresh();
  };

  return (
    <div className="container-custom max-w-5xl">
      <h1 className="page-title">{t('profile.title') || 'My Profile'}</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar with avatar */}
          <div className="md:w-64 bg-neutral-light p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-neutral-mid">
            <AvatarUpload avatarUrl={profile?.avatar_url} onUpload={handleAvatarUpload} />
            <div className="mt-4 text-center">
              <p className="text-text-soft text-sm">
                {t('profile.member_since') || 'Member since'}{' '}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <div className="mt-3 pt-3 border-t border-neutral-mid">
                <Link
                  to={`/user-photos/${user.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  {t('profile.view_my_photos')} ({photoCount})
                </Link>
              </div>
            </div>
          </div>

          {/* Main form */}
          <div className="flex-1 p-6">
            <Input
              label={t('profile.display_name') || 'Display Name'}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be seen"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">
                {t('profile.bio') || 'Bio'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                className="w-full border border-neutral-mid rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50"
                placeholder="Tell others about yourself"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Changes'}
              </Button>
            </div>
            {message && <p className="text-success text-sm mt-2">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}