 const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Category pill toggle
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // -----------------------------
  // TheMealDB API client + UI glue
  // -----------------------------
  const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
  const SPOONACULAR_API_BASE = 'https://api.spoonacular.com/recipes';
  const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
  const SPOONACULAR_API_KEY = window.SPOONACULAR_API_KEY || '';
  const YOUTUBE_API_KEY = window.YOUTUBE_API_KEY || '';
  const GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || '';
  const GOOGLE_VERIFY_URL = '/Recipe_Browser_App/oauth_verify.php';
  const GOOGLE_LOGOUT_URL = '/Recipe_Browser_App/oauth_logout.php';
  const FAVORITES_API_URL = '/Recipe_Browser_App/favorites.php';

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }

  async function searchMealsByName(name) {
    if (!name) return null;
    const data = await fetchJSON(`${API_BASE}/search.php?s=${encodeURIComponent(name)}`);
    return data.meals;
  }

  async function getMealById(id) {
    const data = await fetchJSON(`${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    return data.meals ? data.meals[0] : null;
  }

  async function getRandomMeal() {
    const data = await fetchJSON(`${API_BASE}/random.php`);
    return data.meals ? data.meals[0] : null;
  }

  async function getMultipleRandom(count = 4) {
    const items = [];
    for (let i = 0; i < count; i++) {
      try {
        const m = await getRandomMeal();
        if (m) items.push(m);
      } catch (e) { console.warn('random fetch failed', e); }
    }
    return items;
  }

  async function filterByCategory(category) {
    const data = await fetchJSON(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals;
  }

  async function filterByArea(area) {
    const data = await fetchJSON(`${API_BASE}/filter.php?a=${encodeURIComponent(area)}`);
    return data.meals;
  }

  async function fetchCategoriesList() {
    const data = await fetchJSON(`${API_BASE}/list.php?c=list`);
    return data.meals; // array of {strCategory}
  }

  async function fetchAreasList() {
    const data = await fetchJSON(`${API_BASE}/list.php?a=list`);
    return data.meals; // array of {strArea}
  }

  function hashString(str) {
    let hash = 0;
    const input = String(str || '').trim().toLowerCase();
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function estimateNutrition(meal) {
    const h = hashString(meal?.strMeal || meal?.idMeal || 'meal');
    const category = String(meal?.strCategory || '').toLowerCase();
    const area = String(meal?.strArea || '').toLowerCase();
    let calories = 320 + (h % 280);
    if (/dessert|cake|sweet|pudding/.test(category)) calories += 140;
    if (/beef|pork|lamb/.test(category)) calories += 120;
    if (/salad|vegetarian|vegan/.test(category)) calories -= 80;
    if (/japanese|seafood|fish/.test(area)) calories -= 20;
    const protein = Math.max(10, Math.round(calories * 0.11));
    const fat = Math.max(8, Math.round(calories * 0.06));
    const carbs = Math.max(18, Math.round(calories * 0.14));
    const servings = 2 + (h % 4);
    return {
      source: 'Estimated',
      calories,
      protein,
      fat,
      carbs,
      servings,
    };
  }

  async function fetchSpoonacularNutrition(meal) {
    if (!SPOONACULAR_API_KEY) return null;
    try {
      const url = `${SPOONACULAR_API_BASE}/complexSearch?query=${encodeURIComponent(meal.strMeal)}&addRecipeNutrition=true&number=1&apiKey=${encodeURIComponent(SPOONACULAR_API_KEY)}`;
      const data = await fetchJSON(url);
      const hit = data && Array.isArray(data.results) ? data.results[0] : null;
      const nutrients = hit && hit.nutrition && Array.isArray(hit.nutrition.nutrients) ? hit.nutrition.nutrients : [];
      const pick = (name) => {
        const item = nutrients.find(n => String(n.name || '').toLowerCase() === String(name).toLowerCase());
        return item ? Math.round(item.amount) : null;
      };
      if (!hit) return null;
      return {
        source: 'Spoonacular',
        calories: (pick('Calories') ?? Math.round(hit.nutrition?.nutrients?.[0]?.amount || 0)) || 0,
        protein: pick('Protein') ?? 0,
        fat: pick('Fat') ?? 0,
        carbs: pick('Carbohydrates') ?? 0,
        servings: Math.max(1, Math.round(hit.servings || 1)),
      };
    } catch (err) {
      console.warn('Spoonacular nutrition lookup failed', err);
      return null;
    }
  }

  async function getNutritionSummary(meal) {
    const spoonacular = await fetchSpoonacularNutrition(meal);
    return spoonacular || estimateNutrition(meal);
  }

  function nutritionPanelMarkup(summary) {
    return `
      <div class="nutrition-panel" aria-label="Nutrition summary">
        <div class="nutrition-panel-head">
          <div class="nutrition-panel-title">Nutrition snapshot</div>
          <div class="nutrition-source">${summary.source === 'Spoonacular' ? 'Powered by Spoonacular' : 'Estimated from recipe data'}</div>
        </div>
        <div class="nutrition-grid">
          <div class="nutrition-box"><span class="nutrition-val">${summary.calories ?? '--'}</span><span class="nutrition-lbl">Calories</span></div>
          <div class="nutrition-box"><span class="nutrition-val">${summary.protein ?? '--'}g</span><span class="nutrition-lbl">Protein</span></div>
          <div class="nutrition-box"><span class="nutrition-val">${summary.fat ?? '--'}g</span><span class="nutrition-lbl">Fat</span></div>
          <div class="nutrition-box"><span class="nutrition-val">${summary.carbs ?? '--'}g</span><span class="nutrition-lbl">Carbs</span></div>
          <div class="nutrition-box"><span class="nutrition-val">${summary.servings ?? '--'}</span><span class="nutrition-lbl">Servings</span></div>
        </div>
      </div>
    `;
  }

  function extractYouTubeVideoId(url = '') {
    const text = String(url || '').trim();
    if (!text) return '';
    const match = text.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  async function fetchYouTubeTutorial(meal) {
    const fallbackId = extractYouTubeVideoId(meal?.strYoutube || '');
    if (fallbackId) {
      return {
        videoId: fallbackId,
        title: meal?.strMeal ? `${meal.strMeal} tutorial` : 'Cooking tutorial',
        channel: 'TheMealDB',
        source: 'TheMealDB',
      };
    }

    if (!YOUTUBE_API_KEY) return null;
    try {
      const query = [meal?.strMeal || '', meal?.strArea || '', meal?.strCategory || '', 'recipe cooking tutorial']
        .filter(Boolean)
        .join(' ');
      const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&videoEmbeddable=true&maxResults=1&safeSearch=strict&q=${encodeURIComponent(query)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`;
      const data = await fetchJSON(url);
      const item = data && Array.isArray(data.items) ? data.items[0] : null;
      const videoId = item?.id?.videoId;
      if (!videoId) return null;
      return {
        videoId,
        title: item?.snippet?.title || `${meal?.strMeal || 'Recipe'} tutorial`,
        channel: item?.snippet?.channelTitle || 'YouTube',
        source: 'YouTube Data API v3',
      };
    } catch (err) {
      console.warn('YouTube lookup failed', err);
      return null;
    }
  }

  function tutorialPanelMarkup(video) {
    if (!video || !video.videoId) {
      return `
        <div class="tutorial-panel tutorial-panel--empty">
          <div class="tutorial-title">Cooking tutorial</div>
          <div class="tutorial-meta">No video found for this recipe right now.</div>
        </div>
      `;
    }
    const src = `https://www.youtube-nocookie.com/embed/${video.videoId}`;
    return `
      <div class="tutorial-panel" aria-label="Cooking tutorial video">
        <div class="tutorial-head">
          <div class="tutorial-title">Cooking tutorial</div>
          <div class="tutorial-meta">${video.source} • ${video.channel}</div>
        </div>
        <div class="tutorial-embed-wrap">
          <iframe
            class="tutorial-embed"
            src="${src}"
            title="${video.title}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }

  // -----------------------------
  // Google Sign-In (GIS)
  // -----------------------------
  const authState = {
    user: null,
  };
  const favoritesState = {
    items: [],
    loaded: false,
    mode: 'local',
  };

  function getStoredGoogleUser() {
    try {
      return JSON.parse(localStorage.getItem('ff_google_user') || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveGoogleUser(user) {
    if (user) localStorage.setItem('ff_google_user', JSON.stringify(user));
    else localStorage.removeItem('ff_google_user');
  }

  function getLocalFavorites() {
    try { return JSON.parse(localStorage.getItem('ff_favorites') || '[]'); } catch (e) { return []; }
  }

  function saveLocalFavorites(list) {
    localStorage.setItem('ff_favorites', JSON.stringify(Array.isArray(list) ? list : []));
  }

  function normalizeFavorites(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();
    list.forEach(item => {
      if (!item || !item.idMeal || seen.has(item.idMeal)) return;
      seen.add(item.idMeal);
      out.push({
        idMeal: String(item.idMeal),
        strMeal: String(item.strMeal || ''),
        strMealThumb: String(item.strMealThumb || ''),
        strCategory: String(item.strCategory || ''),
        strArea: String(item.strArea || ''),
      });
    });
    return out;
  }

  function mergeFavorites(primary = [], secondary = []) {
    return normalizeFavorites([...(Array.isArray(primary) ? primary : []), ...(Array.isArray(secondary) ? secondary : [])]);
  }

  async function fetchServerFavorites() {
    const res = await fetch(FAVORITES_API_URL, { credentials: 'same-origin' });
    const data = await res.json();
    return data && data.authenticated ? normalizeFavorites(data.favorites || []) : [];
  }

  async function saveServerFavorites(list) {
    const res = await fetch(FAVORITES_API_URL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites: normalizeFavorites(list) }),
    });
    const data = await res.json();
    return data && data.authenticated ? normalizeFavorites(data.favorites || []) : null;
  }

  function refreshFavoriteButtons() {
    document.querySelectorAll('.fav-toggle').forEach(btn => {
      const id = btn.dataset.id;
      if (!id) return;
      const fav = isFavorited(id);
      btn.textContent = fav ? '♥' : '♡';
      btn.classList.toggle('active', fav);
    });
    document.querySelectorAll('.meal-fav-btn').forEach(btn => {
      const id = btn.dataset.id;
      if (!id) return;
      btn.textContent = isFavorited(id) ? '♥' : '♡';
    });
  }

  async function loadFavoritesForCurrentUser() {
    if (!authState.user || !authState.user.sub) {
      favoritesState.mode = 'local';
      favoritesState.loaded = true;
      favoritesState.items = normalizeFavorites(getLocalFavorites());
      refreshFavoriteButtons();
      return favoritesState.items;
    }

    const localFavorites = normalizeFavorites(getLocalFavorites());
    let serverFavorites = [];
    try {
      serverFavorites = await fetchServerFavorites();
    } catch (err) {
      console.warn('Failed to fetch server favorites', err);
    }

    let merged = serverFavorites;
    if (localFavorites.length) {
      merged = mergeFavorites(serverFavorites, localFavorites);
      try {
        await saveServerFavorites(merged);
        saveLocalFavorites([]);
      } catch (err) {
        console.warn('Failed to sync local favorites to server', err);
      }
    }

    favoritesState.mode = 'server';
    favoritesState.loaded = true;
    favoritesState.items = merged;
    refreshFavoriteButtons();
    return favoritesState.items;
  }

  function persistFavorites(list) {
    const normalized = normalizeFavorites(list);
    favoritesState.items = normalized;
    favoritesState.loaded = true;
    if (authState.user && authState.user.sub) {
      favoritesState.mode = 'server';
      void saveServerFavorites(normalized).catch(err => {
        console.warn('Failed to save favorites to server', err);
        saveLocalFavorites(normalized);
      });
    } else {
      favoritesState.mode = 'local';
      saveLocalFavorites(normalized);
    }
  }

  function setAuthUser(user) {
    authState.user = user || null;
    saveGoogleUser(authState.user);

    const slot = document.getElementById('google-signin-btn');
    const userWrap = document.getElementById('auth-user');
    const avatar = document.getElementById('auth-avatar');
    const name = document.getElementById('auth-name');
    const signout = document.getElementById('google-signout-btn');

    if (authState.user) {
      if (slot) slot.style.display = 'none';
      if (userWrap) userWrap.hidden = false;
      if (avatar) {
        avatar.src = authState.user.picture || '';
        avatar.alt = authState.user.name ? `${authState.user.name} avatar` : 'Signed in user avatar';
      }
      if (name) name.textContent = authState.user.name || authState.user.email || 'Signed in';
      if (signout) signout.hidden = false;
      void loadFavoritesForCurrentUser();
    } else {
      if (slot) slot.style.display = '';
      if (userWrap) userWrap.hidden = true;
      if (name) name.textContent = '';
      if (avatar) avatar.removeAttribute('src');
      if (signout) signout.hidden = true;
      favoritesState.mode = 'local';
      favoritesState.loaded = true;
      favoritesState.items = normalizeFavorites(getLocalFavorites());
      refreshFavoriteButtons();
    }
  }

  async function syncAuthFromServer() {
    try {
      const res = await fetch(GOOGLE_VERIFY_URL, { credentials: 'same-origin' });
      const data = await res.json();
      if (data && data.authenticated && data.user) {
        setAuthUser(data.user);
      } else if (authState.user) {
        setAuthUser(null);
      }
    } catch (err) {
      console.warn('Auth status check failed', err);
    }
  }

  async function handleGoogleCredentialResponse(response) {
    try {
      const res = await fetch(GOOGLE_VERIFY_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated || !data.user) {
        throw new Error(data.error || 'Google sign-in failed');
      }
      setAuthUser(data.user);
    } catch (err) {
      console.error(err);
      alert('Google sign-in could not be completed. Please try again.');
    }
  }

  function renderGoogleButtonWhenReady() {
    const target = document.getElementById('google-signin-btn');
    if (!target || !GOOGLE_CLIENT_ID) return;
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      window.setTimeout(renderGoogleButtonWhenReady, 250);
      return;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'medium',
        shape: 'pill',
        text: 'signin_with',
        width: 220,
      });
      window.google.accounts.id.prompt();
    } catch (err) {
      console.warn('Google Sign-In init failed', err);
    }
  }

  async function signOutGoogleUser() {
    try {
      await fetch(GOOGLE_LOGOUT_URL, { method: 'POST', credentials: 'same-origin' });
    } catch (err) {
      console.warn('Logout request failed', err);
    }
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (err) {
      console.warn('Google logout helper failed', err);
    }
    setAuthUser(null);
  }

  // Spoonacular search wrapper: returns array of meal-like objects compatible with renderRecipeCard
  async function spoonacularSearch(q = '', diet = '', cuisine = '') {
    if (!SPOONACULAR_API_KEY) return null;
    try {
      let url = `${SPOONACULAR_API_BASE}/complexSearch?number=40&addRecipeInformation=true&apiKey=${encodeURIComponent(SPOONACULAR_API_KEY)}`;
      if (q) url += `&query=${encodeURIComponent(q)}`;
      if (diet && diet !== 'All Diets') url += `&diet=${encodeURIComponent(diet.toLowerCase())}`;
      if (cuisine && cuisine !== 'All Cuisines') url += `&cuisine=${encodeURIComponent(cuisine)}`;
      const data = await fetchJSON(url);
      const results = data && Array.isArray(data.results) ? data.results.map(mapSpoonacularToMeal) : [];
      return results;
    } catch (err) {
      console.warn('Spoonacular search failed', err);
      return null;
    }
  }

  function mapSpoonacularToMeal(hit) {
    return {
      idMeal: `spoon_${hit.id}`,
      strMeal: hit.title || hit.name || '',
      strMealThumb: hit.image || '',
      strCategory: (hit.dishTypes && hit.dishTypes[0]) || '',
      strArea: (hit.cuisines && hit.cuisines[0]) || ''
    };
  }

  // Ensure items include ingredient fields by fetching full meal records when needed
  async function ensureFullMeals(items = []) {
    if (!items || !items.length) return [];
    if (items[0].strIngredient1) return items; // already full
    const out = [];
    for (const it of items) {
      try {
        const full = await getMealById(it.idMeal);
        if (full) out.push(full);
      } catch (e) { /* ignore */ }
    }
    return out;
  }

  // Heuristic diet filtering when Spoonacular isn't available
  async function heuristicFilterResults(items = [], diet = '', cuisine = '') {
    if (!items || !items.length) return [];
    let list = items.slice();
    if (cuisine && cuisine !== 'All Cuisines') {
      list = list.filter(m => (m.strArea || '').toLowerCase() === cuisine.toLowerCase());
    }
    if (!diet || diet === 'All Diets') return list;
    // ensure we have ingredient lists
    list = await ensureFullMeals(list);
    const meatRe = /chicken|beef|pork|lamb|bacon|shrimp|fish|anchovy|salmon|tuna|crab|lobster|veal|goat/i;
    const dairyRe = /milk|cheese|butter|yogurt|cream|egg/i;
    const glutenRe = /wheat|flour|pasta|breadcrumbs|bread|noodles|semolina/i;

    if (/vegetarian/i.test(diet)) {
      return list.filter(m => {
        let txt = '';
        for (let i = 1; i <= 20; i++) txt += ' ' + (m[`strIngredient${i}`] || '');
        return !meatRe.test(txt);
      });
    }
    if (/vegan/i.test(diet)) {
      return list.filter(m => {
        let txt = '';
        for (let i = 1; i <= 20; i++) txt += ' ' + (m[`strIngredient${i}`] || '');
        return !meatRe.test(txt) && !dairyRe.test(txt);
      });
    }
    if (/pescetarian/i.test(diet)) {
      return list.filter(m => {
        let txt = '';
        for (let i = 1; i <= 20; i++) txt += ' ' + (m[`strIngredient${i}`] || '');
        return !/beef|pork|chicken|lamb|bacon|veal|goat/i.test(txt);
      });
    }
    if (/gluten/i.test(diet)) {
      return list.filter(m => {
        let txt = '';
        for (let i = 1; i <= 20; i++) txt += ' ' + (m[`strIngredient${i}`] || '');
        return !glutenRe.test(txt);
      });
    }
    // other diets: return as-is
    return list;
  }

  // Loading UI
  function showLoader() {
    showGridSkeletons(6);
  }
  function hideLoader() {}

  // Render helpers
  function clearRecipes() {
    const grid = document.querySelector('.recipes-grid');
    if (!grid) return;
    grid.innerHTML = '';
  }

  const listState = {
    items: [],
    pageSize: 6,
    rendered: 0,
    busy: false,
  };

  function getRecipeGrid() {
    return document.querySelector('.recipes-grid');
  }

  function estimateRecipeMeta(meal) {
    const h = hashString(`${meal?.idMeal || ''}:${meal?.strMeal || ''}`);
    const category = String(meal?.strCategory || '').toLowerCase();
    const area = String(meal?.strArea || '').toLowerCase();
    const ingredientCount = Array.from({ length: 20 }, (_, i) => meal?.[`strIngredient${i + 1}`]).filter(Boolean).length || (6 + (h % 8));
    let minutes = 18 + (h % 38);
    if (/beef|lamb|pork|roast|slow|braise/.test(category)) minutes += 25;
    if (/dessert|cake|bread|pastry/.test(category)) minutes += 12;
    if (/fried|stir|grilled|pan/.test(category)) minutes += 8;
    if (/japanese|salad|sushi/.test(area)) minutes -= 6;
    const servings = 2 + (h % 4);
    const rating = (4.1 + ((h % 8) * 0.1)).toFixed(1);
    return {
      minutes: Math.max(10, minutes),
      servings,
      rating,
      ingredients: ingredientCount,
      badge: minutes <= 25 ? 'Quick pick' : servings >= 4 ? 'Family size' : 'Chef’s choice',
    };
  }

  function appendMeal(meal, large = false) {
    const grid = getRecipeGrid();
    if (!grid) return;
    grid.appendChild(renderRecipeCard(meal, large));
  }

  function renderNextBatch() {
    const grid = getRecipeGrid();
    if (!grid || listState.busy) return;
    listState.busy = true;

    const start = listState.rendered;
    const end = Math.min(start + listState.pageSize, listState.items.length);

    // remove any sentinel before appending new cards
    const existingSentinel = grid.querySelector('.infinite-sentinel');
    if (existingSentinel) existingSentinel.remove();

    for (let i = start; i < end; i++) {
      appendMeal(listState.items[i], i === 0 && start === 0);
    }

    listState.rendered = end;
    listState.busy = false;

    if (listState.rendered < listState.items.length) {
      const sentinel = document.createElement('div');
      sentinel.className = 'infinite-sentinel';
      sentinel.style.gridColumn = '1 / -1';
      sentinel.style.height = '1px';
      grid.appendChild(sentinel);
      observeInfiniteScroll(sentinel);
      updateLoadMoreControl();
    } else {
      updateLoadMoreControl();
    }
  }

  function setMealResults(items = []) {
    const grid = getRecipeGrid();
    if (!grid) return;
    listState.items = Array.isArray(items) ? items.filter(Boolean) : [];
    listState.rendered = 0;
    listState.busy = false;
    grid.innerHTML = '';

    if (!listState.items.length) {
      grid.innerHTML = `<div style="padding:40px;color:var(--ink-60)">No recipes found.</div>`;
      return;
    }

    showGridSkeletons(Math.min(6, Math.max(3, Math.min(listState.pageSize, listState.items.length))));
    window.requestAnimationFrame(() => {
      grid.innerHTML = '';
      renderNextBatch();
      ensureLoadMoreControl();
    });
  }

  let infiniteObserver = null;
  function observeInfiniteScroll(target) {
    if (infiniteObserver) infiniteObserver.disconnect();
    infiniteObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && listState.rendered < listState.items.length) {
          renderNextBatch();
        }
      });
    }, { root: null, threshold: 0.15 });
    infiniteObserver.observe(target);
  }

  // Load-more fallback UI
  function ensureLoadMoreControl() {
    const grid = getRecipeGrid();
    if (!grid) return;
    let wrap = document.querySelector('.load-more-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'load-more-wrap';
      wrap.innerHTML = '<button class="load-more-btn">Load more</button>';
      grid.parentNode.insertBefore(wrap, grid.nextSibling);
      wrap.querySelector('.load-more-btn').addEventListener('click', (e) => {
        e.preventDefault();
        renderNextBatch();
      });
    }
    updateLoadMoreControl();
  }

  function updateLoadMoreControl() {
    const btn = document.querySelector('.load-more-btn');
    if (!btn) return;
    if (listState.rendered < listState.items.length) {
      btn.style.display = '';
      btn.disabled = listState.busy;
    } else {
      btn.style.display = 'none';
    }
  }

  function renderRecipeCard(meal, large = false) {
    const div = document.createElement('div');
    div.className = `recipe-card${large ? ' large' : ''}`;
    div.dataset.id = meal.idMeal;
    const meta = estimateRecipeMeta(meal);
    div.innerHTML = `
      <div class="recipe-img">
        <img loading="lazy" src="${meal.strMealThumb || ''}" alt="${meal.strMeal}" />
        <button class="fav-toggle" data-id="${meal.idMeal}" aria-label="Toggle favorite">${isFavorited(meal.idMeal) ? '♥' : '♡'}</button>
        <div class="img-overlay"><div class="overlay-title">${meal.strMeal}</div></div>
      </div>
      <div class="recipe-body">
        <div class="recipe-tags"><span class="tag tag-cuisine">${meal.strArea || ''}</span><span class="tag tag-cat">${meal.strCategory || ''}</span></div>
        <div class="recipe-name">${meal.strMeal}</div>
        <div class="recipe-meta">
          <span class="meta-item">⏱ ${meta.minutes} min</span>
          <span class="meta-item">🍽 ${meta.servings} servings</span>
          <span class="meta-item">🥕 ${meta.ingredients} ingredients</span>
          <span class="recipe-rating">★ ${meta.rating}</span>
        </div>
        <div class="recipe-microcopy">${meta.badge}</div>
      </div>
    `;
    // click to open detail
    div.addEventListener('click', async (ev) => {
      // ignore if clicking favorite button
      if (ev.target.closest('.fav-toggle')) return;
      const id = div.dataset.id;
      const full = await getMealById(id);
      if (full) showMealModal(full);
    });

    // favorite toggle on card
    const favBtn = div.querySelector('.fav-toggle');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb, strCategory: meal.strCategory, strArea: meal.strArea });
        updateFavButtons(meal.idMeal);
      });
    }
    return div;
  }

  function renderMealsList(meals) {
    setMealResults(meals);
  }

  // Grid skeletons while loading
  function showGridSkeletons(count = 4) {
    const grid = document.querySelector('.recipes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'recipe-card skeleton';
      s.innerHTML = `<div class="recipe-img skeleton-img"></div><div class="recipe-body"><div class="s-line s-title"></div><div class="s-line"></div></div>`;
      grid.appendChild(s);
    }
  }

  // Modal for meal details
  function showMealModal(meal) {
    const existing = document.querySelector('.meal-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'meal-modal';
    const meta = estimateRecipeMeta(meal);
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const amt = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(`
          <li class="ingredient-item">
            <span class="ingredient-name">${ing}</span>
            <span class="ingredient-measure">${amt || '—'}</span>
          </li>
        `);
      }
    }
    const nutritionPlaceholder = '<div class="nutrition-panel"><div class="nutrition-panel-head"><div class="nutrition-panel-title">Nutrition snapshot</div><div class="nutrition-source">Loading...</div></div></div>';
    const tutorialPlaceholder = '<div class="tutorial-panel"><div class="tutorial-head"><div class="tutorial-title">Cooking tutorial</div><div class="tutorial-meta">Loading...</div></div></div>';

    modal.innerHTML = `
      <div class="meal-modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;">
        <div class="meal-modal-card" style="background:#fff;border-radius:12px;max-width:900px;width:100%;max-height:90vh;overflow:auto;position:relative;padding:20px;color:var(--ink);">
          <button class="meal-modal-close" style="position:absolute;right:12px;top:12px;padding:8px 10px;border-radius:8px;border:none;background:var(--amber);color:#fff;font-weight:700;">Close</button>
          <div class="meal-modal-layout" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">
            <div><img src="${meal.strMealThumb || ''}" alt="${meal.strMeal}" style="width:100%;border-radius:8px;object-fit:cover;"/></div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <h2 style="font-family:var(--serif);margin:0">${meal.strMeal}</h2>
                <button class="meal-fav-btn" data-id="${meal.idMeal}" aria-label="Toggle favorite">${isFavorited(meal.idMeal) ? '♥' : '♡'}</button>
              </div>
              <div style="color:var(--ink-60);margin-bottom:8px">${meal.strArea || ''} • ${meal.strCategory || ''}</div>
              <div class="recipe-meta modal-meta">
                <span class="meta-item">⏱ ${meta.minutes} min</span>
                <span class="meta-item">🍽 ${meta.servings} servings</span>
                <span class="meta-item">🥕 ${meta.ingredients} ingredients</span>
                <span class="recipe-rating">★ ${meta.rating}</span>
              </div>
              <div class="recipe-microcopy recipe-microcopy--modal">${meta.badge} • ${meal.strSource || 'TheMealDB recipe'}${meal.strTags ? ` • ${meal.strTags}` : ''}</div>
              <div class="meal-nutrition-slot">${nutritionPlaceholder}</div>
              <div class="meal-tutorial-slot">${tutorialPlaceholder}</div>
              <h4 class="modal-section-title">Ingredients</h4>
              <ul class="ingredient-list">${ingredients.join('')}</ul>
              <h4 class="modal-section-title">Instructions</h4>
              <p style="white-space:pre-line;line-height:1.6;color:var(--ink-60)">${meal.strInstructions || ''}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // append and enhance accessibility + focus trap
    document.body.appendChild(modal);
    const modalCard = modal.querySelector('.meal-modal-card');
    if (modalCard) {
      modalCard.setAttribute('role', 'dialog');
      modalCard.setAttribute('aria-modal', 'true');
      modalCard.setAttribute('aria-label', `${meal.strMeal} details`);
      modalCard.setAttribute('tabindex', '-1');
    }

    const closeBtn = modal.querySelector('.meal-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { cleanup(); modal.remove(); });
    modal.querySelector('.meal-modal-backdrop').addEventListener('click', (e) => { if (e.target === modal.querySelector('.meal-modal-backdrop')) { cleanup(); modal.remove(); } });

    // meal modal favorite toggle
    const mf = modal.querySelector('.meal-fav-btn');
    if (mf) {
      mf.addEventListener('click', (ev) => {
        ev.stopPropagation();
        toggleFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb, strCategory: meal.strCategory, strArea: meal.strArea });
        // update button state
        mf.textContent = isFavorited(meal.idMeal) ? '♥' : '♡';
        updateFavButtons(meal.idMeal);
      });
    }

    // nutrition lookup / fallback
    (async () => {
      const slot = modal.querySelector('.meal-nutrition-slot');
      if (!slot) return;
      try {
        const summary = await getNutritionSummary(meal);
        slot.innerHTML = nutritionPanelMarkup(summary);
      } catch (err) {
        slot.innerHTML = nutritionPanelMarkup(estimateNutrition(meal));
      }
    })();

    // tutorial lookup / fallback
    (async () => {
      const slot = modal.querySelector('.meal-tutorial-slot');
      if (!slot) return;
      try {
        const video = await fetchYouTubeTutorial(meal);
        slot.innerHTML = tutorialPanelMarkup(video);
      } catch (err) {
        slot.innerHTML = tutorialPanelMarkup(null);
      }
    })();

    // focus trap
    const cleanup = trapFocus(modalCard, () => { if (modal) modal.remove(); });
  }

  // UI bindings
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  const selects = document.querySelectorAll('.search-select');
  const rbBtn = document.querySelector('.rb-btn');
  const exploreRecipesBtn = document.getElementById('explore-recipes-btn');
  const seeNutritionBtn = document.getElementById('see-nutrition-btn');
  const navToggle = document.getElementById('nav-toggle');
  const navBackdrop = document.getElementById('nav-backdrop');

  function isMobileNavViewport() {
    return window.matchMedia('(max-width: 1023px)').matches;
  }
  function openMobileNav() {
    document.body.classList.add('nav-open');
    document.getElementById('nav-links')?.classList.add('nav-open');
    document.getElementById('nav-backdrop')?.classList.add('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    document.getElementById('nav-links')?.classList.remove('nav-open');
    document.getElementById('nav-backdrop')?.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (document.body.classList.contains('nav-open')) closeMobileNav();
      else openMobileNav();
    });
  }
  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMobileNav);
  }
  window.addEventListener('resize', () => {
    if (!isMobileNavViewport()) closeMobileNav();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeMobileNav();
  });

  function smoothScrollTo(selector) {
    try {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // section flash
      target.classList.remove('section-flash');
      // force reflow for repeat animation
      void target.offsetWidth;
      target.classList.add('section-flash');
    } catch (e) {
      console.warn('Invalid selector for scroll', selector);
    }
  }

  const SECTION_HASHES = ['#home', '#recipes', '#cuisines', '#nutrition'];
  const navSectionLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'))
    .filter(a => SECTION_HASHES.includes(a.getAttribute('href')));

  function setActiveNavByHash(hash) {
    navSectionLinks.forEach(link => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function observeActiveSections() {
    const sections = SECTION_HASHES
      .map(h => document.querySelector(h))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!best || entry.intersectionRatio > best.intersectionRatio) {
          best = entry;
        }
      });
      if (best && best.target && best.target.id) {
        setActiveNavByHash(`#${best.target.id}`);
      }
    }, {
      root: null,
      threshold: [0.25, 0.5, 0.75],
      rootMargin: '-20% 0px -55% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  if (exploreRecipesBtn) {
    exploreRecipesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('#recipes');
      setActiveNavByHash('#recipes');
      if (searchInput) {
        window.setTimeout(() => {
          try { searchInput.focus(); } catch (err) {}
        }, 450);
      }
    });
  }

  if (seeNutritionBtn) {
    seeNutritionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('#nutrition');
      setActiveNavByHash('#nutrition');
    });
  }

  // ----------------
  // Favorites store
  // ----------------
  function getFavorites() {
    if (favoritesState.loaded) return favoritesState.items;
    return normalizeFavorites(getLocalFavorites());
  }
  function isFavorited(id) { return !!getFavorites().find(f => f.idMeal === id); }
  function toggleFavorite(minimal) {
    if (!minimal || !minimal.idMeal) return;
    const list = getFavorites();
    const idx = list.findIndex(f => f.idMeal === minimal.idMeal);
    if (idx > -1) { list.splice(idx, 1); }
    else { list.unshift(minimal); }
    persistFavorites(list);
    refreshFavoriteButtons();
  }
  function updateFavButtons(id) {
    document.querySelectorAll(`.fav-toggle[data-id="${id}"]`).forEach(btn => {
      const fav = isFavorited(id);
      btn.textContent = fav ? '♥' : '♡';
      btn.classList.toggle('active', fav);
    });
    document.querySelectorAll(`.meal-fav-btn[data-id="${id}"]`).forEach(b => { b.textContent = isFavorited(id) ? '♥' : '♡'; });
  }

  // show favorites modal/panel
  async function showFavoritesPanel() {
    const existing = document.querySelector('.favorites-modal');
    if (existing) { existing.remove(); return; }
    if (authState.user && authState.user.sub && !favoritesState.loaded) {
      await loadFavoritesForCurrentUser();
    }
    const favs = getFavorites();
    const modal = document.createElement('div');
    modal.className = 'favorites-modal';
    modal.innerHTML = `
      <div class="meal-modal-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;">
        <div class="meal-modal-card" style="background:#fff;border-radius:12px;max-width:900px;width:100%;max-height:90vh;overflow:auto;position:relative;padding:20px;color:var(--ink);">
          <button class="meal-modal-close" style="position:absolute;right:12px;top:12px;padding:8px 10px;border-radius:8px;border:none;background:var(--amber);color:#fff;font-weight:700;">Close</button>
          <h3 style="font-family:var(--serif);margin-bottom:12px">Favorites</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
            ${favs.length ? favs.map(f => `
              <div class="recipe-card small-fav" data-id="${f.idMeal}" style="cursor:pointer">
                <div class="recipe-img"><img src="${f.strMealThumb||''}" alt="${f.strMeal}" /><div class="img-overlay"><div class="overlay-title">${f.strMeal}</div></div></div>
                <div class="recipe-body"><div class="recipe-name">${f.strMeal}</div><div style="margin-top:8px"><button class="remove-fav" data-id="${f.idMeal}" style="background:transparent;border:1px solid var(--border);padding:6px 8px;border-radius:8px;cursor:pointer">Remove</button></div></div>
              </div>
            `).join('') : '<div style="padding:20px;color:var(--ink-60)">No favorites yet.</div>'}
          </div>
        </div>
      </div>
    `;
    // append and accessibility
    document.body.appendChild(modal);
    const modalCard = modal.querySelector('.meal-modal-card');
    if (modalCard) {
      modalCard.setAttribute('role', 'dialog');
      modalCard.setAttribute('aria-modal', 'true');
      modalCard.setAttribute('aria-label', 'Favorites');
      modalCard.setAttribute('tabindex', '-1');
    }
    const closeBtn = modal.querySelector('.meal-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { cleanup(); modal.remove(); document.getElementById('nav-favorites')?.setAttribute('aria-expanded','false'); });
    modal.querySelector('.meal-modal-backdrop').addEventListener('click', (e) => { if (e.target === modal.querySelector('.meal-modal-backdrop')) { cleanup(); modal.remove(); document.getElementById('nav-favorites')?.setAttribute('aria-expanded','false'); } });
    // focus trap
    const cleanup = trapFocus(modalCard, () => { if (modal) modal.remove(); document.getElementById('nav-favorites')?.setAttribute('aria-expanded','false'); });

    modal.querySelectorAll('.recipe-card.small-fav').forEach(card => {
      card.addEventListener('click', async () => {
        const id = card.dataset.id;
        const full = await getMealById(id);
        if (full) showMealModal(full);
      });
    });
    modal.querySelectorAll('.remove-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const list = getFavorites().filter(f => f.idMeal !== id);
        persistFavorites(list);
        showFavoritesPanel();
        updateFavButtons(id);
      });
    });

    // set nav favorites aria-expanded
    const navFav = document.getElementById('nav-favorites');
    if (navFav) navFav.setAttribute('aria-expanded','true');
  }

  // nav anchor scrolling + favorites link
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#favorites')) {
        e.preventDefault();
        showFavoritesPanel();
        if (isMobileNavViewport()) closeMobileNav();
        return;
      }
      if (href.startsWith('#')) {
        e.preventDefault();
        smoothScrollTo(href);
        setActiveNavByHash(href);
        if (isMobileNavViewport()) closeMobileNav();
      }
    });
  });

  setActiveNavByHash('#home');
  observeActiveSections();

  const googleSignoutBtn = document.getElementById('google-signout-btn');
  if (googleSignoutBtn) {
    googleSignoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOutGoogleUser();
    });
  }

  // focus-trap helper used by modals
  function trapFocus(container, onEscape) {
    if (!container) return () => {};
    const FOCUSABLE = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
    const prevActive = document.activeElement;
    const nodes = Array.from(container.querySelectorAll(FOCUSABLE));
    const first = nodes[0] || container;
    const last = nodes[nodes.length - 1] || container;
    function keyHandler(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (typeof onEscape === 'function') onEscape();
      }
      if (e.key === 'Tab') {
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    }
    document.addEventListener('keydown', keyHandler);
    // focus first
    window.requestAnimationFrame(() => { try { (first).focus(); } catch (e) {} });
    return function cleanup() { document.removeEventListener('keydown', keyHandler); try { prevActive && prevActive.focus(); } catch (e) {} };
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      const cat = selects && selects[0] ? selects[0].value : 'All Categories';
      const area = selects && selects[1] ? selects[1].value : 'All Cuisines';
      const diet = document.querySelector('.search-diet') ? document.querySelector('.search-diet').value : 'All Diets';
      try {
        showLoader();
        // Prefer Spoonacular when API key present for richer filtering
        if (SPOONACULAR_API_KEY) {
          try {
            const scResults = await spoonacularSearch(q || '', diet, (area && area !== 'All Cuisines') ? area : '');
            if (scResults && scResults.length) {
              renderMealsList(scResults);
              hideLoader();
              return;
            }
          } catch (e) { console.warn('Spoonacular search error', e); }
        }

        // Fallback to TheMealDB flow, with heuristic diet filtering when necessary
        if (q) {
          let res = await searchMealsByName(q);
          if (diet && diet !== 'All Diets') res = await heuristicFilterResults(res, diet, area);
          renderMealsList(res);
        } else if (cat && cat !== 'All Categories') {
          let res = await filterByCategory(cat);
          if (diet && diet !== 'All Diets') res = await heuristicFilterResults(res, diet, '');
          renderMealsList(res);
        } else if (area && area !== 'All Cuisines') {
          let res = await filterByArea(area);
          if (diet && diet !== 'All Diets') res = await heuristicFilterResults(res, diet, area);
          renderMealsList(res);
        } else {
          // fallback: fetch random
          const r = await getMultipleRandom(8);
          renderMealsList(r);
        }
        hideLoader();
      } catch (err) {
        hideLoader();
        console.error(err);
        clearRecipes();
        const grid = document.querySelector('.recipes-grid');
        if (grid) grid.innerHTML = `<div style="padding:40px;color:var(--ink-60)">Error fetching recipes.</div>`;
      }
    });
  }

  if (rbBtn) {
    rbBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      showLoader();
      const m = await getRandomMeal();
      hideLoader();
      if (m) showMealModal(m);
    });
  }

  // wire hero random (if present)
  document.querySelectorAll('.btn-secondary').forEach(btn => {
    if (btn.textContent && /random/i.test(btn.textContent)) {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoader();
        const m = await getRandomMeal();
        hideLoader();
        if (m) showMealModal(m);
      });
    }
  });

  // Category pill click -> filter
  document.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', async () => {
      const nameEl = p.querySelector('.cat-name');
      const cat = nameEl ? nameEl.textContent.trim() : null;
      if (cat) {
        try {
          showLoader();
          const res = await filterByCategory(cat);
          renderMealsList(res);
          hideLoader();
        } catch (err) { console.error(err); }
      }
    });
  });

  // Cuisine item click -> filter by area
  document.querySelectorAll('.cuisine-item').forEach(item => {
    item.addEventListener('click', async () => {
      const areaEl = item.querySelector('.cuisine-name');
      const area = areaEl ? areaEl.textContent.trim() : null;
      if (area) {
        try {
          showLoader();
          const res = await filterByArea(area);
          renderMealsList(res);
          hideLoader();
        } catch (err) { console.error(err); }
      }
    });
  });

  // initial demo: load a few random meals into grid if empty
  (async function initialLoad(){
    const grid = document.querySelector('.recipes-grid');
    if (!grid) return;
    // populate selects with live data
    try {
      const [cats, areas] = await Promise.all([fetchCategoriesList(), fetchAreasList()]);
      // populate first select (categories)
      const catSelect = document.querySelectorAll('.search-select')[0];
      const areaSelect = document.querySelectorAll('.search-select')[1];
      if (catSelect) {
        catSelect.innerHTML = '';
        const optAll = document.createElement('option'); optAll.textContent = 'All Categories'; catSelect.appendChild(optAll);
        cats && cats.forEach(c => { const o = document.createElement('option'); o.value = c.strCategory; o.textContent = c.strCategory; catSelect.appendChild(o); });
      }
      if (areaSelect) {
        areaSelect.innerHTML = '';
        const optAll = document.createElement('option'); optAll.textContent = 'All Cuisines'; areaSelect.appendChild(optAll);
        areas && areas.forEach(a => { const o = document.createElement('option'); o.value = a.strArea; o.textContent = a.strArea; areaSelect.appendChild(o); });
      }
    } catch (err) { console.error('Failed to populate selects', err); }

    // always populate featured area with live random meals (replace static placeholders)
    try {
      showLoader();
      // clear any static placeholder cards before inserting live content
      grid.innerHTML = '';
      const r = await getMultipleRandom(8);
      if (r) renderMealsList(r);
    } catch (err) { console.error(err); }
    finally { hideLoader(); }
  })();

  // restore auth state and initialize Google Sign-In
  const storedUser = getStoredGoogleUser();
  if (storedUser) setAuthUser(storedUser);
  syncAuthFromServer();
  renderGoogleButtonWhenReady();