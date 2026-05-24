<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fork&Find — Recipe Browser</title>
    <link rel="stylesheet" href="/Recipe_Browser_App/assets/css/index.css">
</head>
<body>
<nav>
  <div class="nav-logo">Fork<span>&</span>Find</div>
  <button type="button" id="nav-toggle" class="nav-toggle" aria-label="Open menu" aria-controls="nav-links" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-links" id="nav-links">
    <a href="#home" class="active">Home</a>
    <a href="#recipes">Recipes</a>
    <a href="#cuisines">Cuisines</a>
    <a href="#nutrition">Nutrition</a>
    <a href="#favorites" id="nav-favorites">Favorites</a>
    <div class="nav-auth">
      <div id="google-signin-btn" class="google-signin-slot"></div>
      <div id="auth-user" class="auth-user" hidden>
        <img id="auth-avatar" class="auth-avatar" alt="Signed in user avatar">
        <span id="auth-name" class="auth-name"></span>
        <button type="button" id="google-signout-btn" class="nav-cta nav-cta--ghost">Sign out</button>
      </div>
    </div>
  </div>
</nav>
<div id="nav-backdrop" class="nav-backdrop" aria-hidden="true"></div>

<!-- ── HERO ────────────────────────────────────── -->
<section id="home" class="hero hero--no-padding">
  <div class="hero-left">
    <div class="hero-tag">Powered by TheMealDB &amp; Spoonacular</div>
    <h1 class="hero-title">
      Discover <em>Recipes</em><br>From Every<br>Corner of the World
    </h1>
    <p class="hero-desc">
      Search thousands of dishes, explore cuisines, check nutritional info, and watch cooking tutorials — all in one beautifully crafted app.
    </p>
    <div class="hero-actions">
      <a href="#recipes" id="explore-recipes-btn" class="btn-primary">
        <span>🔍</span> Explore Recipes
      </a>
      <a href="#" class="btn-secondary">
        <span>🎲</span> Random Recipe
      </a>
    </div>
    <div class="hero-stats">
      <div>
        <div class="stat-num">50K+</div>
        <div class="stat-lbl">Recipes Available</div>
      </div>
      <div>
        <div class="stat-num">120+</div>
        <div class="stat-lbl">Cuisines &amp; Regions</div>
      </div>
      <div>
        <div class="stat-num">5</div>
        <div class="stat-lbl">Live API Sources</div>
      </div>
    </div>
  </div>

  <div class="hero-right">
    <div class="hero-bg-img"></div>
    <div class="hero-deco"></div>

    <div class="hero-float hf1 food-card">🥘</div>
    <div class="hero-float hf2 food-card">🍣</div>
    <div class="hero-float hf3 food-card">🥗</div>

    <div class="hero-badge">
      <div class="badge-icon">🔥</div>
      <div class="badge-text">
        Trending Now
        <span>Adobo &amp; 12 more</span>
      </div>
    </div>
  </div>
</section>

<!-- ── SEARCH BAR ───────────────────────────────── -->
<div class="search-section">
  <div class="search-card">
    <div class="search-input-wrap">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input class="search-input" type="text" placeholder="Search by recipe name, ingredient, or keyword…" />
    </div>
    <div class="search-divider"></div>
    <select class="search-select">
      <option>All Categories</option>
      <option>Breakfast</option>
      <option>Dessert</option>
      <option>Seafood</option>
      <option>Vegetarian</option>
      <option>Beef</option>
      <option>Pasta</option>
    </select>
    <div class="search-divider"></div>
    <select class="search-select">
      <option>All Cuisines</option>
      <option>Filipino</option>
      <option>Italian</option>
      <option>Japanese</option>
      <option>Mexican</option>
      <option>Indian</option>
    </select>
    <div class="search-divider"></div>
    <select class="search-diet">
      <option>All Diets</option>
      <option>Vegetarian</option>
      <option>Vegan</option>
      <option>Pescetarian</option>
      <option>Gluten Free</option>
      <option>Ketogenic</option>
    </select>
    <button class="search-btn">Search</button>
  </div>
</div>

<!-- ── CATEGORIES ──────────────────────────────── -->
<section class="categories-bg reveal">
  <div class="section-header">
    <div>
      <div class="section-label">Browse By</div>
      <h2 class="section-title">Meal Categories</h2>
    </div>
    <a href="#" class="section-link">All Categories</a>
  </div>
  <div class="cat-grid">
    <div class="cat-pill active"><div class="cat-icon">🍳</div><div class="cat-name">Breakfast</div></div>
    <div class="cat-pill"><div class="cat-icon">🥗</div><div class="cat-name">Vegetarian</div></div>
    <div class="cat-pill"><div class="cat-icon">🍖</div><div class="cat-name">Beef</div></div>
    <div class="cat-pill"><div class="cat-icon">🐔</div><div class="cat-name">Chicken</div></div>
    <div class="cat-pill"><div class="cat-icon">🦐</div><div class="cat-name">Seafood</div></div>
    <div class="cat-pill"><div class="cat-icon">🍰</div><div class="cat-name">Dessert</div></div>
    <div class="cat-pill"><div class="cat-icon">🍝</div><div class="cat-name">Pasta</div></div>
  </div>
</section>

<!-- ── FEATURED RECIPES ────────────────────────── -->
<section id="recipes" class="reveal">
  <div class="section-header">
    <div>
      <div class="section-label">Curated For You</div>
      <h2 class="section-title">Featured Recipes</h2>
    </div>
    <a href="#" class="section-link">View All</a>
  </div>
  <div class="recipes-grid">

    <!-- Large Card -->
    <div class="recipe-card large">
      <div class="recipe-img">🥘</div>
      <div class="recipe-body">
        <div class="recipe-tags">
          <span class="tag tag-cuisine">Filipino</span>
          <span class="tag tag-cat">Main Course</span>
          <span class="tag tag-diet">Halal</span>
        </div>
        <div class="recipe-name">Chicken Adobo — The Classic Filipino Slow Braise</div>
        <p style="font-size:.875rem;color:var(--ink-60);line-height:1.6;margin-top:8px;">
          Tender chicken braised in vinegar, soy sauce, garlic and bay leaves — the quintessential comfort dish of the Philippine archipelago.
        </p>
        <div class="recipe-meta">
          <span class="meta-item">⏱ 45 min</span>
          <span class="meta-item">🍽 4 servings</span>
          <span class="meta-item">🔥 380 kcal</span>
          <span class="recipe-rating">★ 4.9</span>
        </div>
      </div>
    </div>

    <!-- Small cards -->
    <div class="recipe-card reveal reveal-d1">
      <div class="recipe-img" style="height:180px;font-size:4rem;display:flex;align-items:center;justify-content:center;">🍣</div>
      <div class="recipe-body">
        <div class="recipe-tags"><span class="tag tag-cuisine">Japanese</span></div>
        <div class="recipe-name">Salmon Nigiri Sushi</div>
        <div class="recipe-meta">
          <span class="meta-item">⏱ 20 min</span>
          <span class="recipe-rating">★ 4.8</span>
        </div>
      </div>
    </div>

    <div class="recipe-card reveal reveal-d2">
      <div class="recipe-img" style="height:180px;font-size:4rem;display:flex;align-items:center;justify-content:center;">🍕</div>
      <div class="recipe-body">
        <div class="recipe-tags"><span class="tag tag-cuisine">Italian</span></div>
        <div class="recipe-name">Neapolitan Margherita Pizza</div>
        <div class="recipe-meta">
          <span class="meta-item">⏱ 35 min</span>
          <span class="recipe-rating">★ 4.7</span>
        </div>
      </div>
    </div>

    <div class="recipe-card reveal reveal-d1">
      <div class="recipe-img" style="height:180px;font-size:4rem;display:flex;align-items:center;justify-content:center;">🌮</div>
      <div class="recipe-body">
        <div class="recipe-tags"><span class="tag tag-cuisine">Mexican</span></div>
        <div class="recipe-name">Birria Beef Tacos</div>
        <div class="recipe-meta">
          <span class="meta-item">⏱ 3 hrs</span>
          <span class="recipe-rating">★ 5.0</span>
        </div>
      </div>
    </div>

    <div class="recipe-card reveal reveal-d2">
      <div class="recipe-img" style="height:180px;font-size:4rem;display:flex;align-items:center;justify-content:center;">🍛</div>
      <div class="recipe-body">
        <div class="recipe-tags"><span class="tag tag-cuisine">Indian</span></div>
        <div class="recipe-name">Butter Chicken Masala</div>
        <div class="recipe-meta">
          <span class="meta-item">⏱ 50 min</span>
          <span class="recipe-rating">★ 4.9</span>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ── CUISINES STRIP ───────────────────────────── -->
<section id="cuisines" class="cuisines-bg reveal cuisines-bg--padded">
  <div class="section-header section-header--tight">
    <div>
      <div class="section-label">Explore The World</div>
      <h2 class="section-title">Browse By Cuisine</h2>
    </div>
    <a href="#" class="section-link section-link--amber-lt">All Cuisines</a>
  </div>
  <div class="cuisine-strip">
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/ph.svg" alt="Philippines" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/ph.svg'">
          </picture>
          <div class="cuisine-name">Filipino</div>
        </div>
        <div class="cuisine-count">148 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/jp.svg" alt="Japan" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/jp.svg'">
          </picture>
          <div class="cuisine-name">Japanese</div>
        </div>
        <div class="cuisine-count">230 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/it.svg" alt="Italy" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/it.svg'">
          </picture>
          <div class="cuisine-name">Italian</div>
        </div>
        <div class="cuisine-count">312 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/mx.svg" alt="Mexico" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/mx.svg'">
          </picture>
          <div class="cuisine-name">Mexican</div>
        </div>
        <div class="cuisine-count">176 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/in.svg" alt="India" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/in.svg'">
          </picture>
          <div class="cuisine-name">Indian</div>
        </div>
        <div class="cuisine-count">285 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/kr.svg" alt="South Korea" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/kr.svg'">
          </picture>
          <div class="cuisine-name">Korean</div>
        </div>
        <div class="cuisine-count">163 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/fr.svg" alt="France" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/fr.svg'">
          </picture>
          <div class="cuisine-name">French</div>
        </div>
        <div class="cuisine-count">204 recipes</div>
      </div>
    </div>
    <div class="cuisine-item">
      <div class="cuisine-thumb"></div>
      <div class="cuisine-overlay">
        <div class="cuisine-overlay-top">
          <picture class="cuisine-flag" aria-hidden="true">
            <img src="/Recipe_Browser_App/assets/img/flags/cn.svg" alt="China" width="54" decoding="async" onerror="this.onerror=null;this.src='https://flagcdn.com/cn.svg'">
          </picture>
          <div class="cuisine-name">Chinese</div>
        </div>
        <div class="cuisine-count">267 recipes</div>
      </div>
    </div>
  </div>
</section>

<!-- ── NUTRITION ────────────────────────────────── -->
<section id="nutrition" class="nutrition-section reveal">
  <div class="nutrition-layout">
    <div class="nutrition-text">
      <div class="section-label">Powered by Spoonacular API</div>
      <h2 class="section-title">Full Nutritional<br>Breakdown</h2>
      <p>Every recipe includes real-time calorie count, macronutrient split, dietary labels, and serving size data pulled directly from the Spoonacular API — so you always know what you're eating.</p>
      <a href="#nutrition" id="see-nutrition-btn" class="btn-primary" style="display:inline-flex;">See Nutrition Details</a>
    </div>
    <div class="nutrition-card-visual reveal reveal-d2">
      <div class="nut-title">🥘 Chicken Adobo — Nutritional Info</div>
      <div class="nut-macros">
        <div class="macro-box"><div class="macro-val">380</div><div class="macro-lbl">Calories</div></div>
        <div class="macro-box"><div class="macro-val">28g</div><div class="macro-lbl">Protein</div></div>
        <div class="macro-box"><div class="macro-val">18g</div><div class="macro-lbl">Fat</div></div>
        <div class="macro-box"><div class="macro-val">22g</div><div class="macro-lbl">Carbs</div></div>
      </div>
      <div class="nut-bars">
        <div class="nut-bar-row">
          <div class="nut-bar-lbl">Protein</div>
          <div class="nut-bar-track"><div class="nut-bar-fill" style="width:72%;background:var(--amber);"></div></div>
          <div class="nut-bar-pct">72%</div>
        </div>
        <div class="nut-bar-row">
          <div class="nut-bar-lbl">Carbs</div>
          <div class="nut-bar-track"><div class="nut-bar-fill" style="width:46%;background:var(--green);"></div></div>
          <div class="nut-bar-pct">46%</div>
        </div>
        <div class="nut-bar-row">
          <div class="nut-bar-lbl">Fat</div>
          <div class="nut-bar-track"><div class="nut-bar-fill" style="width:38%;background:var(--red);"></div></div>
          <div class="nut-bar-pct">38%</div>
        </div>
        <div class="nut-bar-row">
          <div class="nut-bar-lbl">Fiber</div>
          <div class="nut-bar-track"><div class="nut-bar-fill" style="width:22%;background:var(--amber-lt);"></div></div>
          <div class="nut-bar-pct">22%</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ── FEATURES ─────────────────────────────────── -->
<section class="features-bg reveal">
  <div class="section-header">
    <div>
      <div class="section-label">What You Can Do</div>
      <h2 class="section-title">Core Features</h2>
    </div>
  </div>
  <div class="features-grid">
    <div class="feature-card reveal">
      <div class="feat-icon" style="background:rgba(224,122,47,.12);">🔍</div>
      <div class="feat-title">Smart Recipe Search</div>
      <div class="feat-desc">Search by name, ingredient, or keyword with live queries to TheMealDB API.</div>
    </div>
    <div class="feature-card reveal reveal-d1">
      <div class="feat-icon" style="background:rgba(59,107,74,.12);">🌍</div>
      <div class="feat-title">Browse by Cuisine</div>
      <div class="feat-desc">Filter by country or regional cuisine — from Filipino to French, Japanese to Mexican.</div>
    </div>
    <div class="feature-card reveal reveal-d2">
      <div class="feat-icon" style="background:rgba(194,59,42,.10);">📊</div>
      <div class="feat-title">Nutritional Info</div>
      <div class="feat-desc">View calories, macros, and dietary flags powered by the Spoonacular API.</div>
    </div>
    <div class="feature-card reveal reveal-d3">
      <div class="feat-icon" style="background:rgba(26,18,8,.06);">🎲</div>
      <div class="feat-title">Random Recipe</div>
      <div class="feat-desc">Can't decide? Get a random recipe suggestion for spontaneous culinary inspiration.</div>
    </div>
    <div class="feature-card reveal">
      <div class="feat-icon" style="background:rgba(224,122,47,.12);">▶️</div>
      <div class="feat-title">Cooking Tutorials</div>
      <div class="feat-desc">Watch embedded YouTube tutorial videos for selected recipes via YouTube Data API v3.</div>
    </div>
    <div class="feature-card reveal reveal-d1">
      <div class="feat-icon" style="background:rgba(59,107,74,.12);">🔖</div>
      <div class="feat-title">Favorites &amp; Bookmarks</div>
      <div class="feat-desc">Save your preferred recipes locally for quick access anytime, even offline.</div>
    </div>
    <div class="feature-card reveal reveal-d2">
      <div class="feat-icon" style="background:rgba(194,59,42,.10);">🔐</div>
      <div class="feat-title">Google Sign-In</div>
      <div class="feat-desc">Securely log in with your Google account via OAuth 2.0 to sync your profile.</div>
    </div>
    <div class="feature-card reveal reveal-d3">
      <div class="feat-icon" style="background:rgba(26,18,8,.06);">🥦</div>
      <div class="feat-title">Dietary Filters</div>
      <div class="feat-desc">Edamam API provides health labels — vegan, gluten-free, low-carb, and more.</div>
    </div>
  </div>
</section>

<!-- ── API SOURCES ──────────────────────────────── -->
<div class="api-section reveal">
  <div class="section-label">Under the Hood</div>
  <h2 class="section-title">Integrated APIs</h2>
  <div class="api-row">
    <div class="api-badge"><div class="api-dot" style="background:#FF9800;"></div>TheMealDB API — Recipe Data</div>
    <div class="api-badge"><div class="api-dot" style="background:#4CAF50;"></div>Spoonacular API — Nutrition</div>
    <div class="api-badge"><div class="api-dot" style="background:#2196F3;"></div>Edamam API — Dietary Filters</div>
    <div class="api-badge"><div class="api-dot" style="background:#F44336;"></div>YouTube Data API v3 — Tutorials</div>
    <div class="api-badge"><div class="api-dot" style="background:#9C27B0;"></div>Google OAuth 2.0 — Auth</div>
  </div>
</div>

<!-- ── RANDOM RECIPE BANNER ─────────────────────── -->
<div class="random-banner reveal">
  <div class="rb-text">
    <div class="rb-tag">✨ Feeling Adventurous?</div>
    <div class="rb-title">Let Fate Choose<br>Your Next Meal</div>
    <div class="rb-desc">Hit the button and we'll pull a completely random recipe from TheMealDB — full instructions, ingredients, and a cooking video included.</div>
  </div>
  <a href="#" class="rb-btn">🎲 Surprise Me!</a>
</div>

<!-- ── FOOTER ────────────────────────────────────── -->
<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <div class="nav-logo">Fork<span style="color:var(--amber)">&</span>Find</div>
      <p>A client-side recipe browser app consuming multiple public APIs to bring you thousands of recipes from every corner of the world.</p>
      <p style="margin-top:14px;font-size:.75rem;font-family:var(--mono);color:var(--amber-lt);">Group: FourLoop · BSIT</p>
    </div>
    <div class="footer-col">
      <h4>Explore</h4>
      <a href="#">All Recipes</a>
      <a href="#">Categories</a>
      <a href="#">Cuisines</a>
      <a href="#">Vegetarian</a>
      <a href="#">Desserts</a>
    </div>
    <div class="footer-col">
      <h4>Features</h4>
      <a href="#">Nutritional Info</a>
      <a href="#">Cooking Videos</a>
      <a href="#">Random Recipe</a>
      <a href="#">Favorites</a>
      <a href="#">Sign In</a>
    </div>
    <div class="footer-col">
      <h4>APIs Used</h4>
      <a href="#">TheMealDB</a>
      <a href="#">Spoonacular</a>
      <a href="#">Edamam</a>
      <a href="#">YouTube v3</a>
      <a href="#">Google OAuth</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2025 Fork&amp;Find — Recipe Browser App</p>
    <div class="footer-team">Andriano · Orbiso · Solon · Torcende</div>
  </div>
</footer>
<script>
  window.GOOGLE_CLIENT_ID = '312956501946-oudsbfrn21rkeib6gn3de36eca5dvuf6.apps.googleusercontent.com';
  window.SPOONACULAR_API_KEY = '';
  window.YOUTUBE_API_KEY = 'AIzaSyCzB1upALciqU7GOixClxnnMJ-gNoJ3CCc';
</script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="/Recipe_Browser_App/assets/js/index.js"></script>
<div id="favorites-root"></div>
</body>
</html>