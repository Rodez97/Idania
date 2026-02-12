import { getProfile } from "@/features/profile/actions";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const profile = await getProfile();

  // Normalize Prisma JsonValue types to string arrays
  const normalized = profile
    ? {
        displayName: profile.displayName,
        loveLanguages: Array.isArray(profile.loveLanguages)
          ? (profile.loveLanguages as string[])
          : [],
        triggers: Array.isArray(profile.triggers)
          ? (profile.triggers as string[])
          : [],
        calmers: Array.isArray(profile.calmers)
          ? (profile.calmers as string[])
          : [],
        boundaries: Array.isArray(profile.boundaries)
          ? (profile.boundaries as string[])
          : [],
        preferences:
          typeof profile.preferences === "object" && profile.preferences !== null
            ? (profile.preferences as Record<string, unknown>)
            : {},
      }
    : null;

  return <ProfileForm initialProfile={normalized} />;
}
