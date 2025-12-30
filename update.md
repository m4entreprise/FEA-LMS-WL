# Update Log

Ce fichier sert de journal de suivi des correctifs et améliorations (backend + frontend).

## Format d’entrée

- **Date**: YYYY-MM-DD
- **Priorité**: P0 / P1 / P2
- **Problème**: description courte
- **Cause**: où et pourquoi
- **Fix**: ce qui a été changé
- **Fichiers**: liste
- **Vérification**: comment valider (étapes manuelles et/ou tests)

---

## 2025-12-29

### [P0] Initialisation du journal

- **Problème**: Mise en place d’un suivi structuré des changements.
- **Cause**: Absence de changelog opérationnel.
- **Fix**: Création de `update.md` avec un format standard d’entrées.
- **Fichiers**:
  - `update.md`
- **Vérification**:
  - Vérifier que le fichier est présent à la racine du repo.

### [P0] Bloquer la complétion manuelle des Quiz/SCORM

- **Problème**: Un quiz (ou un SCORM) pouvait être marqué comme complété via le bouton “Mark as Complete”, sans respect des règles de réussite (quiz) / statut SCORM.
- **Cause**: L’endpoint `LessonController@complete` appliquait un toggle `UserProgress` sans vérifier le type de contenu.
- **Fix**:
  - Backend: refus (403) si `content.type` est `quiz` ou `scorm`.
  - Frontend: le bouton “Mark as Complete” est masqué pour `quiz` et `scorm`.
- **Fichiers**:
  - `app/Http/Controllers/LessonController.php`
  - `resources/js/pages/courses/lesson.tsx`
- **Vérification**:
  - Ouvrir une leçon de type quiz: le bouton “Mark as Complete” ne doit pas apparaître.
  - Tenter d’appeler `POST lessons.complete` sur un contenu quiz/scorm: doit renvoyer 403.

### [P0] Standardiser “complété” = `completed_at` non null

- **Problème**: Des écrans/stats considéraient un contenu “complété” dès qu’une ligne `user_progress` existait (même si `completed_at` est null), ce qui pouvait fausser:
  - la sidebar (état “Completed”)
  - le déverrouillage par module
  - les pourcentages de progression (dashboard / admin)
- **Cause**: Requêtes `UserProgress` sans filtre `whereNotNull('completed_at')`.
- **Fix**: Ajout systématique de `whereNotNull('completed_at')` dans les calculs de complétion/progression concernés.
- **Fichiers**:
  - `app/Http/Controllers/LessonController.php`
  - `app/Http/Controllers/CourseController.php`
  - `app/Http/Controllers/DashboardController.php`
  - `app/Http/Controllers/Admin/UserController.php`
- **Vérification**:
  - Ouvrir un contenu SCORM (création éventuelle de `user_progress` avec `completed_at` null): il ne doit pas compter comme “Completed” tant que le SCORM ne renvoie pas un statut de complétion.
  - Vérifier que les % sur dashboard/admin correspondent au nombre de contenus avec `completed_at` non null.

### [P0] Empêcher la validation d’un quiz sans questions (ou sans points)

- **Problème**: Un quiz sans question (ou avec total de points à 0) pouvait être soumis et être considéré “passed” par effet de bord (seuil à 0).
- **Cause**: Le calcul `passed = score >= (passing_score% * totalPoints)` ne protège pas le cas `totalPoints = 0`.
- **Fix** (backend):
  - Refus de soumission si le quiz n’a aucune question.
  - Refus de soumission si la somme des points est `<= 0`.
  - Validation que toutes les `question_id` soumises appartiennent bien au quiz.
- **Fichiers**:
  - `app/Http/Controllers/QuizAttemptController.php`
- **Vérification**:
  - Créer un quiz sans questions, tenter de soumettre: doit afficher une erreur et ne pas créer une tentative “passed”.
  - Créer un quiz avec questions mais points à 0, tenter de soumettre: doit afficher une erreur.

### [P0] Sécuriser les endpoints contre les POST directs (anti-triche)

- **Problème**: Même si l’UI bloque certains accès, un utilisateur pouvait tenter de “tricher” en appelant directement certains endpoints (ex: `lessons.complete`, `quizzes.submit`, `scorm.put`).
- **Cause**: Plusieurs endpoints ne validaient pas systématiquement:
  - l’inscription au cours (ou rôle admin)
  - les prérequis
  - le déverrouillage (contenu accessible dans la progression)
- **Fix**:
  - Ajout des checks (enrollment + prerequisites + unlocked) sur:
    - `LessonController@complete`
    - `QuizAttemptController@start` / `QuizAttemptController@submit`
    - `ScormController@get` / `ScormController@put`
  - `ScormController@put` crée désormais le `UserProgress` si absent (aligné avec `get`).
- **Fichiers**:
  - `app/Http/Controllers/LessonController.php`
  - `app/Http/Controllers/QuizAttemptController.php`
  - `app/Http/Controllers/ScormController.php`
- **Vérification**:
  - Utilisateur non inscrit: appel direct des endpoints ci-dessus => 403.
  - Utilisateur inscrit mais contenu non débloqué: appel direct => 403.
  - Utilisateur admin: accès autorisé (pas de blocage par enrollment/unlock).

### [P1] Enforcer le `time_limit` des quiz côté backend + démarrage côté frontend

- **Problème**: Le `time_limit` était affiché côté UI mais n’était pas réellement appliqué côté serveur (risque de soumission tardive / contournement).
- **Cause**: Absence de tentative “en cours” créée au démarrage et absence de vérification systématique au submit.
- **Fix**:
  - Backend:
    - `QuizAttemptController@start`: crée (ou réutilise) une tentative `quiz_attempts` avec `completed_at = null`.
    - `QuizAttemptController@submit`: utilise la tentative “en cours” et refuse si la deadline est dépassée.
  - Frontend:
    - `QuizPlayer`: appelle `POST quizzes.start` au clic “Start Quiz” via `fetch` (JSON), pour que le timer serveur démarre.
  - Ajout du `<meta name="csrf-token">` côté Blade (déjà requis par `scorm-adapter`).
- **Fichiers**:
  - `app/Http/Controllers/QuizAttemptController.php`
  - `resources/js/components/quiz-player.tsx`
  - `resources/views/app.blade.php`
- **Vérification**:
  - Créer un quiz avec `time_limit = 1`.
  - Start le quiz, attendre > 1 min, puis submit: doit refuser et forcer une tentative échouée.

### [P1] Afficher les erreurs quiz côté UI

- **Problème**: En cas d’erreur backend (ex: time limit dépassé), l’UI affichait un message générique.
- **Cause**: Le composant affichait toujours “Please answer all required questions.” dès qu’il y avait des erreurs.
- **Fix**: Affichage prioritaire de `errors.error` (ou du premier message d’erreur disponible).
- **Fichiers**:
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Dépasser le `time_limit` puis submit: le message renvoyé par le backend doit s’afficher.

### [P1] Countdown UI + validation “toutes les questions répondues”

- **Problème**:
  - Le timer n’était pas affiché (placeholder).
  - Un utilisateur pouvait tenter de soumettre un quiz incomplet (questions non répondues) et obtenir un résultat incohérent.
- **Cause**:
  - Pas de données “deadline” renvoyées par `quizzes.start`.
  - Validation `answers` trop permissive (pas de contrôle par question du quiz).
- **Fix**:
  - Backend:
    - `QuizAttemptController@start` renvoie désormais `started_at` et `deadline_at` en JSON (si `time_limit` défini).
    - `QuizAttemptController@submit` refuse si une question du quiz n’a pas de réponse (option manquante / texte vide).
    - Suppression des réponses existantes de la tentative “en cours” avant ré-écriture (idempotent).
  - Frontend:
    - `QuizPlayer` affiche un compte à rebours et resynchronise le countdown sur `deadline_at` si disponible.
- **Fichiers**:
  - `app/Http/Controllers/QuizAttemptController.php`
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Lancer un quiz avec `time_limit`:
    - le bandeau doit afficher un compte à rebours (mm:ss).
  - Laisser une question vide puis submit:
    - le backend doit refuser avec une erreur explicite.

### [P2] Bloquer la soumission côté UI quand le timer est à 0

- **Problème**: L’utilisateur pouvait encore cliquer sur “Submit Quiz” à `00:00`, entraînant un roundtrip inutile (le backend refuse, mais UX confuse).
- **Cause**: Le bouton et le handler ne prenaient pas en compte l’expiration du timer côté client.
- **Fix**:
  - Désactivation du bouton “Submit Quiz” quand `timeLeftSeconds <= 0`.
  - Guard côté client dans `submitQuiz` + message explicite.
- **Fichiers**:
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Attendre que le timer atteigne `00:00`:
    - le bouton Submit doit être désactivé.
    - un message d’erreur clair doit s’afficher si l’utilisateur tente de soumettre.

### [P1] Progression quiz cohérente après retake

- **Problème**: Après avoir réussi un quiz, un retake échoué pouvait faire apparaître l’écran “Quiz Failed” alors que la progression du contenu reste validée (via `UserProgress.completed_at`).
- **Cause**: Le composant UI affichait systématiquement la dernière tentative (`attempts[0]`) comme état principal.
- **Fix**: Priorisation de la tentative la plus récente avec `passed = true` pour l’état affiché (fallback sur la dernière tentative si aucune réussite).
- **Fichiers**:
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Réussir un quiz (création `UserProgress.completed_at`).
  - Refaire le quiz et échouer.
  - L’écran doit continuer à afficher “Quiz Passed!” (progression cohérente), l’historique doit montrer les tentatives.

### [P2] Clarifier la politique de retake côté UI

- **Problème**: Après une réussite, le bouton “Retake” et l’écran de résultats pouvaient prêter à confusion (“est-ce que j’ai perdu ma complétion ?”).
- **Cause**: Pas de message expliquant que la complétion est basée sur `UserProgress.completed_at` et qu’un retake n’annule pas la complétion.
- **Fix**:
  - Ajout d’un message informatif “Quiz Completed”.
  - Renommage du bouton en “Practice Again” lorsque le quiz a déjà été réussi.
- **Fichiers**:
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Réussir un quiz puis revenir sur la leçon: le message doit expliquer que les retakes n’affectent pas la complétion.

### [P2] Timer UI: correction ESLint / nettoyage d’état

- **Problème**: ESLint signalait un `setState` synchrone dans un `useEffect`.
- **Cause**: Réinitialisation de `timeLeftSeconds` directement dans le corps de l’effet.
- **Fix**: Réinitialisation de l’état timer lors des transitions (submit/cancel) plutôt que dans l’effet.
- **Fichiers**:
  - `resources/js/components/quiz-player.tsx`

### [P2] Réduire les faux positifs Intelephense sur `Auth::user()`

- **Problème**: Intelephense signalait des erreurs “Undefined method `isAdmin()` / `courses()`” sur des contrôleurs, car `Auth::user()` est typé de manière générique.
- **Cause**: Manque de type narrowing explicite vers `App\Models\User`.
- **Fix**: Récupération de l’utilisateur courant via `User::findOrFail(Auth::id())` dans les contrôleurs modifiés.
- **Fichiers**:
  - `app/Http/Controllers/LessonController.php`
  - `app/Http/Controllers/QuizAttemptController.php`
  - `app/Http/Controllers/ScormController.php`

### [P2] Politique de retake: “Practice” après réussite (sans impacter la complétion)

- **Problème**: Après réussite, l’utilisateur pouvait relancer “Start Quiz” / créer des tentatives supplémentaires sans distinction claire entre “retake officiel” et “practice”, ce qui rend l’historique bruyant et peut prêter à confusion.
- **Cause**: Absence de politique explicite côté backend sur la création de nouvelles tentatives après un `passed`.
- **Fix**:
  - Backend (`QuizAttemptController@start`): si une tentative `passed` existe pour l’utilisateur, refuser la création d’une nouvelle tentative sauf si `practice=1`.
  - Frontend (`QuizPlayer`): lorsque le quiz a déjà été réussi, le bouton “Practice Again” envoie `practice=1` sur `POST quizzes.start`.
  - Backend (`QuizAttemptController@submit`): évite de réécrire `UserProgress.completed_at` si déjà complété (la complétion reste stable).
- **Fichiers**:
  - `app/Http/Controllers/QuizAttemptController.php`
  - `resources/js/components/quiz-player.tsx`
- **Vérification**:
  - Réussir un quiz.
  - Revenir sur la leçon et cliquer “Start Quiz” (sans passer par “Practice Again”): doit être refusé.
  - Cliquer “Practice Again”: une nouvelle tentative doit démarrer.
  - Après un practice retake, la complétion du contenu (basée sur `UserProgress.completed_at`) doit rester acquise.
