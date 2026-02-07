# 21. CELEBRATIONS & DELIGHT — UI Specification
**Gifta UX v2 | Micro-Interactions & Celebration Moments**

---

## Table of Contents
1. [Confetti System](#confetti-system)
2. [Subtle Animations](#subtle-animations)
3. [Haptic Feedback](#haptic-feedback)
4. [Sound Effects](#sound-effects)
5. [Motion Preferences & Accessibility](#motion-preferences--accessibility)
6. [Implementation Guide](#implementation-guide)

---

## Confetti System

### Overview
- **Library**: `canvas-confetti` (npm package)
- **Container**: Full-viewport canvas overlay, z-index: 40, pointer-events: none
- **Triggers**: Dreamboard creation, contribution success, campaign completion
- **Colors**: Gifta palette (teal, sage, peach, coral, gold)
- **Disabled**: When `prefers-reduced-motion: reduce` (fallback: static checkmark)

### Configuration

**Confetti Colors**:
```javascript
const giftaConfettiColors = [
  '#0D9488',  // Primary teal
  '#6B9E88',  // Sage
  '#F97316',  // Orange accent
  '#FB923C',  // Peach
  '#DC2626',  // Coral
  '#FBBF24',  // Gold
];
```

**Default Configuration**:
```javascript
const confettiDefaults = {
  particleCount: 200,
  spread: 100,
  startVelocity: 50,
  decay: 0.92,
  gravity: 0.8,
  ticks: 200,
  origin: { x: 0.5, y: 0.3 }, // Centered, top of viewport
  colors: giftaConfettiColors,
  disableForReducedMotion: true,
};
```

---

### Trigger 1: Dreamboard Created
**When**: Immediately after parent submits Dreamboard form

**Duration**: 3 seconds (full burst)

**Intensity**: High (maximum particles)

**Animation Style**:
```javascript
const dreamBoardConfetti = {
  particleCount: 300,           // High count
  spread: 150,                  // Wide spread
  startVelocity: 60,            // Fast particles
  decay: 0.90,                  // Slow fade
  gravity: 0.6,                 // Float longer
  ticks: 300,                   // 3-second duration
  origin: { x: 0.5, y: 0.2 },
  shapes: ['circle', 'square'], // Varied shapes
  colors: giftaConfettiColors,
};
```

**Trigger Code**:
```tsx
import confetti from 'canvas-confetti';

export const triggerDreamBoardConfetti = () => {
  confetti({
    particleCount: 300,
    spread: 150,
    startVelocity: 60,
    decay: 0.90,
    gravity: 0.6,
    ticks: 300,
    origin: { x: 0.5, y: 0.2 },
    colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
  });
};
```

**Integration Point**: `src/components/forms/CreateDreamBoardForm.tsx` (onSuccess callback)

---

### Trigger 2: Contribution Thank-You (Confetti)
**When**: Immediately after payment confirmation

**Duration**: 2 seconds (medium burst)

**Intensity**: Medium (moderate particles)

**Animation Style**:
```javascript
const contributionConfetti = {
  particleCount: 150,           // Medium count
  spread: 100,                  // Standard spread
  startVelocity: 40,            // Moderate speed
  decay: 0.94,                  // Medium fade
  gravity: 0.8,                 // Moderate fall
  ticks: 200,                   // 2-second duration
  origin: { x: 0.5, y: 0.4 },
  colors: giftaConfettiColors,
};
```

**Trigger Code**:
```tsx
export const triggerContributionConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 100,
    startVelocity: 40,
    decay: 0.94,
    gravity: 0.8,
    ticks: 200,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
  });
};
```

**Integration Point**: `src/components/forms/ContributionForm.tsx` (onPaymentSuccess)

---

### Trigger 3: Campaign Complete (Dashboard)
**When**: Parent views completed Dreamboard on dashboard

**Duration**: 3 seconds (full burst, possibly repeating)

**Intensity**: Maximum (celebration moment)

**Animation Style**:
```javascript
const campaignCompleteConfetti = {
  particleCount: 300,           // High count
  spread: 180,                  // Very wide
  startVelocity: 70,            // Fast particles
  decay: 0.85,                  // Quick fade
  gravity: 0.7,                 // Float moderately
  ticks: 300,                   // 3-second duration
  origin: { x: 0.5, y: 0.1 },  // From top
  colors: giftaConfettiColors,
};
```

**Trigger Code**:
```tsx
export const triggerCampaignCompleteConfetti = () => {
  // Option 1: Single burst
  confetti({
    particleCount: 300,
    spread: 180,
    startVelocity: 70,
    decay: 0.85,
    gravity: 0.7,
    ticks: 300,
    origin: { x: 0.5, y: 0.1 },
    colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
  });

  // Option 2: Double burst (left + right cannons)
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 50,
      angle: 45,
      origin: { x: 0.2, y: 0.5 },
      colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
    });
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 50,
      angle: 135,
      origin: { x: 0.8, y: 0.5 },
      colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
    });
  }, 150);
};
```

**Integration Point**: `src/pages/Dashboard.tsx` (useEffect when campaign reaches 100%)

---

### Confetti Component Wrapper
**File Path**: `src/components/effects/ConfettiTrigger.tsx`

**Purpose**: Reusable component to manage confetti with motion preferences.

**Component Code**:
```tsx
import confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ConfettiTriggerProps {
  trigger: 'dream-board-created' | 'contribution-success' | 'campaign-complete';
  onComplete?: () => void;
}

export const ConfettiTrigger: React.FC<ConfettiTriggerProps> = ({ trigger, onComplete }) => {
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion) {
      // Show static checkmark instead
      showStaticSuccessCheckmark();
      if (onComplete) onComplete();
      return;
    }

    const config = {
      'dream-board-created': {
        particleCount: 300,
        spread: 150,
        startVelocity: 60,
        decay: 0.90,
        gravity: 0.6,
        ticks: 300,
        origin: { x: 0.5, y: 0.2 },
      },
      'contribution-success': {
        particleCount: 150,
        spread: 100,
        startVelocity: 40,
        decay: 0.94,
        gravity: 0.8,
        ticks: 200,
        origin: { x: 0.5, y: 0.4 },
      },
      'campaign-complete': {
        particleCount: 300,
        spread: 180,
        startVelocity: 70,
        decay: 0.85,
        gravity: 0.7,
        ticks: 300,
        origin: { x: 0.5, y: 0.1 },
      },
    };

    const selectedConfig = config[trigger];
    confetti({
      ...selectedConfig,
      colors: ['#0D9488', '#6B9E88', '#F97316', '#FB923C', '#DC2626', '#FBBF24'],
    });

    // Call onComplete after duration
    const duration = selectedConfig.ticks * 10; // ms
    if (onComplete) {
      setTimeout(onComplete, duration);
    }
  }, [trigger, prefersReducedMotion, onComplete]);

  return null; // Confetti renders to canvas overlay
};

// Usage in component:
// <ConfettiTrigger trigger="dream-board-created" onComplete={() => navigate('/dashboard')} />
```

**Props Interface**:
```typescript
interface ConfettiTriggerProps {
  trigger: 'dream-board-created' | 'contribution-success' | 'campaign-complete';
  onComplete?: () => void;
  disabled?: boolean; // Manual disable (overrides motion preferences)
  colors?: string[]; // Custom color palette
}
```

---

## Subtle Animations

### 1. New Contribution Slide-In
**Where**: Contributions list, when new contribution appears in real-time

**Animation**: Slide in from right + pulse highlight

**Duration**: 400ms (enter), 2s (pulse)

**Implementation**:

**CSS/Tailwind**:
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(13, 148, 136, 0);
  }
}

.contribution-item-enter {
  animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-composition: add;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}

.contribution-item-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1);
}

/* Motion preferences */
@media (prefers-reduced-motion: reduce) {
  .contribution-item-enter,
  .contribution-item-pulse {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

**React Component**:
```tsx
interface ContributionItemProps {
  contribution: Contribution;
  isNew?: boolean;
}

export const ContributionItem: React.FC<ContributionItemProps> = ({ contribution, isNew }) => {
  return (
    <div
      className={`
        p-4 bg-white border border-border-light rounded-lg
        ${isNew ? 'contribution-item-enter contribution-item-pulse' : ''}
      `}
    >
      {/* Item content */}
    </div>
  );
};
```

**Trigger**: When new contribution data arrives via WebSocket or polling

---

### 2. Contributor Avatar Bounce
**Where**: Contributor chips on Dreamboard card

**Animation**: Gentle bounce, 0.5s delay per avatar

**Duration**: 2 seconds, bounce-easing

**Implementation**:

**CSS**:
```css
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.contributor-avatar {
  animation: bounce-subtle 2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

/* Staggered animation for multiple avatars */
.contributor-avatar:nth-child(1) { animation-delay: 0s; }
.contributor-avatar:nth-child(2) { animation-delay: 0.1s; }
.contributor-avatar:nth-child(3) { animation-delay: 0.2s; }
.contributor-avatar:nth-child(4) { animation-delay: 0.3s; }
.contributor-avatar:nth-child(5) { animation-delay: 0.4s; }

@media (prefers-reduced-motion: reduce) {
  .contributor-avatar {
    animation: none;
    transform: none;
  }
}
```

**React Component**:
```tsx
export const ContributorChips: React.FC<ContributorChipsProps> = ({ contributors }) => {
  return (
    <div className="flex -space-x-2">
      {contributors.map((contributor, index) => (
        <div
          key={contributor.id}
          className="contributor-avatar w-10 h-10 rounded-full bg-gradient-to-br from-teal to-sage flex items-center justify-center text-white font-outfit font-600 text-sm border-2 border-white"
          style={{ zIndex: contributors.length - index }}
        >
          {contributor.initials}
        </div>
      ))}
    </div>
  );
};
```

**Trigger**: On component mount (first render of contributors)

---

### 3. Progress Bar Number Counting Animation
**Where**: Progress bar label showing "75% funded" or "R3,750 of R5,000"

**Animation**: Number increments from 0 to final value

**Duration**: 1 second

**Implementation**:

**React Component**:
```tsx
import { useEffect, useState } from 'react';

interface CountingNumberProps {
  endValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: 'percentage' | 'currency';
  currency?: string;
}

export const CountingNumber: React.FC<CountingNumberProps> = ({
  endValue,
  duration = 1000,
  prefix = '',
  suffix = '',
  format = 'percentage',
  currency = 'R',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeProgress * endValue);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  const formatValue = () => {
    if (format === 'percentage') {
      return `${prefix}${displayValue}%${suffix}`;
    } else if (format === 'currency') {
      return `${prefix}${currency}${displayValue.toLocaleString()}${suffix}`;
    }
    return `${prefix}${displayValue}${suffix}`;
  };

  return <span className="tabular-nums">{formatValue()}</span>;
};

// Usage in ProgressBar:
<p className="text-sm font-outfit text-teal mt-2">
  <CountingNumber
    endValue={75}
    format="percentage"
    suffix=" funded"
    duration={1000}
  />
</p>
```

**Accessibility**: Use `tabular-nums` font-variant for stable width during counting

**Trigger**: When progress bar updates (new contribution received)

---

### 4. Button Hover Lift & Shadow
**Where**: All primary action buttons (orange CTA buttons)

**Animation**: Slight upward translate + enhanced shadow

**Duration**: 200ms ease-out

**Implementation**:

**CSS/Tailwind**:
```css
.btn-primary {
  background-color: #F97316;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 150ms ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
}

.btn-primary:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .btn-primary {
    transition: none;
  }
  .btn-primary:hover {
    transform: none;
  }
}
```

**React Component**:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'font-outfit font-600 rounded-lg transition-all';
  const variantClasses = {
    primary: 'bg-orange text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-surface border border-border-strong text-dark hover:bg-elevated',
  };
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

### 5. Success Checkmark Draw-In
**Where**: Payment success confirmation screen

**Animation**: Checkmark path drawn with SVG stroke-dasharray

**Duration**: 600ms

**Implementation**:

**SVG Component**:
```tsx
interface SuccessCheckmarkProps {
  size?: number;
  animated?: boolean;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({ size = 80, animated = true }) => {
  const checkmarkLength = 52; // Length of checkmark path (calculated via getTotalLength)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={animated ? 'animate-checkmark-draw' : ''}
    >
      {/* Circle */}
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="#059669" // Success green
        strokeWidth="3"
        className={animated ? 'animate-circle-fill' : 'fill-current'}
      />

      {/* Checkmark path */}
      <path
        d="M20 42 L38 60 L62 25"
        stroke="#059669"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={checkmarkLength}
        strokeDashoffset={animated ? checkmarkLength : 0}
        className={animated ? 'animate-checkmark-stroke' : ''}
        fill="none"
      />
    </svg>
  );
};
```

**CSS Animations**:
```css
@keyframes circle-fill {
  0% {
    stroke-dasharray: 226;
    stroke-dashoffset: 226;
  }
  100% {
    stroke-dasharray: 226;
    stroke-dashoffset: 0;
  }
}

@keyframes checkmark-stroke {
  0% {
    stroke-dashoffset: 52;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-circle-fill {
  animation: circle-fill 0.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.animate-checkmark-stroke {
  animation: checkmark-stroke 0.3s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-circle-fill,
  .animate-checkmark-stroke {
    animation: none;
    stroke-dashoffset: 0;
  }
}
```

**Trigger**: Payment success response received from API

---

### 6. Card Staggered Entry (fadeUp)
**Where**: Dreamboard card grid on dashboard, contributor list

**Animation**: Each card fades in and slides up, with delay between each

**Duration**: 0.6s per card, 0.1s delay between cards

**Implementation**:

**CSS**:
```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-entry {
  animation: fadeUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.card-entry:nth-child(1) { animation-delay: 0s; }
.card-entry:nth-child(2) { animation-delay: 0.1s; }
.card-entry:nth-child(3) { animation-delay: 0.2s; }
.card-entry:nth-child(4) { animation-delay: 0.3s; }
.card-entry:nth-child(5) { animation-delay: 0.4s; }

@media (prefers-reduced-motion: reduce) {
  .card-entry {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

**React Component**:
```tsx
export const DreamBoardCard: React.FC<DreamBoardCardProps> = (props) => {
  return (
    <div className="card-entry bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Card content */}
    </div>
  );
};
```

**Trigger**: Component mounts (grid render)

---

## Haptic Feedback

### Overview
- **API**: Vibration API (Web Haptics)
- **Support**: Mobile devices only (iOS, Android)
- **Fallback**: Graceful degradation on unsupported devices
- **Permissions**: No permission required; browser may throttle based on OS settings

### Implementation Hook

**File Path**: `src/hooks/useHaptic.ts`

```typescript
export const useHaptic = () => {
  const trigger = React.useCallback((pattern: 'light' | 'medium' | 'heavy' | 'double-tap') => {
    if (!('vibrate' in navigator)) {
      console.log('Haptic feedback not supported');
      return;
    }

    const patterns: Record<string, number | number[]> = {
      light: 10,           // 10ms vibration
      medium: 20,          // 20ms vibration
      heavy: 40,           // 40ms vibration
      'double-tap': [15, 10, 15], // 15ms, pause, 15ms
    };

    navigator.vibrate(patterns[pattern]);
  }, []);

  return { trigger };
};
```

---

### Haptic Trigger 1: Payment Success
**Intensity**: Medium vibration (20ms)

**Timing**: Immediately after payment confirmation

**Code**:
```tsx
export const PaymentSuccessScreen: React.FC = () => {
  const { trigger: haptic } = useHaptic();

  React.useEffect(() => {
    haptic('medium');
  }, [haptic]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SuccessCheckmark size={100} />
      <p className="text-xl font-fraunces text-dark mt-6">Thank you for contributing!</p>
    </div>
  );
};
```

---

### Haptic Trigger 2: Button Tap
**Intensity**: Light impact (10ms)

**Timing**: On button mousedown/touchstart

**Code**:
```tsx
export const Button: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
  const { trigger: haptic } = useHaptic();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptic('light');
    onClick?.(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};
```

---

### Haptic Trigger 3: Error Action
**Intensity**: Double-tap (two 15ms vibrations)

**Timing**: On validation error or failed action

**Code**:
```tsx
// In form validation
if (!isEmailValid) {
  haptic('double-tap');
  setError('Please enter a valid email');
}
```

---

### Haptic Settings & Permissions

**User Preference Storage**:
```typescript
// src/lib/haptic-preferences.ts
export const hapticPreferences = {
  isEnabled: () => localStorage.getItem('haptic_enabled') !== 'false',
  disable: () => localStorage.setItem('haptic_enabled', 'false'),
  enable: () => localStorage.setItem('haptic_enabled', 'true'),
};

// In useHaptic hook
const trigger = React.useCallback((pattern: string) => {
  if (!hapticPreferences.isEnabled() || !('vibrate' in navigator)) {
    return;
  }
  // ... trigger vibration
}, []);
```

**Settings UI** (in user preferences):
```tsx
<label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={hapticEnabled}
    onChange={(e) => {
      if (e.target.checked) hapticPreferences.enable();
      else hapticPreferences.disable();
    }}
  />
  <span>Enable haptic feedback (vibrations)</span>
</label>
```

---

## Sound Effects

### Overview
- **Library**: `howler.js` (cross-browser audio) or native Web Audio API
- **Default State**: OFF (must be opt-in or user-enabled)
- **Volume**: 0.3 (30%, doesn't startle)
- **Format**: MP3 (small file size, broad support)
- **Trigger**: Only on successful actions or explicit user events

### Configuration

**File Path**: `src/lib/sound-manager.ts`

```typescript
import { Howl } from 'howler';

const soundConfig = {
  contribution_received: {
    url: '/sounds/contribution-chime.mp3',
    volume: 0.3,
    enabled: false, // Default: disabled
  },
  dream_board_created: {
    url: '/sounds/celebration-flourish.mp3',
    volume: 0.4,
    enabled: false,
  },
};

interface SoundOptions {
  volume?: number;
  fadeIn?: number; // ms
  fadeOut?: number; // ms
  loop?: boolean;
}

export class SoundManager {
  private sounds: Record<string, Howl> = {};
  private soundsEnabled = false;

  constructor() {
    this.soundsEnabled = this.getSoundPreference();
    this.initializeSounds();
  }

  private initializeSounds() {
    Object.entries(soundConfig).forEach(([key, config]) => {
      this.sounds[key] = new Howl({
        src: [config.url],
        volume: config.volume,
        preload: false, // Load on first play to reduce bundle
      });
    });
  }

  play(soundKey: string, options?: SoundOptions) {
    if (!this.soundsEnabled) {
      return;
    }

    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }

    if (options?.volume) {
      sound.volume(options.volume);
    }

    if (options?.fadeIn) {
      sound.fade(0, sound.volume(), options.fadeIn);
    }

    sound.play();

    if (options?.fadeOut) {
      const duration = sound.duration() * 1000;
      setTimeout(() => {
        sound.fade(sound.volume(), 0, options.fadeOut);
      }, duration - options.fadeOut);
    }
  }

  toggle(enabled: boolean) {
    this.soundsEnabled = enabled;
    localStorage.setItem('sound_enabled', String(enabled));
  }

  private getSoundPreference(): boolean {
    const stored = localStorage.getItem('sound_enabled');
    return stored ? stored === 'true' : false; // Default: false (disabled)
  }
}

// Singleton instance
export const soundManager = new SoundManager();
```

---

### Sound Trigger 1: Contribution Received
**When**: Payment confirmation received (optional: real-time contribution notification)

**Sound**: Gentle chime (approx. 0.5s duration)

**File**: `public/sounds/contribution-chime.mp3`

**Implementation**:
```tsx
// In payment success handler
soundManager.play('contribution_received');
```

---

### Sound Trigger 2: Dreamboard Created
**When**: Dreamboard creation successful

**Sound**: Celebration flourish (approx. 1.5s duration)

**File**: `public/sounds/celebration-flourish.mp3`

**Implementation**:
```tsx
// In Dreamboard creation success
soundManager.play('dream_board_created');
```

---

### Sound Settings UI

**File Path**: `src/components/settings/SoundPreferences.tsx`

```tsx
export const SoundPreferences: React.FC = () => {
  const [soundsEnabled, setSoundsEnabled] = React.useState(soundManager.getSoundPreference());

  const handleToggle = (enabled: boolean) => {
    soundManager.toggle(enabled);
    setSoundsEnabled(enabled);
  };

  const testSound = () => {
    soundManager.play('contribution_received');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-outfit font-500">
          🔊 Sound Effects
        </label>
        <button
          onClick={() => handleToggle(!soundsEnabled)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            ${soundsEnabled ? 'bg-teal' : 'bg-border-strong'}
          `}
          aria-label={`Sound effects ${soundsEnabled ? 'enabled' : 'disabled'}`}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform
              ${soundsEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {soundsEnabled && (
        <button
          onClick={testSound}
          className="text-xs text-teal hover:underline"
        >
          Test sound
        </button>
      )}

      <p className="text-xs text-muted">
        {soundsEnabled
          ? 'Sound effects enabled. Plays chimes for contributions and celebrations.'
          : 'Sound effects disabled. Enable to hear celebration sounds.'}
      </p>
    </div>
  );
};
```

---

### Sound File Management

**Organization**:
```
public/
├── sounds/
│   ├── contribution-chime.mp3 (50KB, mono, 22kHz)
│   ├── celebration-flourish.mp3 (120KB, stereo, 44kHz)
│   └── sounds-manifest.json
```

**sounds-manifest.json**:
```json
{
  "contribution_received": {
    "file": "contribution-chime.mp3",
    "duration": 500,
    "volume": 0.3
  },
  "dream_board_created": {
    "file": "celebration-flourish.mp3",
    "duration": 1500,
    "volume": 0.4
  }
}
```

---

## Motion Preferences & Accessibility

### useReducedMotion Hook

**File Path**: `src/hooks/useReducedMotion.ts`

```typescript
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    // Initial check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes (user changes OS accessibility settings)
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Usage:
const prefersReducedMotion = useReducedMotion();
if (prefersReducedMotion) {
  // Skip animations, use static version
}
```

### Motion-Safe Wrapper Pattern

**Component Example**:
```tsx
interface MotionSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MotionSafe: React.FC<MotionSafeProps> = ({ children, fallback }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage:
<MotionSafe
  fallback={<StaticCheckmark />}
>
  <AnimatedCheckmark />
</MotionSafe>
```

### Confetti Fallback for Reduced Motion

**Implementation**:
```tsx
<ConfettiTrigger
  trigger="dream-board-created"
  disableForReducedMotion={true}
/>

// Fallback component displays static success checkmark instead
const showStaticSuccessCheckmark = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="text-6xl text-success">✓</div>
      <p className="text-lg text-dark mt-4">Dreamboard Created!</p>
    </div>
  );
};
```

### WCAG Compliance

**Standards**:
- WCAG 2.1 Level AA requires respecting `prefers-reduced-motion`
- All animations must have duration ≥ 0.1s and ≤ 3s
- Avoid rapid flashing (> 3 flashes per second)
- Ensure all interactive elements have keyboard access

**Testing**:
```bash
# Chrome DevTools: Simulate prefers-reduced-motion
1. Open DevTools
2. Command Palette (Cmd+Shift+P)
3. "Rendering" tab → "Emulate CSS media feature prefers-reduced-motion"
4. Select "prefers-reduced-motion: reduce"
```

---

## Implementation Guide

### Priority Order (Recommend Implementation Sequence)

1. **Core Animations** (Essential)
   - Button hover states (low-hanging fruit)
   - Card entry animations
   - useReducedMotion hook

2. **Success Celebrations** (High Priority)
   - Confetti system (dream-board-created trigger)
   - Success checkmark animation
   - Contribution confetti

3. **Micro-Interactions** (Medium Priority)
   - Progress bar counting animation
   - Contribution slide-in
   - Avatar bounce

4. **Haptic & Sound** (Nice-to-Have)
   - Haptic feedback implementation
   - Sound effects (disabled by default)
   - Settings UI for both

### File Structure Summary

```
src/
├── components/
│   ├── effects/
│   │   ├── ConfettiTrigger.tsx
│   │   ├── SuccessCheckmark.tsx
│   │   └── MotionSafe.tsx
│   ├── settings/
│   │   └── SoundPreferences.tsx
│   ├── dream-board/
│   │   ├── DreamBoardCard.tsx (with entry animation)
│   │   └── ProgressBar.tsx (with counting animation)
│   ├── ui/
│   │   └── Button.tsx (with hover lift)
│   └── ...
├── hooks/
│   ├── useReducedMotion.ts
│   └── useHaptic.ts
├── lib/
│   ├── sound-manager.ts
│   └── haptic-preferences.ts
├── config/
│   └── animations.ts (centralized duration/easing config)
└── public/
    └── sounds/
        ├── contribution-chime.mp3
        └── celebration-flourish.mp3
```

### Testing Checklist

- [ ] Confetti triggers work and complete in expected duration
- [ ] Animations respect `prefers-reduced-motion` setting
- [ ] Haptic feedback works on mobile devices (tested on iOS & Android)
- [ ] Sound defaults to OFF and can be toggled in settings
- [ ] All animations are smooth (60 FPS) on low-end devices
- [ ] No animations block main thread (use requestAnimationFrame/transitions)
- [ ] Keyboard navigation unaffected by animations
- [ ] Screen reader announcements not obscured by visual animations

---

## Reference & Performance Notes

### Animation Performance Tips
- Use `transform` and `opacity` for best GPU performance
- Avoid animating `width`, `height`, `left`, `right` (triggers layout recalculations)
- Prefer `requestAnimationFrame` for JS animations
- Use CSS transitions/animations for simple state changes

### File Size Impact
- `canvas-confetti`: ~10KB (gzipped)
- `howler.js`: ~20KB (gzipped)
- Custom hooks & components: ~5KB (gzipped)
- Total additions: ~35KB (easily offset by optimization benefits)

### Browser Support
- Animations: All modern browsers (Edge, Chrome, Firefox, Safari)
- Confetti: All modern browsers (polyfill canvas for IE11 if needed)
- Haptic API: iOS Safari 13+, Chrome 61+, Android devices
- Reduced Motion: All modern browsers

---

*Document Version: 1.0 | Last Updated: 2024 | Implementation-Ready for AI Coding Agents*
