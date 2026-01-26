import DispatchForm from '@/components/dispatches/DispatchForm';
import DispatchList from '@/components/dispatches/DispatchList';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata = {
  title: 'Dispatches',
};

export default function Page() {
  return (
    <RequireAuth roles={["responder", "admin"]}>
      <main className="max-w-5xl mx-auto p-4 space-y-8">
        <DispatchForm />
        <hr />
        <DispatchList />
      </main>
    </RequireAuth>
  );
}
