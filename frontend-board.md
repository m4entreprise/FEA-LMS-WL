# Frontend Development Board (UI/UX)

Objectif: lister tout ce qui est nécessaire côté frontend (pages, navigation, sections, composants UI, responsive, branding) **en cohérence avec les features 1→6 déjà implémentées**.

Conventions:
- `[x]` = déjà présent dans le code (à vérifier/raffiner)
- `[ ]` = à créer / compléter

---

## 0. Navigation globale (Shell)

### 0.1 Layouts
- [x] App layout authentifié (sidebar + header + breadcrumbs)
- [x] Layout settings (sous-navigation settings)
- [x] Layout auth pages (login/register/etc.)
- [x] Layout public “simple” (pour pages publiques autres que welcome: ex. vérification certificat)

### 0.2 Menus / navigation
- [x] Sidebar (liens Student + Admin conditionnels)
- [x] Header (breadcrumbs, user menu, theme)
- [x] Footer applicatif (liens: CGU, confidentialité, support, version)
- [x] Liens “corporate” (remplacer/retirer liens starter-kit: Repository/Documentation)
- [x] “Mobile navigation” (drawer + comportement cohérent sur toutes les pages)

### 0.3 Comportements UX transverses
- [x] Système de notifications (success/error) global (toast + mapping erreurs validation) (actuellement: flash messages inline via Alert)
- [x] États de chargement cohérents (boutons, pages)
- [x] “Empty states” cohérents (catalogue vide, cours sans modules, etc.)
- [x] Gestion des erreurs 403/404/500 côté Inertia (pages dédiées)

### 0.4 White‑label (M4 LMS) — theming/branding par client
- [x] Système de “Brand Pack” (logo, favicon, couleurs, typographies, textes)
- [x] Design tokens via CSS variables (primary/secondary, radius, etc.) + override par client
- [x] Gestion des assets brandés (logo header/sidebar, favicon, images)
- [x] “Liens footer” configurables par client (CGU, privacy, support)
- [x] i18n / textes paramétrables (au minimum FR/EN) (optionnel)

---

## 1. Public (non connecté)

### 1.1 Landing / marketing
- [x] Welcome (landing)
- [x] Landing “produit” M4 LMS (présentation, features, CTA)
- [x] Page “Support” / “Contact” (liens du footer)

### 1.2 Vérification certificats (public)
- [x] Page `certificates/verify/{uuid}`
- [x] Page `certificates/verify` (formulaire)
- [x] UX: champ “entrer un ID de vérification” + bouton “Vérifier” (au lieu d’URL manuelle)
- [x] CTA: login / register si l’utilisateur veut accéder à ses cours
- [x] Affichage “copy link” (copier l’URL) + “print” (optionnel)

---

## 2. Auth (Fortify)

### 2.1 Pages
- [x] Login
- [x] Register
- [x] Forgot password
- [x] Reset password
- [x] Email verification
- [x] Confirm password
- [x] Two-factor setup / recovery

### 2.2 UX Auth
- [ ] Messages d’erreur harmonisés
- [ ] Redirections propres (si déjà connecté → dashboard)

---

## 3. Student App (rôle: student)

### 3.1 Dashboard étudiant
- [x] Dashboard existant (stats + My Learning + Recent Activity)
- [ ] Sections à compléter:
  - [x] “Mes cours” (cards + progress bar)
  - [x] “Cours complétés” (filtre/onglet + accès certificat)
  - [x] “Certificats” (liste + download + lien verify)
  - [x] “Recommandés / Catalogue” (liens rapides)

### 3.2 Catalogue & cours
- [x] Catalogue `courses/index`
- [x] Page cours `courses/show`
- [x] Player leçon `courses/lesson`

### 3.2bis Student navigation
- [x] “My Certificates” (page dédiée) (optionnel mais recommandé)
- [x] “My Profile” entrée claire (settings)

### 3.3 Sections/Composants pour pages cours
- [ ] Catalogue:
  - [x] Filtres (catégorie, durée, statut)
  - [x] Recherche
  - [x] Pagination
- [ ] Page cours:
  - [x] Module list: bouton Start pointe vers la 1ère leçon (actuellement placeholder)
  - [x] Bloc progression (pour enrolled)
  - [x] Bloc prérequis (déjà affiché) → UX plus claire + lien vers cours prérequis
- [ ] Player leçon:
  - [x] Navigation “Previous / Next lesson” réelle (actuellement placeholders)
  - [x] Indication progression globale + “Mark as complete” feedback (toast)
  - [x] Téléchargement docs / vidéo / SCORM: UX uniforme

### 3.4 Quiz (student)
- [x] Quiz player (dans lesson)
- [x] Résumé fin de quiz (score, passing, feedback, retry)
- [x] Historique tentatives (si attempts existent)

### 3.5 Certificats (student)
- [x] Lien “Download certificate” visible depuis un endroit central (dashboard/certificates)
- [x] Page “Mes certificats” (liste, download, lien verify)

---

## 4. Admin App (rôle: admin)

### 4.1 Dashboard admin
- [x] Admin dashboard page
- [ ] Sections:
  - [x] KPIs de base (users/courses/enrollments)
  - [x] Completion rate + certificates issued
  - [x] Charts (inscriptions par jour, complétion)
  - [x] Actions rapides: create course, create user, exports

### 4.1bis Reporting
- [ ] “Reports” section/page (optionnel)
  - [x] Export enrollments CSV (route existante) → ajouter bouton UI
  - [ ] Export PDF (si besoin)

### 4.2 Course Management
- [x] Liste admin courses
- [x] Edit/create course
- [x] Modules/contents management (dans course edit)
- [x] Prerequisites selection
- [x] Edition content (texte/video/scorm/document)
- [ ] Uploaders plus UX (drag&drop, progress, preview) pour vidéo/document/scorm

### 4.3 Quiz Management
- [x] Quiz edit (settings + questions CRUD)
- [ ] UX: réordonner questions (drag&drop) si souhaité

### 4.4 Question Bank
- [x] Page question-bank (search + target quiz + copy)
- [ ] Améliorations:
  - [x] Filtre par type (MCQ/TF/Short)
  - [x] Filtre par course
  - [x] Aperçu des options + mise en évidence des bonnes réponses

### 4.5 Users Management
- [x] Liste users
- [x] Create/edit user
- [x] Détail user: inscriptions + progression + activité
- [x] Détail user: certificats (liste + lien verify) (complément)

### 4.6 Certificates (admin)
- [x] Liste certificats + recherche
- [x] Détail certificat (vue admin) (optionnel)

---

## 5. Settings (auth)

### 5.1 Profil
- [x] Page profile (avatar, bio)
- [ ] UX: validation/preview cohérents

### 5.2 Sécurité
- [x] Password update
- [x] Two factor
- [ ] Sessions / devices (optionnel)

### 5.3 White‑label (admin) — si M4 veut exposer la config au client
- [ ] Page “Branding” (logo, couleurs, textes)
- [ ] Page “Legal links” (URLs CGU/Privacy/Support)
- [ ] Upload favicon / social image

---

## 6. Composants UI transverses

- [x] Breadcrumbs
- [x] Sidebar / NavMain / NavUser
- [x] Toast/notifications
- [x] Confirm dialogs uniformisés (delete, destructive actions)
- [ ] Data table component (tri/pagination) pour admin (users, certificates)
- [ ] Search input component (avec debounce)
- [ ] “RoleGate” helper (composant/guard UI) pour afficher/masquer sections selon rôle

---

## 7. Responsive / Accessibilité / Qualité

### 7.1 Responsive
- [x] Sidebar: comportement mobile stable (open/close, overlay)
- [x] Tables admin: responsive (scroll horizontal, cartes)
- [x] Lesson player: sidebar modules responsive

### 7.2 Accessibilité
- [x] Focus states, keyboard navigation
- [x] ARIA labels pour menus, dialogs

### 7.3 Cohérence visuelle
- [x] Typo, spacing, couleurs, variants boutons
- [x] Dark mode QA

---

## 8. Branding

- [x] Logo (existant)
- [x] Nom produit: M4 LMS
- [x] Tagline (optionnel)
- [x] Favicon + social preview (par client)
- [x] Palette de couleurs (primary/secondary) (par client)

---

## 9. Priorisation suggérée (si tu veux)

1) 7.2 Role-based dashboards (student + admin) + sections
2) Navigation leçon Prev/Next + feedbacks (7.1)
3) Responsive (7.3)
4) Toasts + erreurs globales
5) Branding (7.4)
