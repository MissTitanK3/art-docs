import LoginForm from '../../components/LoginForm';

export const metadata = {
  title: 'Login',
};

export default function Page() {
  return (
    <main className="min-h-screen flex mt-10">
      <LoginForm />
    </main>
  );
}
