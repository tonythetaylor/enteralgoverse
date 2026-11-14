# Security and privacy

This site is a public, static React application with no user authentication, accounts, database, personalized data, analytics, or user-generated content. The attack surface is intentionally limited.

## Principles

- Frontend `VITE_*` environment variables are public. **Never put API keys, passwords, signing secrets, or sensitive credentials in them.**
- Content is authored in typed data modules, not fetched as arbitrary user HTML. No `dangerouslySetInnerHTML` is used.
- Avoid third-party tracking scripts and untrusted embeds. Any future analytics requires an explicit privacy assessment and documented policy.
- Keep npm dependencies updated, use GitHub Dependabot or Renovate, and run `npm audit` (review false positives and build-time vs production impact).
- No fake download protection: ordinary browser media can be copied. Refer to `docs/VIDEO-DELIVERY.md`.
- For deployment on a host that supports headers, configure: HTTPS, `X-Content-Type-Options: nosniff`, a carefully tested Content-Security-Policy, `Referrer-Policy: strict-origin-when-cross-origin`, and an appropriate `Permissions-Policy`. GitHub Pages does not support arbitrary custom response headers.
- For site-only static hosting, rate limiting and WAF are handled by the CDN/host, not React.
- Media origin should be HTTPS with controlled CORS and byte-range support.
- Do not accept iframe embedders by default without reviewing abuse and clickjacking. A `frame-ancestors` CSP directive is sent via HTTP header, not a CSP meta tag.

## Content rights

Original art sheets, locations, logos and episode concepts are copyrighted TaylorTheory production assets. Do not copy the source assets into separate open-source demo repositories without permission. Commit only media you own or have rights to distribute.

## Reporting

For security bugs, use a private GitHub security advisory rather than creating a public issue containing exploit details.
