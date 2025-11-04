import { EchangeDetail } from '@/components/admin/EchangeDetail'

export default function EchangeDetailPage({
  params,
}: {
  params: { userId: string }
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Échange</h1>
      <EchangeDetail userId={params.userId} />
    </div>
  )
}

