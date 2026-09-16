import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AccessibilityWidget.module.css';

/**
 * Floating accessibility panel — required by the Israeli Accessibility
 * Regulations (2013), see docs/specs/10-legal-and-compliance.md §13.2.
 * It supplements, and does not replace, the baseline accessibility work.
 *
 * Preferences are applied as data-attributes / a CSS custom property on <html>
 * and persisted in localStorage so they survive navigation and return visits.
 */
const STORAGE_KEY = 'a11y-preferences';

const DEFAULTS = {
  fontScale: 1,
  contrast: false,
  highlightLinks: false,
  stopAnimations: false,
  readableFont: false,
};

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.5;
const STEP = 0.1;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(readStored);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Apply the preferences to <html> and remember them.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-font-scale', String(prefs.fontScale));
    root.toggleAttribute('data-a11y-contrast', prefs.contrast);
    root.toggleAttribute('data-a11y-links', prefs.highlightLinks);
    root.toggleAttribute('data-a11y-no-motion', prefs.stopAnimations);
    root.toggleAttribute('data-a11y-readable', prefs.readableFont);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable (private mode) — preferences stay for this session only */
    }
  }, [prefs]);

  // Close on Escape, and on a click outside the panel.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (
        !panelRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const toggle = useCallback(
    (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  const changeScale = useCallback(
    (delta) =>
      setPrefs((prev) => ({
        ...prev,
        fontScale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((prev.fontScale + delta).toFixed(2)))),
      })),
    []
  );

  const toggles = [
    { key: 'contrast', label: 'ניגודיות גבוהה', icon: '◐' },
    { key: 'highlightLinks', label: 'הדגשת קישורים', icon: '🔗' },
    { key: 'stopAnimations', label: 'עצירת אנימציות', icon: '⏸' },
    { key: 'readableFont', label: 'גופן קריא', icon: 'א' },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span aria-hidden="true">♿</span>
      </button>

      <div
        id="a11y-panel"
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label="הגדרות נגישות"
        hidden={!open}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>הגדרות נגישות</h2>
          <button
            type="button"
            className={styles.close}
            aria-label="סגירת תפריט הנגישות"
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
          >
            ✕
          </button>
        </div>

        <div className={styles.group}>
          <span className={styles.groupLabel} id="a11y-text-size">גודל טקסט</span>
          <div className={styles.sizeRow} role="group" aria-labelledby="a11y-text-size">
            <button
              type="button"
              className={styles.sizeBtn}
              aria-label="הקטנת גודל הטקסט"
              disabled={prefs.fontScale <= MIN_SCALE}
              onClick={() => changeScale(-STEP)}
            >
              −
            </button>
            <span className={styles.sizeValue} aria-live="polite">
              {Math.round(prefs.fontScale * 100)}%
            </span>
            <button
              type="button"
              className={styles.sizeBtn}
              aria-label="הגדלת גודל הטקסט"
              disabled={prefs.fontScale >= MAX_SCALE}
              onClick={() => changeScale(STEP)}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.group}>
          <span className={styles.groupLabel}>התאמות תצוגה</span>
          <ul className={styles.toggles}>
            {toggles.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`${styles.toggle} ${prefs[item.key] ? styles.toggleOn : ''}`}
                  aria-pressed={prefs[item.key]}
                  onClick={() => toggle(item.key)}
                >
                  <span className={styles.toggleIcon} aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.reset} onClick={() => setPrefs(DEFAULTS)}>
            איפוס ההגדרות
          </button>
          <Link to="/accessibility-statement" className={styles.statementLink} onClick={() => setOpen(false)}>
            הצהרת הנגישות המלאה
          </Link>
        </div>
      </div>
    </>
  );
}
