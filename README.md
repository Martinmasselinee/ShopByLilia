# PersoShop - Personal Shopper Platform

Plateforme premium de personal shopper développée avec Next.js 14+, TypeScript, et Tailwind CSS.

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte Vercel (gratuit)
- Compte Supabase (base de données PostgreSQL)
- Compte Cloudinary (stockage d'images)

### Étapes de déploiement

1. **Préparer le repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <votre-repo-github>
   git push -u origin main
   ```

2. **Connecter à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub
   - Cliquez sur "New Project"
   - Importez votre repository PersoShop

3. **Configurer les variables d'environnement**
   
   Dans Vercel, ajoutez toutes ces variables dans Settings > Environment Variables:
   
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=https://votre-app.vercel.app
   ADMIN_EMAIL=lilia@persoshop.com
   ADMIN_PASSWORD=your-secure-password
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Important** : Utilisez le "Session Pooler" connection string de Supabase pour `DATABASE_URL`

4. **Déployer**
   - Vercel détectera automatiquement Next.js
   - Cliquez sur "Deploy"
   - Attendez la fin du build

5. **Exécuter les migrations Prisma**
   
   Après le premier déploiement, connectez-vous en SSH ou utilisez Vercel CLI :
   ```bash
   npx vercel env pull
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Test de l'application**
   - Visitez votre URL Vercel
   - Testez l'inscription d'un client
   - Connectez-vous en tant qu'admin (lilia@persoshop.com)

## 📱 Installation PWA

L'application est installable en tant que PWA :
- **iOS** : Safari > Partager > Sur l'écran d'accueil
- **Android** : Chrome > Menu > Installer l'application

## 🔧 Développement local

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📝 Notes importantes

- Les icônes PWA sont des placeholders (192x192 et 512x512)
- Remplacez-les par de vraies icônes avant la production
- Assurez-vous que toutes les variables d'environnement sont configurées
- Utilisez le "Session Pooler" de Supabase, pas le "Transaction Pooler"

