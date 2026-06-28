import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../context/UserContext";
import { useProfileContext } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import AvatarUpload from "../components/AvatarUpload";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StarRating from "../components/StarRating";
import { Helmet } from 'react-helmet-async';

export default function MyAccountPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    refresh,
  } = useProfileContext();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ reviews: 0, photos: 0, favorites: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchStatsAndActivity = async () => {
      // Count reviews
      const { count: bizCount } = await supabase
        .from("business_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const { count: destCount } = await supabase
        .from("destination_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const totalReviews = (bizCount || 0) + (destCount || 0);

      // Count photos
      const { count: photosCount } = await supabase
        .from("user_photos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Count favorites
      const { count: favCount } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Recent reviews (latest 3)
      const { data: bizReviews } = await supabase
        .from("business_reviews")
        .select("*, businesses(name, name_my)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      const { data: destReviews } = await supabase
        .from("destination_reviews")
        .select("*, destinations(name, name_my)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      const allReviews = [...(bizReviews || []), ...(destReviews || [])];
      allReviews.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setRecentReviews(allReviews.slice(0, 3));

      // Recent photos
      const { data: photos } = await supabase
        .from("user_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentPhotos(photos || []);

      setStats({
        reviews: totalReviews,
        photos: photosCount || 0,
        favorites: favCount || 0,
      });
      setLoadingStats(false);
    };
    fetchStatsAndActivity();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const success = await updateProfile({ display_name: displayName, bio });
    setSaving(false);
    if (success) {
      toast({ type: 'success', message: 'Profile updated!' });
      refresh();
    } else {
      toast({ type: 'error', message: 'Update failed' });
    }
  };

  const handleAvatarUpload = async (url) => {
    const success = await updateProfile({ avatar_url: url });
    if (success) refresh();
  };

  if (!user) {
    return (
      <div className="container-custom text-center py-12">
        <h2 className="text-2xl font-bold">
          Please log in to view your account
        </h2>
      </div>
    );
  }

  if (profileLoading || loadingStats)
    return <div className="spinner mx-auto my-12"></div>;

  const name = profile?.display_name || user.email.split("@")[0];
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="container-custom max-w-5xl">
      <Helmet>
        <title>My Account | Hpa-An Travel</title>
        <meta name="description" content="Manage your profile, reviews, and photos on Hpa-An Travel." />
        <meta property="og:title" content="My Account" />
        <meta property="og:description" content="Manage your profile, reviews, and photos on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">My Account</h1>

      {/* Profile section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <AvatarUpload avatarUrl={avatarUrl} onUpload={handleAvatarUpload} />
            <p className="text-text-soft text-sm mt-2">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex-1">
            <Input
              label={t("profile.display_name") || "Display Name"}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be seen"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">
                {t("profile.bio") || "Bio"}
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
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-row justify-center gap-4 mb-8 flex-wrap sm:flex-nowrap">
        <div className="bg-primary/10 rounded-xl p-3 text-center w-28 sm:w-auto flex-1">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.reviews}
          </div>
          <div className="text-xs sm:text-sm text-text-soft">Reviews</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center w-28 sm:w-auto flex-1">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.photos}
          </div>
          <div className="text-xs sm:text-sm text-text-soft">Photos</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center w-28 sm:w-auto flex-1">
          <div className="text-2xl sm:text-3xl font-bold text-primary">
            {stats.favorites}
          </div>
          <div className="text-xs sm:text-sm text-text-soft">Favorites</div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Reviews</h2>
          <Link
            to="/user-reviews"
            className="text-primary text-sm hover:underline"
          >
            View all
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <p className="text-text-soft">You haven't written any reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const target = review.businesses || review.destinations;
              const targetName = target?.name || target?.name_my || "Item";
              const targetLink = review.businesses
                ? `/business/${review.business_id}`
                : `/destination/${review.destination_id}`;
              return (
                <div
                  key={review.id}
                  className="bg-neutral-light p-4 rounded-lg"
                >
                  <div className="flex justify-between flex-wrap gap-2">
                    <Link
                      to={targetLink}
                      className="font-semibold text-primary hover:underline"
                    >
                      {targetName}
                    </Link>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && (
                    <p className="text-text-soft text-sm mt-1 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-text-soft mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Photos */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Photos</h2>
          <Link
            to={`/user-photos/${user.id}`}
            className="text-primary text-sm hover:underline"
          >
            View all
          </Link>
        </div>
        {recentPhotos.length === 0 ? (
          <p className="text-text-soft">You haven't uploaded any photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentPhotos.map((photo) => (
              <Link
                key={photo.id}
                to={`/user-photos/${user.id}`}
                className="block"
              >
                <img
                  src={photo.image_url}
                  alt="User photo"
                  className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
