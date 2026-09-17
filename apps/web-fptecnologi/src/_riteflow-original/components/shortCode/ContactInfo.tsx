import React from 'react';
import Link from 'next/link';
import EmailIcon from '@riteflow/components/icons/EmailIcon';
import PhoneIcon from '@riteflow/components/icons/PhoneIcon';
import AddressIcon from '@riteflow/components/icons/AddressIcon';

export interface ContactInfoProps {
  type: 'email' | 'phone' | 'address';
  value: string;
  href?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ type, value, href = '#' }) => {
  // Icon components mapping
  const icons = {
    email: <EmailIcon />,
    phone: <PhoneIcon />,
    address: <AddressIcon />,
  };

  return (
    <div data-sttr-card>
      <Link href={href} className="font-medium text-offWhite/80 inline-flex items-center gap-2 sm:gap-4 group">
        <div className="w-10 h-10 bg-primary rounded-[10px] flex items-center justify-center">
          {icons[type]}
        </div>
        <span className="flex-1">{value}</span>
      </Link>
    </div>
  );
};

export default ContactInfo;

