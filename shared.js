/**
 * Shared utilities for Airdrop Tracker Pro.
 *
 * Provides common DOM helpers, localStorage persistence, password
 * hashing, and navigation used by both the login and app pages.
 */

const DB_KEY = 'airdropTrackerApp';
const DEFAULT_APP_DATA = { users: {}, currentUser: null };

/** Shorthand for document.getElementById. */
const getEl = (id) => document.getElementById(id);

/** Load the full application state from localStorage. */
const loadAppData = () =>
    JSON.parse(localStorage.getItem(DB_KEY)) || { ...DEFAULT_APP_DATA };

/** Persist the full application state to localStorage. */
const saveAppData = (appData) =>
    localStorage.setItem(DB_KEY, JSON.stringify(appData));

/** Simple password encoding (base-64). */
const hashPassword = (password) => btoa(password);

/** Navigate to another page. */
const navigateTo = (page) => {
    window.location.href = page;
};
