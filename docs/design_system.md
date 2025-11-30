# Design System - Gym Tracker App

This document defines the visual language and design parameters for the Gym Tracker App, derived from the "Dark Mode Premium" aesthetic.

## 1. Core Philosophy
*   **Aesthetic**: Dark, sleek, high-performance, premium.
*   **Vibe**: "Night Mode", "Pro Tool", "Focus".
*   **Interaction**: smooth, responsive, tactile.

## 2. Color Palette

We use a customized Zinc-based dark palette with a vibrant Electric Blue accent.

### Backgrounds
*   **App Background**: `#09090b` (Zinc-950) - Deepest dark, almost black.
*   **Surface / Card**: `#18181b` (Zinc-900) - Slightly lighter, used for cards and containers.
*   **Surface Highlight**: `#27272a` (Zinc-800) - Used for inputs, pressed states, or secondary cards.

### Text
*   **Primary**: `#fafafa` (Zinc-50) - High contrast white for headings and main text.
*   **Secondary**: `#a1a1aa` (Zinc-400) - Muted grey for subtitles, captions, and icons.
*   **Tertiary**: `#52525b` (Zinc-600) - Subtle text, placeholders.

### Accents
*   **Primary Brand**: `#3b82f6` (Blue-500) - Vibrant Electric Blue. Used for primary buttons, active states, and key highlights.
*   **Secondary Brand**: `#8b5cf6` (Violet-500) - Used for gradients or special tags.
*   **Success**: `#10b981` (Emerald-500) - Completion, good stats.
*   **Destructive**: `#ef4444` (Red-500) - Delete actions, errors.

### Borders & Dividers
*   **Subtle**: `#27272a` (Zinc-800)
*   **Highlight**: `#3f3f46` (Zinc-700)

## 3. Typography

*   **Font Family**: System Default (San Francisco on iOS, Roboto on Android).
*   **Weights**:
    *   **Bold (700)**: Headings, Button Text.
    *   **SemiBold (600)**: Subheadings, Card Titles.
    *   **Medium (500)**: Body text, Input text.
    *   **Regular (400)**: Captions, Descriptions.

### Scale
*   **Display**: `text-3xl` (30px) - Screen Titles.
*   **Heading**: `text-xl` (20px) - Section Headers.
*   **Body**: `text-base` (16px) - Standard text.
*   **Caption**: `text-sm` (14px) - Subtitles, secondary info.
*   **Tiny**: `text-xs` (12px) - Tags, metadata.

## 4. Components & Styling

### Cards
*   **Background**: `bg-zinc-900`
*   **Border**: `border border-zinc-800` (Subtle definition)
*   **Rounding**: `rounded-2xl` (Modern, soft corners)
*   **Shadow**: `shadow-sm` or `shadow-md` (Subtle depth)

### Buttons
*   **Primary**:
    *   Bg: `bg-blue-500`
    *   Text: `text-white font-bold`
    *   Shape: `rounded-full` or `rounded-xl`
    *   Effect: Active opacity change.
*   **Secondary / Outline**:
    *   Bg: `bg-transparent`
    *   Border: `border border-zinc-700`
    *   Text: `text-zinc-300`
*   **Destructive**:
    *   Bg: `bg-red-500/10` (Subtle tint)
    *   Text: `text-red-500`

### Inputs
*   **Background**: `bg-zinc-900` or `bg-zinc-800`
*   **Text**: `text-white`
*   **Placeholder**: `text-zinc-500`
*   **Border**: `border border-zinc-800` focus: `border-blue-500`
*   **Rounding**: `rounded-xl`
*   **Padding**: `p-4` (Generous touch targets)

### Lists
*   **Separators**: `border-b border-zinc-800`
*   **Item Spacing**: `py-4`

## 5. Spacing & Layout
*   **Screen Padding**: `px-6` (24px) - Standard horizontal padding for main views.
*   **Section Spacing**: `mb-8` (32px) - Space between major sections.
*   **Card Padding**: `p-6` (24px) - Standard internal padding for cards.
*   **Element Spacing**: `space-x-4` or `space-y-4` - Standard gap between related elements.
*   **Touch Targets**: Minimum 44x44pt.

## 6. Tailwind Configuration Guide

Extend the Tailwind config to map these semantic names if desired, or stick to the Zinc/Blue scales.

```javascript
// tailwind.config.js extension suggestion
theme: {
  extend: {
    colors: {
      background: '#09090b',
      surface: '#18181b',
      surfaceHighlight: '#27272a',
      primary: '#3b82f6',
      textMain: '#fafafa',
      textMuted: '#a1a1aa',
    }
  }
}
```
