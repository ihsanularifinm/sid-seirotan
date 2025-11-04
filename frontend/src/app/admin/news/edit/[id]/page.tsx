import EditNewsForm from './EditNewsForm';

// This is a Server Component that renders the Client Component.
// We are moving all logic, including param extraction, to the Client Component.
export default function EditNewsPage() {
  return <EditNewsForm />;
}