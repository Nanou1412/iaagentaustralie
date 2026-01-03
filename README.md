# AI for Business

Site web B2B production-ready pour démontrer et vendre des solutions IA aux entreprises.

## 🎯 Objectif

Un outil de closing, pas une brochure. Le site permet de :
- Expliquer clairement ce que fait l'IA pour le business
- Montrer une démo ultra réaliste pour les restaurants
- Signer et encaisser en face à face

## 🛠️ Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: lucide-react
- **State**: Zustand
- **Backend**: Netlify Functions
- **AI**: OpenAI GPT-4o-mini
- **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)

## 📁 Structure du Projet

```
/app
  page.tsx              # Home - Introduction IA
  /industries
    page.tsx            # Liste des industries
  /industry
    /[slug]
      page.tsx          # Page industrie (Restaurants)
  layout.tsx
  globals.css

/components
  /ui                   # Composants shadcn/ui
  /voice                # VoiceInput, VoiceOutput
  /chat                 # ChatWindow
  /timeline             # BeforeAfterTimeline
  /sms-preview          # SMSPreview (écran smartphone)
  /dashboard-preview    # DashboardPreview
  /cta                  # CTABlock (paiement)
  /scenario-hints       # Boutons de scénarios

/lib
  ai.ts                 # Client API AI
  constants.ts          # Constantes app
  industry-config.ts    # Configuration industries
  speech.ts             # Helpers Web Speech API
  store.ts              # Zustand store
  validation.ts         # Schémas Zod
  utils.ts              # Utilitaires CSS

/types
  ai.ts                 # Types réponses AI
  events.ts             # Types événements
  industry.ts           # Types industries

/netlify/functions
  ai.ts                 # Endpoint API OpenAI
```

## 🚀 Installation Locale

### Prérequis

- Node.js 20+
- npm ou yarn
- Compte OpenAI avec clé API

### Étapes

```bash
# 1. Cloner et entrer dans le projet
cd iaagentaustralie

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env et ajouter votre OPENAI_API_KEY

# 4. Lancer en développement
npm run dev

# 5. Ouvrir http://localhost:3000
```

### Avec Netlify CLI (recommandé pour tester les functions)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Lancer avec les functions
netlify dev
```

## 🌐 Déploiement Netlify

### Via Interface Web

1. Connecter votre repo GitHub à Netlify
2. Configurer :
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Ajouter la variable d'environnement :
   - `OPENAI_API_KEY`: Votre clé OpenAI

### Via CLI

```bash
# Installer si pas fait
npm install -g netlify-cli

# Login
netlify login

# Init le projet
netlify init

# Déployer
netlify deploy --prod
```

## 🧪 Scénarios de Test

### Réservation simple
> "Hi, I'd like to book a table for 4 people tonight at 7pm. My name is Sarah Johnson and my phone is 0412 345 678."

**Résultat attendu:**
- Message de confirmation
- SMS généré dans le preview smartphone
- Nouvelle entrée dans le dashboard

### Annulation
> "Hi, I need to cancel my reservation. My name is Michael Brown and I had a booking for tomorrow at 8pm."

**Résultat attendu:**
- Message d'annulation confirmée
- SMS d'annulation
- Entrée dashboard marquée "Canceled"

### Modification
> "Hello, I have a reservation under David Lee for Saturday at 6pm. Can I change it to 7:30pm and add 2 more people?"

**Résultat attendu:**
- Message de modification confirmée
- SMS avec nouveaux détails
- Entrée dashboard marquée "Modified"

### Commande à emporter
> "Hi, I'd like to place a takeaway order. 2 margherita pizzas, 1 caesar salad, and 3 garlic breads. My name is Emma Wilson, phone 0423 456 789."

**Résultat attendu:**
- Message de confirmation commande
- SMS avec récapitulatif
- Entrée dashboard avec détails commande

## ⚙️ Modes de Fonctionnement

### Mode Demo (défaut)

- Restaurant fictif "The Golden Fork"
- Règles et données figées
- Parfait pour les démonstrations client

### Mode Prod-Ready

L'architecture permet d'étendre facilement :
- Ajouter des industries dans `lib/industry-config.ts`
- Connecter une vraie base de données
- Intégrer un vrai système de paiement

## 🔒 Sécurité

- Clé OpenAI JAMAIS exposée côté client
- Validation des entrées avec Zod
- Rate limiting sur l'API
- Taille max des messages: 500 caractères
- Max conversation history: 10 messages

## 📱 Responsive

Testé et optimisé pour :
- Desktop (laptop présentation)
- Tablette
- Mobile

## 🎨 Design

- UI premium et tech
- Espacements larges
- Animations subtiles
- Accessibilité respectée
- Dark mode prêt (variables CSS)

## 📄 Licence

Propriétaire - Usage commercial autorisé pour le client.
