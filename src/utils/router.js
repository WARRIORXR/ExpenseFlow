/* ============================================
   ROUTER — Hash-based SPA Router
   ============================================ */

class Router {
  constructor() {
    this._routes = {};
    this._currentRoute = null;
    this._beforeHooks = [];

    window.addEventListener('hashchange', () => this._onHashChange());
    window.addEventListener('load', () => this._onHashChange());
  }

  /**
   * Register a route.
   * @param {string} path - Route path (e.g., '/', '/add', '/transactions')
   * @param {object} handler - { title: string, render: (params) => void }
   */
  register(path, handler) {
    this._routes[path] = handler;
  }

  /**
   * Navigate to a route.
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Get current route path.
   */
  getCurrentRoute() {
    return this._currentRoute;
  }

  /**
   * Add a before-navigation hook.
   */
  beforeEach(hook) {
    this._beforeHooks.push(hook);
  }

  _onHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = Object.fromEntries(new URLSearchParams(queryString || ''));

    // Check if route exists
    let handler = this._routes[path];

    // Try pattern matching for dynamic routes like /edit/:id
    if (!handler) {
      for (const [routePath, routeHandler] of Object.entries(this._routes)) {
        if (routePath.includes(':')) {
          const regex = new RegExp('^' + routePath.replace(/:([^/]+)/g, '([^/]+)') + '$');
          const match = path.match(regex);
          if (match) {
            const paramNames = [...routePath.matchAll(/:([^/]+)/g)].map(m => m[1]);
            paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
            handler = routeHandler;
            break;
          }
        }
      }
    }

    if (!handler) {
      // Fallback to dashboard
      handler = this._routes['/'];
    }

    // Run before hooks
    for (const hook of this._beforeHooks) {
      if (hook(path, this._currentRoute) === false) return;
    }

    this._currentRoute = path;

    // Update page title
    const titleEl = document.getElementById('page-title');
    if (titleEl && handler.title) {
      titleEl.textContent = handler.title;
    }

    // Update sidebar active state
    document.querySelectorAll('.sidebar__link').forEach(link => {
      const route = link.getAttribute('data-route');
      link.classList.toggle('sidebar__link--active', route === path);
    });

    // Render page with transition
    const container = document.getElementById('page-content');
    if (container && handler.render) {
      container.classList.remove('page-enter');
      // Force reflow for animation restart
      void container.offsetWidth;
      container.classList.add('page-enter');
      handler.render(container, params);
    }
  }
}

export const router = new Router();
