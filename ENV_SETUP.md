# Configuration de l'environnement

## Fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin
ADMIN_EMAIL="lilia@persoshop.com"
ADMIN_PASSWORD="votre-mot-de-passe-securise"

# Cloudinary (à configurer après)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Étapes pour obtenir DATABASE_URL depuis Supabase

1. Allez dans votre projet Supabase ("ShopByLilia")
2. Cliquez sur **Settings** (icône engrenage) dans la barre latérale gauche
3. Cliquez sur **Database** dans le menu Settings
4. Faites défiler jusqu'à la section **Connection string**
5. Sélectionnez l'onglet **URI** (ou **Connection pooling** si vous préférez)
6. **Copiez la connection string complète**
7. Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez défini lors de la création du projet
8. Collez cette URL dans votre fichier `.env.local` comme valeur de `DATABASE_URL`

### Exemple de connection string :
```
postgresql://postgres:VotreMotDePasse@db.abcdefghijk.supabase.co:5432/postgres
```

## Générer NEXTAUTH_SECRET

Générez un secret sécurisé pour NextAuth avec cette commande :
```bash
openssl rand -base64 32
```
Copiez le résultat et collez-le comme valeur de `NEXTAUTH_SECRET` dans `.env.local`.

