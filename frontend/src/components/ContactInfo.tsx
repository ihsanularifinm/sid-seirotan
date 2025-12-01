'use client';

import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

interface ContactInfoProps {
  settings: any;
  showTitle?: boolean;
  className?: string;
}

const CONTACT_PLACEHOLDERS = {
  address: '-',
  phone: '-',
  whatsapp: '-',
  email: '-',
};

export default function ContactInfo({ 
  settings, 
  showTitle = true, 
  className = '' 
}: ContactInfoProps) {
  const phone = settings?.general?.contact_phone;
  const whatsapp = settings?.general?.contact_whatsapp;
  const email = settings?.general?.contact_email;
  const address = settings?.general?.contact_address;

  const contactItems = [
    {
      icon: FaMapMarkerAlt,
      value: address || CONTACT_PLACEHOLDERS.address,
      href: settings?.general?.google_maps_link || null,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-3 flex-shrink-0',
    },
    {
      icon: FaPhone,
      value: phone || CONTACT_PLACEHOLDERS.phone,
      href: phone ? `tel:${phone.replace(/\s/g, '')}` : null,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-3 flex-shrink-0',
    },
    {
      icon: FaWhatsapp,
      value: whatsapp || CONTACT_PLACEHOLDERS.whatsapp,
      href: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-3 flex-shrink-0',
    },
    {
      icon: FaEnvelope,
      value: email || CONTACT_PLACEHOLDERS.email,
      href: email ? `mailto:${email}` : null,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-3 flex-shrink-0',
    },
  ];

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="font-bold text-lg text-white mb-4">Kontak Kami</h3>
      )}
      <address className="text-sm not-italic space-y-3">
        {contactItems.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className={item.iconClassName} />
              <span>{item.value}</span>
            </>
          );

          if (item.href) {
            return (
              <p key={index}>
                <a 
                  href={item.href}
                  className={`${item.className} hover:text-blue-300 transition-colors`}
                  target={item.icon === FaWhatsapp ? '_blank' : undefined}
                  rel={item.icon === FaWhatsapp ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </a>
              </p>
            );
          }

          return (
            <p key={index} className={item.className}>
              {content}
            </p>
          );
        })}
      </address>
    </div>
  );
}
