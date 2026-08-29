## 📌 Description of Changes
<!-- Provide a concise summary of the changes introduced by this pull request. -->

## 🎯 Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 🛡️ Security enhancement
- [ ] ⚡ Performance optimization
- [ ] 🧹 Refactoring / Code cleanup
- [ ] 📝 Documentation update

## 🧪 Verification & Testing
- [ ] Backend unit tests pass (`npm run test:unit --workspace=backend`)
- [ ] Full test suite passes (`npm test`)
- [ ] Backend & frontend linting passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)

## 🛡️ SLA & Business Logic Invariants
- [ ] SLA engine calculates business hours exclusively (`09:00 - 18:00 Mon-Fri`).
- [ ] Weekends and configured holidays are excluded.
- [ ] 75% boundary is preserved (`<= 75%` is `ON_TRACK`, `> 75%` is `AT_RISK`).
- [ ] Milestone clock freezing is respected on first non-reporter response and resolution.
