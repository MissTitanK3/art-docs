export const metadata = {
  title: 'Create Account',
};

import RegisterForm from '../../components/RegisterForm';

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <RegisterForm />
    </main>
  );
}
