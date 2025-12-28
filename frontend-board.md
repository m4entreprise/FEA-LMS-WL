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
- [ ] Layout public “simple” (pour pages publiques autres que welcome: ex. vérification certificat)

### 0.2 Menus / navigation
- [x] Sidebar (liens Student + Admin conditionnels)
- [x] Header (breadcrumbs, user menu, theme)
- [ ] Footer applicatif (liens: CGU, confidentialité, support, version)
- [ ] Liens “corporate” (remplacer/retirer liens starter-kit: Repository/Documentation)
- [ ] “Mobile navigation” (drawer + comportement cohérent sur toutes les pages)

### 0.3 Comportements UX transverses
- [ ] Système de notifications (success/error) global (toast + mapping erreurs validation)
- [ ] États de chargement cohérents (boutons, pages)
- [ ] “Empty states” cohérents (catalogue vide, cours sans modules, etc.)
- [ ] Gestion des erreurs 403/404/500 côté Inertia (pages dédiées)

### 0.4 White‑label (M4 LMS) — theming/branding par client
- [ ] Système de “Brand Pack” (logo, favicon, couleurs, typographies, textes)
- [ ] Design tokens via CSS variables (primary/secondary, radius, etc.) + override par client
- [ ] Gestion des assets brandés (logo header/sidebar, favicon, images)
- [ ] “Liens footer” configurables par client (CGU, privacy, support)
- [ ] i18n / textes paramétrables (au minimum FR/EN) (optionnel)

---

## 1. Public (non connecté)

### 1.1 Landing / marketing
- [x] Welcome (landing)
- [ ] Landing “produit” M4 LMS (présentation, features, CTA)
- [ ] Page “Support” / “Contact” (liens du footer)

### 1.2 Vérification certificats (public)
- [x] Page `certificates/verify/{uuid}`
- [ ] UX: champ “entrer un ID de vérification” + bouton “Vérifier” (au lieu d’URL manuelle)
- [ ] CTA: login / register si l’utilisateur veut accéder à ses cours
- [ ] Affichage “copy link” (copier l’URL) + “print” (optionnel)

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
  - [ ] “Cours complétés” (filtre/onglet + accès certificat)
  - [ ] “Certificats” (liste + download + lien verify)
  - [ ] “Recommandés / Catalogue” (liens rapides)

### 3.2 Catalogue & cours
- [x] Catalogue `courses/index`
- [x] Page cours `courses/show`
- [x] Player leçon `courses/lesson`

### 3.2bis Student navigation
- [ ] “My Certificates” (page dédiée) (optionnel mais recommandé)
- [ ] “My Profile” entrée claire (settings)

### 3.3 Sections/Composants pour pages cours
- [ ] Catalogue:
  - [ ] Filtres (catégorie, durée, statut)
  - [ ] Recherche
  - [ ] Pagination
- [ ] Page cours:
  - [ ] Module list: bouton Start pointe vers la 1ère leçon (actuellement placeholder)
  - [ ] Bloc progression (pour enrolled)
  - [ ] Bloc prérequis (déjà affiché) → UX plus claire + lien vers cours prérequis
- [ ] Player leçon:
  - [ ] Navigation “Previous / Next lesson” réelle (actuellement placeholders)
  - [ ] Indication progression globale + “Mark as complete” feedback (toast)
  - [ ] Téléchargement docs / vidéo / SCORM: UX uniforme

### 3.4 Quiz (student)
- [x] Quiz player (dans lesson)
- [ ] Résumé fin de quiz (score, passing, feedback, retry)
- [ ] Historique tentatives (si attempts existent)

### 3.5 Certificats (student)
- [ ] Lien “Download certificate” visible depuis un endroit central (dashboard/certificates)
- [ ] Page “Mes certificats” (liste, download, lien verify)

---

## 4. Admin App (rôle: admin)

### 4.1 Dashboard admin
- [x] Admin dashboard page
- [ ] Sections:
  - [x] KPIs de base (users/courses/enrollments)
  - [ ] Completion rate + certificates issued
  - [ ] Charts (inscriptions par jour, complétion)
  - [ ] Actions rapides: create course, create user, exports

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
  - [ ] Filtre par type (MCQ/TF/Short)
  - [ ] Filtre par course
  - [ ] Aperçu des options + mise en évidence des bonnes réponses

### 4.5 Users Management
- [x] Liste users
- [x] Create/edit user
- [x] Détail user: inscriptions + progression + activité
- [ ] Détail user: certificats (liste + lien verify) (complément)

### 4.6 Certificates (admin)
- [x] Liste certificats + recherche
- [ ] Détail certificat (vue admin) (optionnel)

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
- [ ] Toast/notifications
- [ ] Confirm dialogs uniformisés (delete, destructive actions)
- [ ] Data table component (tri/pagination) pour admin (users, certificates)
- [ ] Search input component (avec debounce)
- [ ] “RoleGate” helper (composant/guard UI) pour afficher/masquer sections selon rôle

---

## 7. Responsive / Accessibilité / Qualité

### 7.1 Responsive
- [ ] Sidebar: comportement mobile stable (open/close, overlay)
- [ ] Tables admin: responsive (scroll horizontal, cartes)
- [ ] Lesson player: sidebar modules responsive

### 7.2 Accessibilité
- [ ] Focus states, keyboard navigation
- [ ] ARIA labels pour menus, dialogs

### 7.3 Cohérence visuelle
- [ ] Typo, spacing, couleurs, variants boutons
- [ ] Dark mode QA

---

## 8. Branding

- [x] Logo (existant)
- [x] Nom produit: M4 LMS
- [ ] Tagline (optionnel)
- [ ] Favicon + social preview (par client)
- [ ] Palette de couleurs (primary/secondary) (par client)

---

## 9. Priorisation suggérée (si tu veux)

1) 7.2 Role-based dashboards (student + admin) + sections
2) Navigation leçon Prev/Next + feedbacks (7.1)
3) Responsive (7.3)
4) Toasts + erreurs globales
5) Branding (7.4)
