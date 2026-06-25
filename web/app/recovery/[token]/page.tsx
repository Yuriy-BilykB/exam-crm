import SetPasswordForm from '@/components/SetPasswordForm';

export default function RecoveryPage() {
  return (
    <SetPasswordForm
      title="New password"
      submitLabel="UPDATE PASSWORD"
      successMessage="Password updated. Redirecting to login..."
    />
  );
}
