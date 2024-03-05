# AKA Profiles Self-Issued Badges

AKA Profiles supported self-issued badges, where uses can apply for and be awarded badges.

See [AKA Pofiles Documentation](https://www.akaprofiles.com/docs/badge-integration/introduction) for more information.

This project is the source code of the existing badges.

To create your own self-hosted badge, you can submit a pull request, or clone this repositiory and host your own badge award pages.

- src/app/notabot: Uses Captcha to award a "Not-a-bot" badge.
- src/app/iplocate: Uses IP Geolocation badge to determine location. Loads user-defined params and returns data fields
- src/components/serverCalls.tsx: client to server calls to verify session, load configuration, or award badge

```html
<iframe
id="contentFrame"
src="<applyURL>?session=$<session id>&awardtoken=<award token>"
title={title}
style={{
    height: "100%",
    width: "100%",
    minHeight: "240px",
    border: 0,
}}
></iframe>
```

.
