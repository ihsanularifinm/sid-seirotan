'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';

interface SocialMediaLinksProps {
  settings: any;
  showTitle?: boolean;
  className?: string;
  iconSize?: string;
}

const SOCIAL_MEDIA_DEFAULTS = {
  facebook: 'https://www.facebook.com',
  instagram: 'https://www.instagram.com',
  twitter: 'https://x.com',
  youtube: 'https://www.youtube.com',
  tiktok: 'https://www.tiktok.com',
};

export default function SocialMediaLinks({ 
  settings, 
  showTitle = true, 
  className = '', 
  iconSize = 'text-xl' 
}: SocialMediaLinksProps) {
  const socialLinks = [
    {
      name: 'Facebook',
      url: settings?.social?.facebook_url || SOCIAL_MEDIA_DEFAULTS.facebook,
      icon: FaFacebook,
      hoverColor: 'hover:text-blue-400',
    },
    {
      name: 'Instagram',
      url: settings?.social?.instagram_url || SOCIAL_MEDIA_DEFAULTS.instagram,
      icon: FaInstagram,
      hoverColor: 'hover:text-pink-400',
    },
    {
      name: 'Twitter/X',
      url: settings?.social?.twitter_url || SOCIAL_MEDIA_DEFAULTS.twitter,
      icon: FaXTwitter,
      hoverColor: 'hover:text-blue-300',
    },
    {
      name: 'YouTube',
      url: settings?.social?.youtube_url || SOCIAL_MEDIA_DEFAULTS.youtube,
      icon: FaYoutube,
      hoverColor: 'hover:text-red-500',
    },
    {
      name: 'TikTok',
      url: settings?.social?.tiktok_url || SOCIAL_MEDIA_DEFAULTS.tiktok,
      icon: FaTiktok,
      hoverColor: 'hover:text-white',
    },
  ];

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="font-bold text-lg text-white mb-4">Media Sosial</h3>
      )}
      <div className="flex space-x-4">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.name}
              href={social.url}
              className={`${iconSize} ${social.hoverColor} transition-colors`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
            >
              <Icon />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
