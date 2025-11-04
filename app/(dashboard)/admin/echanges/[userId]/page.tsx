import { EchangeDetail } from '@/components/admin/EchangeDetail'

export default async function EchangeDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Échange</h1>
      <EchangeDetail userId={userId} />
    </div>
  )
}

