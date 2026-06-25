import SetPasswordForm from '@/components/SetPasswordForm';

export default function ActivatePage() {
  return (
    <SetPasswordForm
      title="Set password"
      submitLabel="ACTIVATE"
      successMessage="Account activated. Redirecting to login..."
    />
  );
}
