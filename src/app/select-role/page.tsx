import { Suspense } from 'react';
import RoleSelection from '@/components/role/RoleSelection';

export const metadata = {
  title: 'Select Your Role - 100x Marketers',
  description: 'Choose whether you are an employer looking to hire or a candidate looking for opportunities.',
};

export default function SelectRolePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <RoleSelection />
      </Suspense>
    </div>
  );
}