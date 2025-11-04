# 🚀 Déploiement Rapide - PersoShop

## ✅ Prérequis
- Compte GitHub (gratuit)
- Compte Vercel (gratuit) - créez-le sur [vercel.com](https://vercel.com)
- Compte Supabase (gratuit) - déjà configuré ✅
- Compte Cloudinary - déjà configuré ✅

## 📋 Étapes de déploiement (5 minutes)

### 1. Pousser sur GitHub
```bash
# Si vous n'avez pas encore créé le repo GitHub :
# 1. Allez sur github.com
# 2. Créez un nouveau repository (nom: PersoShop)
# 3. Copiez l'URL du repo

# Puis dans votre terminal :
git remote add origin https://github.com/VOTRE-USERNAME/PersoShop.git
git push -u origin main
```

### 2. Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New..."** → **"Project"**
4. Sélectionnez votre repo **PersoShop**
5. Cliquez sur **"Import"**

### 3. Configurer les variables d'environnement

**IMPORTANT** : Avant de cliquer sur "Deploy", allez dans **"Environment Variables"** et ajoutez :

```
DATABASE_URL=votre-session-pooler-string-de-supabase
NEXTAUTH_SECRET=generez-avec-openssl-rand-base64-32
NEXTAUTH_URL=https://votre-app.vercel.app (laissez vide pour l'instant, mettez à jour après)
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

### 4. Déployer
1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes

### 5. Mettre à jour NEXTAUTH_URL
1. Une fois déployé, récupérez votre URL Vercel (ex: `persoshop.vercel.app`)
2. Allez dans **Settings** → **Environment Variables**
3. Mettez à jour `NEXTAUTH_URL` avec votre URL
4. Allez dans **Deployments** → cliquez sur **"..."** → **"Redeploy"**

### 6. Exécuter les migrations Prisma

```bash
# Installer Vercel CLI
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

### 7. Tester
1. Visitez votre URL Vercel
2. Testez l'inscription d'un client
3. Connectez-vous en admin : `lilia@persoshop.com` / (votre ADMIN_PASSWORD)

## 🎉 C'est fait !

Votre application est maintenant en ligne et prête à être testée !

---

**Problème ?** Consultez les logs dans Vercel > Deployments > (votre déploiement) > View Function Logs

