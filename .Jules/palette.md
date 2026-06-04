## 2024-05-18 - [Add aria-label to notification bell]
**Learning:** Found an icon-only button without an accessible label (Bell icon in Topbar). Screen readers rely on `aria-label` for icon-only buttons to convey meaning.
**Action:** Added `aria-label="Notifications"` to the button and `aria-hidden="true"` to the icon to improve screen reader accessibility.
