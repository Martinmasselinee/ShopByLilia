# 🚀 Guide de Déploiement PersoShop

## Étape 1 : Préparer le repository GitHub

```bash
# Si vous n'avez pas encore créé le repo sur GitHub, créez-en un maintenant
# Puis :

git add .
git commit -m "Initial commit - PersoShop ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/PersoShop.git
git push -u origin main
```

## Étape 2 : Déployer sur Vercel

### Option A : Via l'interface web (Recommandé)

1. **Allez sur [vercel.com](https://vercel.com)**
   - Connectez-vous avec votre compte GitHub
   - Si vous n'avez pas de compte, créez-en un (gratuit)

2. **Importez votre projet**
   - Cliquez sur "Add New..." → "Project"
   - Sélectionnez votre repository PersoShop
   - Vercel détectera automatiquement Next.js

3. **Configurez les variables d'environnement**
   
   **IMPORTANT** : Avant de déployer, ajoutez TOUTES ces variables dans "Environment Variables" :
   
   ```
   DATABASE_URL=postgresql://... (Session Pooler de Supabase)
   NEXTAUTH_SECRET=un-secret-aleatoire-tres-long-et-securise
   NEXTAUTH_URL=https://votre-app.vercel.app (remplacé après le 1er déploiement)
   ADMIN_EMAIL=lilia@persoshop.com
   ADMIN_PASSWORD=votre-mot-de-passe-securise
   CLOUDINARY_CLOUD_NAME=das4cjffz
   CLOUDINARY_API_KEY=872881589856735
   CLOUDINARY_API_SECRET=RJmJNeagi_HtBcSvCt0pDOMfJss
   ```
   
   **Pour générer NEXTAUTH_SECRET** :
   ```bash
   openssl rand -base64 32
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez la fin du build (2-3 minutes)

5. **Mettre à jour NEXTAUTH_URL**
   - Après le premier déploiement, récupérez votre URL Vercel
   - Allez dans Settings > Environment Variables
   - Mettez à jour `NEXTAUTH_URL` avec votre URL Vercel
   - Redéployez (Settings > Redeploy)

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les instructions
# Ajouter les variables d'environnement via l'interface web ou :
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... etc
```

## Étape 3 : Exécuter les migrations Prisma

Après le déploiement, vous devez exécuter les migrations :

### Option A : Via Vercel CLI (Recommandé)

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Télécharger les variables d'environnement
vercel env pull

# Exécuter les migrations
npx prisma migrate deploy
npx prisma db seed
```

### Option B : Via Supabase Dashboard

1. Allez sur votre dashboard Supabase
2. Ouvrez "SQL Editor"
3. Exécutez les commandes SQL des migrations (dans `prisma/migrations/`)
4. Exécutez le seed manuellement

## Étape 4 : Vérifier le déploiement

1. Visitez votre URL Vercel
2. Testez l'inscription d'un nouveau client
3. Connectez-vous en tant qu'admin :
   - Email : `lilia@persoshop.com`
   - Password : (celui que vous avez mis dans ADMIN_PASSWORD)

## ⚠️ Problèmes courants

### Erreur "Database connection failed"
- Vérifiez que vous utilisez le **Session Pooler** de Supabase, pas le Transaction Pooler
- Le port doit être **6543** (Session Pooler) ou **5432** (direct connection)
- Vérifiez que "Allow connections from any IP" est activé dans Supabase

### Erreur "NEXTAUTH_SECRET missing"
- Ajoutez la variable dans Vercel Settings > Environment Variables
- Redéployez après l'ajout

### Les images ne s'affichent pas
- Vérifiez les variables Cloudinary dans Vercel
- Vérifiez que `res.cloudinary.com` est dans les remotePatterns de next.config.js (déjà fait)

### Erreur Prisma
- Exécutez `npx prisma migrate deploy` après le déploiement
- Vérifiez que DATABASE_URL est correcte

## 📱 Test PWA

Une fois déployé, testez l'installation PWA :
- **iOS** : Safari > Partager > Sur l'écran d'accueil
- **Android** : Chrome > Menu > Installer l'application

## 🔗 URLs importantes

- **Vercel Dashboard** : https://vercel.com/dashboard
- **Supabase Dashboard** : https://supabase.com/dashboard
- **Cloudinary Dashboard** : https://cloudinary.com/console

## ✅ Checklist de déploiement

- [ ] Repository GitHub créé et code poussé
- [ ] Projet Vercel créé
- [ ] Toutes les variables d'environnement ajoutées
- [ ] Premier déploiement réussi
- [ ] NEXTAUTH_URL mis à jour avec l'URL Vercel
- [ ] Migrations Prisma exécutées
- [ ] Seed admin exécuté
- [ ] Test d'inscription client
- [ ] Test de connexion admin
- [ ] Test d'upload de photo
- [ ] Test PWA sur mobile

---

**Besoin d'aide ?** Consultez les logs dans Vercel > Deployments > (votre déploiement) > View Function Logs

