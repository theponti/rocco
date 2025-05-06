# Rocco Design System & Style Guide

## Overview

This document outlines the design principles, components, and styling guidelines for the Rocco application. Our design system follows a modern, premium SaaS approach with glassmorphism effects, dark theme, and a cohesive aesthetic throughout the application.

## Brand Identity

### Colors

#### Primary Colors
- **Indigo/Purple Gradient**: `linear-gradient(135deg, #6366f1, #8b5cf6)`
  - Used for primary buttons, important UI elements, and accent details
- **Dark Background**: `#0d0c22` (Base dark theme color)
- **Glass Surface**: `rgba(30, 30, 36, 0.5)` with `backdrop-filter: blur(12px)`

#### Secondary Colors
- **White (Text)**: `#FFFFFF` with varying opacity levels:
  - Primary Text: `rgba(255, 255, 255, 1)` 
  - Secondary Text: `rgba(255, 255, 255, 0.7)`
  - Tertiary Text: `rgba(255, 255, 255, 0.5)`
- **Red Accent**: `linear-gradient(135deg, #f43f5e, #ef4444)` (used for delete actions)
- **Green Success**: `#10b981` (success states and confirmations)
- **Yellow Rating**: `#facc15` (star ratings)

### Typography

- **Primary Font**: Inter, sans-serif
- **Headings**: 
  - H1: `text-4xl md:text-5xl lg:text-6xl font-bold`
  - H2: `text-3xl md:text-4xl font-bold`
  - H3: `text-xl font-semibold`
- **Body Text**:
  - Regular: `text-base text-white/80`
  - Small: `text-sm text-white/70`
  - Extra Small: `text-xs text-white/60`

### Spacing

- **Base Unit**: 4px (0.25rem)
- **Content Padding**: 
  - Mobile: `px-4 py-4`
  - Desktop: `px-6 md:px-8 py-6`
- **Component Gap**: 
  - Tight: `gap-2` (8px)
  - Default: `gap-4` (16px)
  - Loose: `gap-6` (24px)

## Components

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #6366f1, #8b5cf6);
border: none;
box-shadow: 0 4px 14px rgba(99, 102, 241, 0.39);
font-weight: 600;
padding: 0.625rem 1.5rem;
transition: all 0.3s ease;
border-radius: 0.5rem;
```

**Hover State**:
```css
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
background: linear-gradient(135deg, #5457ea, #7c50e7);
```

#### Secondary Button
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
color: white;
font-weight: 500;
transition: all 0.2s ease;
```

**Hover State**:
```css
background: rgba(255, 255, 255, 0.1);
```

#### Danger Button
```css
background: linear-gradient(135deg, #f43f5e, #ef4444);
border: none;
transition: all 0.3s ease;
```

**Hover State**:
```css
transform: translateY(-2px);
box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
```

### Cards

#### Standard Card
```css
position: relative;
border-radius: 16px;
background: rgba(30, 30, 36, 0.5);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
transition: all 0.3s ease;
```

**Hover State**:
```css
transform: translateY(-4px);
box-shadow: 0 15px 40px -10px rgba(99, 102, 241, 0.3);
border-color: rgba(99, 102, 241, 0.3);
```

#### Empty State Card
```css
position: relative;
border-radius: 16px;
padding: 2.5rem 1.5rem;
background: rgba(30, 30, 36, 0.3);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.05);
box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.2);
```

### Type Badges

```css
position: relative;
border-radius: 20px;
padding: 0.25rem 0.625rem;
font-size: 0.75rem;
font-weight: 500;
background: rgba(99, 102, 241, 0.15);
color: rgba(255, 255, 255, 0.9);
border: 1px solid rgba(99, 102, 241, 0.2);
transition: all 0.2s ease;
```

**Hover State**:
```css
background: rgba(99, 102, 241, 0.25);
transform: translateY(-1px);
```

### Dropdown Menus

```css
background: rgba(24, 24, 27, 0.95);
border: 1px solid rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px);
border-radius: 12px;
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
```

### Loaders & Skeletons

```css
background: linear-gradient(90deg, rgba(30, 30, 36, 0.4) 0%, rgba(50, 50, 60, 0.4) 50%, rgba(30, 30, 36, 0.4) 100%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 12px;
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.03);
```

## Page Layout

### Header

- Fixed position with transparency on home page
- Glassmorphism effect that becomes more opaque when scrolling
- Logo with subtle glow effect
- Responsive navigation with mobile menu
- Gradient "Get Started" CTA button

### Hero Section

- Full-width layout with 2-column split on desktop
- Large, attractive heading with gradient text highlights
- Brief, compelling value proposition
- High-quality hero image with overlay UI elements
- Prominent CTA button with subtle animation
- Trust signals (No credit card, free tier)

### Feature Section

- Three column grid on desktop, stack on mobile
- Cards with icon, heading, and description
- Subtle hover effects and animations
- Consistent spacing and alignment

### Testimonials

- Card-based testimonials with ratings
- User images/avatars with gradient background
- Staggered reveal animations on scroll

### Pricing Section

- Three-tiered pricing structure
- "Popular" badge on recommended plan
- Card-based layout with feature lists
- Clear CTAs for each pricing tier

### CTA Section

- Full-width gradient background
- Compelling heading and subheading
- Large prominent button

### Footer

- Multi-column layout with links
- Logo and copyright information
- Social media links
- Clean spacing and separation

## Animation Guidelines

### Micro-interactions

- Button hover: `transform: translateY(-2px)` with increased shadow
- Card hover: `transform: translateY(-4px)` with border color change
- Link hover: Gradient underline animation

### Page Transitions

- Fade in: `opacity: 0` to `opacity: 1` with slight `translateY`
- Stagger children: Sequential reveal of list items

### Scroll Effects

- Parallax scrolling for hero section
- Elements fade in as they enter viewport
- Background subtly responds to scroll position

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: >= 1024px

### Layout Changes

- Stack elements vertically on mobile
- Adjust font sizes based on screen width
- Hide certain UI elements on mobile and provide alternatives
- Full-screen mobile menu with animations

## Accessibility

- Maintain minimum 4.5:1 contrast ratio for text
- Include proper focus states for keyboard navigation
- Add descriptive alt text for all images
- Ensure hover states have equivalent focus states

## Implementation Details

### Glassmorphism

```css
background: rgba(30, 30, 36, 0.5);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### Gradient Text

```css
background: linear-gradient(to right, #6366f1, #a855f7);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Header Transparency Effects

```javascript
const [scrolled, setScrolled] = useState(false);
const isHome = location.pathname === "/";

// In useEffect
const handleScroll = () => {
  setScrolled(window.scrollY > 10);
};

// In styled component
background: ${props => props.isHome && !props.scrolled ? 'transparent' : 'rgba(8, 8, 13, 0.85)'};
```

## Best Practices

1. Maintain consistent spacing using the spacing system
2. Use the color system consistently - avoid introducing new colors
3. Follow responsive design patterns for all components
4. Implement micro-interactions to improve user experience
5. Ensure all interactive elements have proper hover/focus states
6. Use glassmorphism effects thoughtfully - not everywhere
7. Optimize images for performance while maintaining quality
8. Keep animations subtle and purposeful
9. Test on multiple devices and screen sizes