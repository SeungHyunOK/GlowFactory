"use client";

import { useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface ProfileImageProps {
  user: User | null;
  size?: number;
  className?: string;
}

export default function ProfileImage({ user, size = 32, className = "" }: ProfileImageProps) {
  const [, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");

  // Get the best available image URL
  const getImageUrl = () => {
    if (!user?.user_metadata) return "/images/profile.jpg";

    const metadata = user.user_metadata;

    // Try different possible image URL fields
    const possibleUrls = [
      metadata.avatar_url,
      metadata.picture,
      metadata.photoURL,
      metadata.photo_url,
      metadata.image_url,
      metadata.profile_image_url,
    ].filter(Boolean);

    // If we have a Google profile image, use it
    if (metadata.picture && metadata.picture.includes("googleusercontent.com")) {
      return metadata.picture;
    }

    // If we have any other valid URL, use the first one
    if (possibleUrls.length > 0) {
      return possibleUrls[0];
    }

    return "/images/profile.jpg";
  };

  const imageUrl = getImageUrl();

  const handleImageError = () => {
    setImageError(true);
    setCurrentSrc("/images/profile.jpg");
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <Image
      src={currentSrc || imageUrl}
      alt="User avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={handleImageError}
      onLoad={handleImageLoad}
      unoptimized={imageUrl.includes("googleusercontent.com")}
    />
  );
}
