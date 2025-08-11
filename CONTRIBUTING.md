# Contributing to Skilloo | المساهمة في سكيلو

Thank you for your interest in contributing to Skilloo! We welcome contributions from developers, educators, designers, and anyone passionate about children's education.

شكراً لاهتمامك بالمساهمة في سكيلو! نرحب بالمساهمات من المطورين والمعلمين والمصممين وأي شخص شغوف بتعليم الأطفال.

## Table of Contents | جدول المحتويات

- [Code of Conduct](#code-of-conduct--قواعد السلوك)
- [Getting Started](#getting-started--البدء)
- [How to Contribute](#how-to-contribute--كيفية المساهمة)
- [Development Setup](#development-setup--إعداد التطوير)
- [Coding Standards](#coding-standards--معايير البرمجة)
- [Testing](#testing--الاختبار)
- [Documentation](#documentation--التوثيق)
- [Community](#community--المجتمع)

## Code of Conduct | قواعد السلوك

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

هذا المشروع وكل من يشارك فيه محكوم بـ [قواعد السلوك](CODE_OF_CONDUCT.md) الخاصة بنا. من خلال المشاركة، من المتوقع أن تلتزم بهذه القواعد.

## Getting Started | البدء

### Prerequisites | المتطلبات المسبقة

- Node.js 18.18.0 or higher
- npm 9.0.0 or higher
- Git
- A modern web browser
- Basic knowledge of React, TypeScript, and Tailwind CSS

### First Time Setup | الإعداد لأول مرة

1. **Fork the repository** | **انسخ المستودع**
   ```bash
   # Click the "Fork" button on GitHub
   # انقر على زر "Fork" في GitHub
   ```

2. **Clone your fork** | **استنسخ نسختك**
   ```bash
   git clone https://github.com/YOUR_USERNAME/skilloo.git
   cd skilloo
   ```

3. **Add upstream remote** | **أضف المستودع الأصلي**
   ```bash
   git remote add upstream https://github.com/original/skilloo.git
   ```

4. **Install dependencies** | **تثبيت التبعيات**
   ```bash
   npm install
   ```

5. **Set up environment** | **إعداد البيئة**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   # عدّل .env.local بإعداداتك
   ```

6. **Start development server** | **تشغيل خادم التطوير**
   ```bash
   npm run dev
   ```

## How to Contribute | كيفية المساهمة

### Types of Contributions | أنواع المساهمات

#### 🐛 Bug Reports | تقارير الأخطاء
- Use the bug report template
- Include steps to reproduce
- Provide screenshots if applicable
- Test on multiple browsers/devices

#### ✨ Feature Requests | طلبات الميزات
- Use the feature request template
- Explain the educational value
- Consider age-appropriate design
- Provide mockups if possible

#### 🔧 Code Contributions | مساهمات الكود
- Bug fixes
- New features
- Performance improvements
- Accessibility enhancements
- Internationalization

#### 📚 Documentation | التوثيق
- API documentation
- User guides
- Developer tutorials
- Translation improvements

#### 🎨 Design Contributions | مساهمات التصميم
- UI/UX improvements
- Icons and illustrations
- Animations
- Accessibility enhancements

### Contribution Workflow | سير عمل المساهمة

1. **Check existing issues** | **تحقق من القضايا الموجودة**
   - Look for existing issues or discussions
   - Comment on issues you'd like to work on
   - Wait for maintainer approval for large changes

2. **Create a branch** | **إنشاء فرع**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes** | **قم بالتغييرات**
   - Follow coding standards
   - Write tests for new features
   - Update documentation
   - Test thoroughly

4. **Commit your changes** | **التزم بالتغييرات**
   ```bash
   git add .
   git commit -m "feat: add new learning game for colors"
   ```

5. **Push to your fork** | **ادفع إلى نسختك**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** | **إنشاء طلب سحب**
   - Use the PR template
   - Link related issues
   - Provide clear description
   - Add screenshots/videos for UI changes

## Development Setup | إعداد التطوير

### Project Structure | هيكل المشروع

```
skilloo/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   ├── constants/         # Constants
│   └── styles/            # Global styles
├── public/                # Static assets
├── tests/                 # Test files
├── docs/                  # Documentation
└── scripts/               # Build scripts
```

### Available Scripts | النصوص المتاحة

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Analysis
npm run analyze          # Analyze bundle size
npm run lighthouse       # Run Lighthouse audit
```

### Environment Variables | متغيرات البيئة

```bash
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Coding Standards | معايير البرمجة

### General Guidelines | الإرشادات العامة

- Write clean, readable, and maintainable code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript for type safety

### React Guidelines | إرشادات React

```typescript
// ✅ Good
interface GameProps {
  level: number;
  onComplete: (score: number) => void;
}

const ColorGame: React.FC<GameProps> = ({ level, onComplete }) => {
  const [score, setScore] = useState(0);
  
  const handleColorSelect = useCallback((color: string) => {
    // Game logic here
  }, []);
  
  return (
    <div className="game-container">
      {/* Game content */}
    </div>
  );
};

// ❌ Avoid
function Game(props) {
  // No TypeScript types
  // Unclear prop structure
}
```

### CSS/Tailwind Guidelines | إرشادات CSS/Tailwind

```tsx
// ✅ Good - Use Tailwind classes
<button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
  Play Game
</button>

// ✅ Good - Custom CSS for complex animations
<div className="animate-bounce-custom">
  {/* Content */}
</div>

// ❌ Avoid inline styles
<button style={{ backgroundColor: 'blue', padding: '8px' }}>
  Play Game
</button>
```

### Accessibility Guidelines | إرشادات إمكانية الوصول

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation
- Use ARIA labels when needed
- Maintain color contrast ratios
- Test with screen readers

```tsx
// ✅ Good
<button 
  aria-label="Play color matching game"
  onClick={startGame}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <PlayIcon aria-hidden="true" />
  Play
</button>

// ❌ Avoid
<div onClick={startGame}>
  Play
</div>
```

### Internationalization | التدويل

- Use translation keys for all user-facing text
- Support RTL languages (Arabic)
- Consider cultural differences
- Test with different locales

```tsx
// ✅ Good
const { t } = useTranslation();

<h1>{t('games.colors.title')}</h1>

// ❌ Avoid
<h1>Color Game</h1>
```

## Testing | الاختبار

### Testing Strategy | استراتيجية الاختبار

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Test with screen readers and keyboard navigation

### Writing Tests | كتابة الاختبارات

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorGame } from './ColorGame';

describe('ColorGame', () => {
  it('should start game when play button is clicked', () => {
    const onStart = jest.fn();
    render(<ColorGame onStart={onStart} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(onStart).toHaveBeenCalled();
  });
  
  it('should be accessible', async () => {
    const { container } = render(<ColorGame />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Test Coverage | تغطية الاختبار

- Aim for 80%+ code coverage
- Focus on critical paths
- Test error scenarios
- Include accessibility tests

## Documentation | التوثيق

### Code Documentation | توثيق الكود

```typescript
/**
 * Calculates the score based on game performance
 * @param correctAnswers - Number of correct answers
 * @param totalQuestions - Total number of questions
 * @param timeBonus - Bonus points for speed
 * @returns The calculated score
 */
function calculateScore(
  correctAnswers: number,
  totalQuestions: number,
  timeBonus: number
): number {
  // Implementation
}
```

### Component Documentation | توثيق المكونات

```typescript
/**
 * ColorGame Component
 * 
 * An interactive game that teaches children about colors through
 * matching and identification activities.
 * 
 * @example
 * ```tsx
 * <ColorGame
 *   level={1}
 *   onComplete={(score) => console.log('Score:', score)}
 *   onExit={() => navigate('/games')}
 * />
 * ```
 */
interface ColorGameProps {
  /** Game difficulty level (1-5) */
  level: number;
  /** Callback when game is completed */
  onComplete: (score: number) => void;
  /** Callback when user exits game */
  onExit: () => void;
}
```

## Community | المجتمع

### Communication Channels | قنوات التواصل

- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: For real-time chat (coming soon)
- **Email**: [contributors@skilloo.com](mailto:contributors@skilloo.com)

### Getting Help | الحصول على المساعدة

- Check existing documentation
- Search GitHub issues
- Ask in GitHub Discussions
- Join our Discord community
- Attend virtual meetups (announced in Discord)

### Recognition | التقدير

We recognize contributors in several ways:

- **Contributors page**: Listed on our website
- **Release notes**: Mentioned in release announcements
- **Special badges**: GitHub profile badges for significant contributions
- **Swag**: Skilloo merchandise for major contributors
- **References**: LinkedIn recommendations for outstanding contributors

## Release Process | عملية الإصدار

### Version Numbering | ترقيم الإصدارات

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule | جدول الإصدارات

- **Major releases**: Every 6 months
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs
- **Security releases**: Immediately when needed

### Changelog | سجل التغييرات

We maintain a detailed [CHANGELOG.md](CHANGELOG.md) with:

- New features
- Bug fixes
- Breaking changes
- Deprecations
- Security updates

## Educational Guidelines | الإرشادات التعليمية

### Age Appropriateness | الملاءمة العمرية

- **Ages 3-5**: Simple interactions, large buttons, bright colors
- **Ages 6-8**: More complex games, reading skills, problem-solving
- **Ages 9-12**: Advanced concepts, longer attention spans, achievements

### Learning Principles | مبادئ التعلم

- **Progressive difficulty**: Start easy, gradually increase complexity
- **Positive reinforcement**: Celebrate successes, encourage effort
- **Multiple learning styles**: Visual, auditory, kinesthetic approaches
- **Cultural sensitivity**: Respect diverse backgrounds and traditions
- **Inclusive design**: Accessible to children with different abilities

### Content Guidelines | إرشادات المحتوى

- Use age-appropriate language
- Avoid violence or scary content
- Promote positive values
- Include diverse characters and scenarios
- Ensure educational value in all activities

## Legal Considerations | الاعتبارات القانونية

### Licensing | الترخيص

- All contributions are licensed under MIT License
- Ensure you have rights to contribute any code/assets
- Third-party assets must be properly licensed
- Attribution required for external resources

### Privacy | الخصوصية

- Follow COPPA guidelines for children's privacy
- Minimize data collection
- Obtain parental consent when required
- Implement data protection measures

### Accessibility Compliance | امتثال إمكانية الوصول

- Follow WCAG 2.1 AA guidelines
- Test with assistive technologies
- Provide alternative formats when needed
- Consider cognitive accessibility

## Questions? | أسئلة؟

If you have any questions about contributing, please:

1. Check this document first
2. Search existing GitHub issues and discussions
3. Create a new GitHub discussion
4. Email us at [contributors@skilloo.com](mailto:contributors@skilloo.com)

إذا كان لديك أي أسئلة حول المساهمة، يرجى:

1. تحقق من هذا المستند أولاً
2. ابحث في قضايا ومناقشات GitHub الموجودة
3. أنشئ مناقشة جديدة في GitHub
4. راسلنا على [contributors@skilloo.com](mailto:contributors@skilloo.com)

---

**Thank you for contributing to Skilloo!** 🎉

**شكراً لمساهمتك في سكيلو!** 🎉

Together, we're building the future of children's education.

معاً، نحن نبني مستقبل تعليم الأطفال.

---

*Last updated: December 2024*
*آخر تحديث: ديسمبر 2024*