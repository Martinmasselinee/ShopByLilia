import { ClientsTable } from '@/components/admin/ClientsTable'

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Clients</h1>
      <ClientsTable />
    </div>
  )
}

