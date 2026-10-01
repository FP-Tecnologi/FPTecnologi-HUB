import { Suspense } from 'react';
import { AceptarInvitacion } from '../../../../src/screens/auth/AceptarInvitacion';

export const metadata = { title: 'Aceptar invitación' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AceptarInvitacion />
    </Suspense>
  );
}
