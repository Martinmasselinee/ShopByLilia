import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'lilia@persoshop.com'
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ERROR: ADMIN_PASSWORD environment variable is not set!')
    process.exit(1)
  }

  console.log('Updating admin password for:', adminEmail)
  console.log('Using ADMIN_PASSWORD from environment variables')

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!admin) {
    console.error('ERROR: Admin user not found:', adminEmail)
    process.exit(1)
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Update admin password
  await prisma.user.update({
    where: { email: adminEmail },
    data: { password: hashedPassword }
  })

  console.log('✅ Admin password updated successfully!')
  console.log('The password in the database now matches ADMIN_PASSWORD from environment variables')
}

main()
  .catch((e) => {
    console.error('Error updating admin password:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

