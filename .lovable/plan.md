

# Bellbill Views - Digital Radio Station Website

## Overview
A modern, mobile-first website for "Bellbill Views" - an internet radio station based in Nigeria. The design will be bold, vibrant, and contemporary with African-inspired energy, featuring a dark mode default theme with bright accent colors (greens, yellows, reds).

---

## Design System

### Color Palette
- **Primary Background**: Deep charcoal/black (#0D0D0D)
- **Accent Colors**: Vibrant green, golden yellow, warm red
- **Text**: Clean whites and soft grays
- **Cards**: Subtle dark gray with vibrant borders/accents

### Typography & Feel
- Bold, modern sans-serif headings
- Clean body text with strong hierarchy
- Generous spacing for readability
- Smooth hover animations and transitions

---

## Pages & Features

### 1. Homepage
- **Hero Section**: Full-width with station name, slogan "The Sound of Culture, Voice, and Music", and gradient/animated background
- **Listen Live Button**: Prominent, pulsing CTA button
- **Audio Player Widget**: Compact HTML5 player with play/pause and volume controls
- **Now Playing/On Air**: Real-time display section (placeholder for future integration)
- **Featured Shows**: Horizontal scrollable cards highlighting top programs
- **Social Media Bar**: Instagram, X (Twitter), Facebook, YouTube, WhatsApp icons
- **Support CTA**: "Partner with Us" section for sponsors

### 2. Live Radio Page
- **Large Centered Player**: Full-featured audio player with station branding
- **Welcome Message**: Short intro about the station
- **Sticky Player**: Fixed player bar on mobile for uninterrupted listening while scrolling
- **Share & Social Links**: Easy sharing options

### 3. Programs/Shows Page
- **Responsive Grid Layout**: Scalable card-based grid
- **Show Cards**: Each includes show image, name, host, schedule (days/time), and description
- **Filter/Category Tags** (optional): For future show categorization
- **Empty State Ready**: Designed to grow as more programs are added

### 4. About Us Page
- **Story Section**: Bellbill Views origin and journey
- **Mission, Vision, Values**: Professional statements for partners
- **Team/Hosts Section** (optional): Space for presenter profiles
- **Media Brand Positioning**: Credible, culture-focused messaging

### 5. Contact & Support Page
- **Contact Form**: Name, email, subject, message fields with validation
- **Direct Contact**: Email display and WhatsApp click-to-chat button
- **Partnership Section**: Clear CTA for sponsors and business inquiries
- **Social Links**: All platform connections

---

## Technical Implementation

### Components Architecture
- Reusable `AudioPlayer` component (HTML5-based, cross-browser compatible)
- Shared `Navigation` and `Footer` components
- `ShowCard` component for program listings
- `ContactForm` with validation
- `SocialLinks` component
- `StickyPlayer` wrapper for mobile

### Future-Ready Structure
- Data structures designed for easy Supabase integration
- Separate data files for shows/programs (easy CRUD migration)
- Component props designed for dynamic content

### Responsive Design
- Mobile-first breakpoints
- Touch-friendly controls on audio player
- Collapsible navigation menu for mobile
- Sticky audio player on small screens

---

## Navigation Structure
- **Logo/Brand** (left)
- **Menu Items**: Home, Listen Live, Shows, About, Contact
- **Listen Now Button** (highlighted CTA)
- **Mobile Hamburger Menu** with slide-out drawer

---

## User Experience Highlights
- Smooth page transitions
- Hover effects on cards and buttons
- Loading states for audio stream
- Clear visual feedback for player controls
- Accessible design (ARIA labels, keyboard navigation)

