# ✅ Checklist Variables Vercel - shop-by-lilia

**URL Vercel :** `https://shop-by-lilia.vercel.app`

## 📍 Accès aux Variables
1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez le projet : **shop-by-lilia**
3. Cliquez sur : **Settings** → **Environment Variables**

---

## ✅ Variables à Vérifier (8 variables)

### 1. DATABASE_URL
**Valeur exacte :**
```
postgresql://postgres.hjcxcwjwicfmwxolcxuw:Paralysis5-Silver0-Nemeses7-Verify3-Golf2@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci (avec le mot de passe)
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

### 2. NEXTAUTH_SECRET
**Valeur exacte :**
```
zaE4VpAYq6r6SEnSd/aslaoSNSA7IM6oubp8DuLNfXw=
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci (avec le `=` à la fin)
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

### 3. NEXTAUTH_URL ⚠️ IMPORTANT
**Valeur à mettre :**
```
https://shop-by-lilia.vercel.app
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est `https://shop-by-lilia.vercel.app` (PAS localhost)
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

**⚠️ Si la valeur est `http://localhost:3000`, CORRIGEZ-LA !**

---

### 4. ADMIN_EMAIL
**Valeur exacte :**
```
lilia@persoshop.com
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

### 5. ADMIN_PASSWORD
**Valeur actuelle dans .env.local :**
```
changez-ce-mot-de-passe-securise
```

**Action requise :**
- [ ] Si vous avez changé le mot de passe dans Vercel, utilisez celui-ci
- [ ] Si c'est encore le placeholder, changez-le pour un mot de passe sécurisé
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

**💡 Pour tester la connexion admin, utilisez le mot de passe configuré ici**

---

### 6. CLOUDINARY_CLOUD_NAME
**Valeur exacte :**
```
das4cjffz
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

### 7. CLOUDINARY_API_KEY
**Valeur exacte :**
```
872881589856735
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

### 8. CLOUDINARY_API_SECRET
**Valeur exacte :**
```
RJmJNeagi_HtBcSvCt0pDOMfJss
```

**Vérifications :**
- [ ] Variable existe
- [ ] Valeur est exactement celle-ci
- [ ] Cochez : ✅ Production, ✅ Preview, ✅ Development

---

## 🚨 Points Critiques

1. **NEXTAUTH_URL** : Doit être `https://shop-by-lilia.vercel.app` (pas localhost)
2. **ADMIN_PASSWORD** : Assurez-vous d'utiliser le bon mot de passe pour vous connecter
3. **Toutes les variables** : Doivent être cochées pour Production, Preview, ET Development

---

## 🔄 Après Avoir Corrigé

1. **Redéployez** : 
   - Allez dans **Deployments**
   - Cliquez sur **"..."** du dernier déploiement
   - Cliquez sur **"Redeploy"**

2. **Testez la connexion** :
   - URL : `https://shop-by-lilia.vercel.app/login`
   - Email : `lilia@persoshop.com`
   - Password : (votre ADMIN_PASSWORD)

---

## ✅ Résumé

- **8 variables** à vérifier
- **NEXTAUTH_URL** est le plus critique (doit être l'URL Vercel)
- Toutes doivent être cochées pour les 3 environnements

