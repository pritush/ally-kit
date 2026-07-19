# Contributing to AllyKit

Thank you for your interest in contributing to AllyKit! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 **Report bugs** - Found an issue? Let us know!
- 💡 **Suggest features** - Have an idea? We'd love to hear it!
- 📝 **Improve documentation** - Help make our docs better
- 🔧 **Submit pull requests** - Fix bugs or add features
- 🧪 **Add tests** - Improve our test coverage
- 🌍 **Translate** - Help make AllyKit accessible in more languages

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm
- Git
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ally-kit.git
   cd ally-kit
   ```

2. **Install dependencies** (when build system is added)
   ```bash
   npm install
   ```

3. **Test your setup**
   ```bash
   # Open index.html in your browser
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```

## 📋 Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Edit `ally-kit.js` for the main library
   - Update `README.md` if adding new features
   - Add tests if applicable

3. **Test your changes**
   - Open `index.html` in multiple browsers
   - Test all accessibility features
   - Verify no console errors
   - Test keyboard navigation (Tab, arrows, Escape)

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in screen reader"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## 🎨 Code Style Guidelines

### JavaScript

- **Use ES5 syntax** - AllyKit supports older browsers
- **No external dependencies** - Keep it vanilla JavaScript
- **Semicolons required** - End statements with `;`
- **2-space indentation** - Use 2 spaces, not tabs
- **Clear variable names** - Use descriptive names
- **Comments for complex logic** - Help others understand

**Example:**
```javascript
/**
 * Apply text zoom to page elements.
 * Skips the widget itself to prevent self-zooming.
 */
function applyTextZoom() {
  var level = state.textSize;
  if (level === 0) return;
  
  var zoomFactor = 1 + level * 0.1;
  var elements = document.querySelectorAll(TOP_LEVEL_SELECTOR);
  
  elements.forEach(function(el) {
    el.style.zoom = zoomFactor;
  });
}
```

### CSS (in Shadow DOM)

- Use CSS custom properties for theming
- Prefix custom properties with `--ak-`
- Mobile-first responsive design
- Support both light and dark modes

### HTML

- Semantic HTML5 elements
- ARIA attributes where appropriate
- Proper heading hierarchy
- Keyboard accessibility (tabindex, roles)

## 🧪 Testing Checklist

Before submitting a PR, verify:

- [ ] **Feature works in all browsers** (Chrome, Firefox, Safari, Edge)
- [ ] **Mobile responsive** (test on phone/tablet or use DevTools)
- [ ] **Keyboard accessible** (test with Tab, Shift+Tab, arrows, Enter, Escape)
- [ ] **No console errors** (check browser DevTools)
- [ ] **Settings persist** (reload page, settings should remain)
- [ ] **No visual regressions** (widget looks correct)
- [ ] **Works with existing features** (test combinations)
- [ ] **Shadow DOM isolation** (no style leaks in/out)
- [ ] **Auto-fixer doesn't break** (if you modified it)

### Browser Testing

Test in:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile Safari (iOS 14+)
- Chrome Android

## 📝 Documentation

When adding features:

1. **Update README.md**
   - Add to features table
   - Update configuration section
   - Add usage examples

2. **Update TypeScript definitions**
   - Add to `ally-kit.d.ts`
   - Document parameters and return types

3. **Add JSDoc comments**
   - Document function purpose
   - Describe parameters
   - Note return values

4. **Update example files**
   - Add to `example-config.html`
   - Update `index.html` if needed

## 🐛 Reporting Bugs

Good bug reports include:

1. **Clear title** - Summarize the issue
2. **Steps to reproduce** - Exact steps to trigger the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - Browser, OS, AllyKit version
6. **Screenshots** - If applicable
7. **Console errors** - Copy any error messages

**Example:**
```markdown
## Screen reader stops working after navigation

**Steps to reproduce:**
1. Enable screen reader feature
2. Click on a link with target="_blank"
3. Return to original tab
4. Hover over interactive elements

**Expected:** Screen reader should announce elements
**Actual:** No speech, console shows "speechSynthesis.cancel is not a function"

**Environment:**
- Browser: Firefox 120 on Windows 11
- AllyKit version: 1.3.0

**Console error:**
```
TypeError: speechSynthesis.cancel is not a function
  at handleMouseover (ally-kit.js:456)
```
```

## 💡 Feature Requests

Feature requests should include:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How would it work?
3. **Alternatives** - Other approaches considered?
4. **Use cases** - Who benefits and how?
5. **Implementation notes** - Technical considerations

## 🔍 Code Review Process

Pull requests are reviewed for:

- **Code quality** - Readable, maintainable, follows style guide
- **Functionality** - Feature works as intended
- **Testing** - Adequate testing performed
- **Documentation** - Changes are documented
- **Performance** - No significant performance regressions
- **Accessibility** - Changes maintain/improve accessibility
- **Backward compatibility** - Doesn't break existing usage

## 📜 Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Testing
- `chore` - Maintenance

**Examples:**
```bash
feat(screen-reader): add rate control for speech

Add user-configurable speech rate option in screen reader
settings. Allows users to adjust reading speed from 0.5x to 2x.

Closes #123

fix(adhd): mask not following cursor on Firefox

The ADHD focus mask was 10px below cursor on Firefox due to
incorrect offsetY calculation. Fixed by using clientY instead.

Fixes #456

docs: add TypeScript usage examples to README

refactor: extract color utilities to separate functions

test: add unit tests for palette generation
```

## 🤝 Community Guidelines

- **Be respectful** - Treat others with kindness
- **Be constructive** - Provide helpful feedback
- **Be patient** - Maintainers are often volunteers
- **Stay on topic** - Keep discussions relevant
- **Follow Code of Conduct** - (Add link when available)

## 📞 Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/pritush/ally-kit/discussions)
- **Bug?** Open an [Issue](https://github.com/pritush/ally-kit/issues)
- **Security issue?** Email security@example.com (replace with actual email)

## 🎉 Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to make the web more accessible! 🌟
