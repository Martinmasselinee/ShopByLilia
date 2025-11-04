import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: 'ADMIN' | 'CLIENT'
    id: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'CLIENT'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'CLIENT'
    id: string
  }
}

