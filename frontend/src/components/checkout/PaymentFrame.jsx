import { useEffect, useRef, useState } from 'react';
import paymentService from '../../services/paymentService';
import { formatPrice } from '../../utils/formatPrice';
import styles from './PaymentFrame.module.css';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

// Renders Nedarim Plus's PCI iframe — card details are typed into Nedarim's page,
// never into ours. The iframe's "success" message only drives the UI; the order
// is confirmed solely by the server webhook, which this component polls for.
//
// Note: Nedarim's postMessage bridge does not work on localhost — test on a
// deployed domain.
export default function PaymentFrame({ session, onRetry, onPaid, onConfirmationDelayed }) {
  const iframeRef = useRef(null);
  const [phase, setPhase] = useState('connecting'); // connecting | ready | charging | confirming | error
  const [height, setHeight] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [retrying, setRetrying] = useState(false);

  // Keep the latest callbacks without re-subscribing the message listener.
  const handlersRef = useRef({ onPaid, onConfirmationDelayed });
  useEffect(() => {
    handlersRef.current = { onPaid, onConfirmationDelayed };
  });

  function postToFrame(message) {
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  }

  useEffect(() => {
    function handleMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow || !event.data?.Name) return;

      if (event.data.Name === 'Height') {
        setHeight(parseInt(event.data.Value, 10) + 15);
        setPhase((prev) => (prev === 'connecting' ? 'ready' : prev));
      } else if (event.data.Name === 'TransactionResponse') {
        if (event.data.Value?.Status === 'OK') {
          setPhase('confirming');
        } else {
          setErrorMessage(event.data.Value?.Message || 'העסקה נדחתה. בדקו את פרטי הכרטיס ונסו שוב.');
          setPhase('error');
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // After the iframe reports success, wait for the webhook to mark the order paid.
  useEffect(() => {
    if (phase !== 'confirming') return undefined;
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      try {
        const { paid } = await paymentService.getStatus(session.orderId, session.clientToken);
        if (cancelled) return;
        if (paid) return handlersRef.current.onPaid();
      } catch {
        // Transient network error — keep polling until the timeout.
      }
      if (cancelled) return;
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) return handlersRef.current.onConfirmationDelayed();
      setTimeout(poll, POLL_INTERVAL_MS);
    }
    poll();
    return () => { cancelled = true; };
  }, [phase, session.orderId, session.clientToken]);

  function handlePay() {
    setErrorMessage('');
    setPhase('charging');
    postToFrame({ Name: 'FinishTransaction', Value: session.transactionId });
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await onRetry();
      setErrorMessage('');
      setPhase('ready');
    } catch (err) {
      setErrorMessage(err.message || 'לא הצלחנו לחדש את התשלום. אנא נסו שוב.');
    } finally {
      setRetrying(false);
    }
  }

  const busy = phase === 'charging' || phase === 'confirming';

  return (
    <section className={styles.wrapper} aria-labelledby="payment-frame-title">
      <h2 id="payment-frame-title" className={styles.title}>פרטי תשלום</h2>
      <p className={styles.secureNote}>
        <span aria-hidden="true">🔒</span> התשלום מתבצע בדף מאובטח של נדרים פלוס (תקן PCI-DSS). פרטי הכרטיס אינם נשמרים אצלנו.
      </p>

      {phase === 'connecting' && <p className={styles.status} role="status">מתחבר לשרת התשלום המאובטח...</p>}

      <iframe
        ref={iframeRef}
        src={session.iframeUrl}
        title="טופס תשלום מאובטח — נדרים פלוס"
        className={styles.frame}
        style={{ height: height || undefined }}
        onLoad={() => postToFrame({ Name: 'GetHeight' })}
        scrolling="no"
      />

      <div aria-live="polite">
        {phase === 'charging' && <p className={styles.status}>מבצע חיוב, נא לא לסגור את הדף...</p>}
        {phase === 'confirming' && <p className={styles.status}>התשלום עבר — מאשרים את ההזמנה...</p>}
      </div>

      {phase === 'error' && (
        <div className={styles.error} role="alert">
          <p>{errorMessage}</p>
          <button type="button" className={styles.retryBtn} onClick={handleRetry} disabled={retrying}>
            {retrying ? 'מכין ניסיון חדש...' : 'נסו שוב'}
          </button>
        </div>
      )}

      {phase !== 'error' && (
        <button
          type="button"
          className={styles.payBtn}
          onClick={handlePay}
          disabled={phase !== 'ready'}
          aria-busy={busy}
        >
          {busy ? 'מעבד תשלום...' : `שלם ${formatPrice(session.total)}`}
        </button>
      )}
    </section>
  );
}
