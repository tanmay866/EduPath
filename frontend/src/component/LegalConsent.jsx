import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The line that says what you are agreeing to, with the way to read it.
 *
 * Sign-in stated that signing in meant agreeing to the terms of use and the
 * privacy policy, and neither was a link. The pages exist and are routed; the
 * sentence naming them simply was not joined to them, and the auth screens
 * have no footer to fall back on, so the point of consent was the one place
 * in the product where the documents could not be reached. Sign-up, where
 * agreement actually begins, said nothing at all.
 *
 * Both screens use this, so the wording and the links cannot drift apart
 * again.
 */
const linkStyle = {
    color: 'var(--color-text-3)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
};

const LegalConsent = ({ action, style }) => (
    <p
        style={{
            fontSize: 13,
            color: 'var(--color-text-4)',
            marginTop: 26,
            marginBottom: 0,
            lineHeight: 1.5,
            ...style,
        }}
    >
        {`By ${action} you agree to the `}
        <Link to="/terms" style={linkStyle}>terms of use</Link>
        {' and the '}
        <Link to="/privacy" style={linkStyle}>privacy policy</Link>.
    </p>
);

export default LegalConsent;
