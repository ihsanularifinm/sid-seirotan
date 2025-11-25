'use client';

import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

interface ContactInfoProps {
  settings: any;
  showTitle?: boolean;
  className?: string;
}

const CONTACT_PLACEHOLDERS = {
  address: 'Alamat belum tersedia',
  phone: 'Telepon belum tersedia',
  whatsapp: 'WhatsApp belum tersedia',
  email: 'Email belum tersedia',
};

export default function ContactInfo({ 
  settings, 
  showTitle = true, 
  className = '' 
}: ContactInfoProps) {
  const contactItems = [
    {
      icon: FaMapMarkerAlt,
      value: settings?.general?.contact_address || CONTACT_PLACEHOLDERS.address,
      className: 'flex items-start',
      iconClassName: 'w-5 mr-2 mt-0.5 flex-shrink-0',
    },
    {
      icon: FaPhone,
      value: settings?.general?.contact_phone || CONTACT_PLACEHOLDERS.phone,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-2',
    },
    {
      icon: FaWhatsapp,
      value: settings?.general?.contact_whatsapp || CONTACT_PLACEHOLDERS.whatsapp,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-2',
    },
    {
      icon: FaEnvelope,
      value: settings?.general?.contact_email || CONTACT_PLACEHOLDERS.email,
      className: 'flex items-center',
      iconClassName: 'w-5 mr-2',
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
          return (
            <p key={index} className={item.className}>
              <Icon className={item.iconClassName} />
              <span>{item.value}</span>
            </p>
          );
        })}
      </address>
    </div>
  );
}
