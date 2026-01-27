/**
 * Theme Manager
 * Handles theme switching between light/dark modes and system preference detection
 */

(function () {
    const THEME_KEY = 'theme-preference';

    // Theme states: 'light', 'dark', 'system'
    const themes = {
        light: {
            icon: '☀️',
            label: '亮色',
            next: 'dark'
        },
        dark: {
            icon: '🌙',
            label: '暗色',
            next: 'system'
        },
        system: {
            icon: '💻',
            label: '跟随系统',
            next: 'light'
        }
    };

    // Get stored preference or default to 'system'
    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY) || 'system';
    }

    // Get system preference
    function getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'system') {
            // Remove explicit theme, let CSS media query handle it
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }
    }

    // Update toggle button UI
    function updateToggleUI(theme) {
        const icon = document.getElementById('themeIcon');
        const label = document.getElementById('themeLabel');

        if (icon && label) {
            icon.textContent = themes[theme].icon;
            label.textContent = themes[theme].label;
        }
    }

    // Initialize theme
    function initTheme() {
        const storedTheme = getStoredTheme();
        applyTheme(storedTheme);
        updateToggleUI(storedTheme);
    }

    // Toggle to next theme
    function toggleTheme() {
        const currentTheme = getStoredTheme();
        const nextTheme = themes[currentTheme].next;

        localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
        updateToggleUI(nextTheme);

        // Add a subtle animation to the button
        const button = document.getElementById('themeToggle');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }

    // Listen for system preference changes
    function listenForSystemChanges() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const currentTheme = getStoredTheme();
            if (currentTheme === 'system') {
                // Theme will auto-update via CSS, but we can trigger a re-render if needed
                applyTheme('system');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            listenForSystemChanges();

            const toggleButton = document.getElementById('themeToggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', toggleTheme);
            }
        });
    } else {
        initTheme();
        listenForSystemChanges();

        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    }
})();
