# AKA Profiles Interactive Badges

AKA Profiles supported interactive badges, where uses can apply for and be awarded badges.

This project is the source code of the existing badges.

To create your own interactive badge, you can submit a pull request, or clone this repositiory and host your own badge award pages.

- src/app/notabot: Uses Captcha to award a "Not-a-bot" badge.
- src/app/iplocate: Uses IP Geolocation badge to determine location. Loads user-defined params and returns data fields
- src/app.actions: calls to AKA Profiles API to award badge or load configuration options

src/app/<badge>/award page is displayed within an iFrame

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
