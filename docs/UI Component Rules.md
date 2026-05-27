# L'Écosystème Nexus : Charte Graphique & Identité Visuelle

## 📝 Vision Produit (Product Vision)
L'objectif est que l'utilisateur qui configure son bot sur le Dashboard Web se sente "à la maison" lorsqu'il ouvre le panneau de configuration de son application de bureau Nexus-Overlay. Ce document définit l'harmonie commune pour unifier la marque Nexus partout.

---

## 1. L'Univers Visuel (Le Thème)
Puisque vos outils sont intimement liés à Discord, à la culture gaming/communautaire (mèmes) et à la tech (WebSockets, automatisation), le style visuel idéal est le **"Cyber-Minimalisme Moderne"** (Dark mode natif, accents néons/lumineux, interfaces épurées).

### ⚙️ La Palette de Couleurs (L'ADN de Nexus)
Il faut limiter la palette à 4 couleurs clés pour garantir la cohérence entre le Dashboard Web et l'application Electron :

| Rôle | Couleur | Code HEX | Description / Utilisation |
| :--- | :--- | :--- | :--- |
| **Fond Principal** | Noir Profond / Anthracite | `#0F111A` | Pour le Dashboard et le panneau de l'Overlay. |
| **Fond Secondaire** | Gris Discord Évolué | `#1E2235` | Pour les cartes (cards), les sections et les menus. |
| **Couleur Accent (Primaire)** | Violet Électrique | `#6366F1` | La signature Nexus (boutons importants, liens, status). |
| **Couleur Accent (Secondaire)** | Cyan Cyber | `#06B6D4` | Pour les indicateurs de live (YouTube, stats, connexions Socket.io). |

#### 🤖 Implémentation Technique (Design Tokens CSS)
```css
:root {
  --nexus-bg-main: #0F111A;
  --nexus-bg-surface: #1E2235;
  --nexus-bg-overlay-panel: rgba(15, 17, 26, 0.75);
  
  --nexus-accent-primary: #6366F1;
  --nexus-accent-secondary: #06B6D4;
  
  --nexus-text-main: #F8FAFC;
  --nexus-text-muted: #94A3B8;
  --nexus-border-color: #334155;

  --nexus-font-heading: 'Poppins', 'Space Grotesk', system-ui, sans-serif;
  --nexus-font-body: 'Inter', system-ui, sans-serif;

  --nexus-radius-button: 8px;
  --nexus-radius-card: 12px;
  
  --nexus-transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --nexus-glass-blur: blur(10px);
  --nexus-glow-effect: 0 0 15px rgba(99, 102, 241, 0.4);
}
```

---

## 2. Les Éléments de Design Communs (UI/UX)

### 📐 Formes et Rayons (Border-Radius)
**Style** : Moderne et légèrement adouci.

**Règle** : Utilisez un `border-radius: 12px` pour toutes les cartes de fonctionnalités (ex: la carte "Système YouTube" sur le web ou les panels de l'application desktop) et `8px` pour les boutons. Cela donne un aspect premium et moins "brut" que le Vanilla CSS de base.

### ✍️ Typographie
- **Police de titre** : `Poppins` ou `Space Grotesk` (Google Fonts). Très géométrique, parfaite pour le côté "Tech/Bot".
- **Police de texte** : `Inter` ou `System-UI`. Ultra-lisible, essentielle pour les longs panneaux de configuration ou les logs de modération.

### 🔮 Effets Visuels Récurrents

**Glassmorphism (Effet de verre flouté)** : Très important pour Nexus-Overlay. Le panneau de configuration de l'application de bureau doit utiliser un fond semi-transparent avec un flou (`backdrop-filter: blur(10px)`). Cet effet peut être rappelé subtilement sur la navbar du Dashboard Web.

**Gradients (Dégradés)** : Les titres majeurs ou les boutons de validation importants doivent utiliser un dégradé allant du Violet Électrique au Cyan Cyber.

```css
.nexus-gradient-text {
  background: linear-gradient(135deg, var(--nexus-accent-primary), var(--nexus-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 3. Application Concrète sur vos Deux Outils

### 🌐 Sur le Dashboard de Nexus Bot
La page d'accueil affiche les modules sous forme de "grille de cartes" (Grid Layout). Chaque service (YouTube, Stats, Anti-Raid) a sa propre carte avec une icône dédiée colorée en Cyan ou Violet.

L'authentification Discord redirige vers une interface qui reprend exactement le même fond sombre (`#0F111A`) pour éviter le flash blanc ou le contraste trop violent.

### 💻 Sur l'Interface de Nexus-Overlay
Même si c'est du Vanilla JavaScript/CSS, appliquez les mêmes variables CSS (`--nexus-accent-primary`, `--nexus-bg-main`, etc.).

Le panneau de configuration de l'overlay doit ressembler à une "version miniature" ou une extension du Dashboard Web (mêmes boutons arrondis, même police).

**L'Overlay transparent** : Lorsqu'un mème s'affiche, vous pouvez ajouter une très légère animation d'apparition (Fade-in + Scale-up) avec une bordure lumineuse (glow effect) aux couleurs de Nexus pour signer visuellement l'arrivée du média.

```css
@keyframes memeEntrance {
  0% { opacity: 0; transform: scale(0.9) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.meme-container {
  animation: memeEntrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  border-radius: var(--nexus-radius-card);
  box-shadow: var(--nexus-glow-effect);
}
```