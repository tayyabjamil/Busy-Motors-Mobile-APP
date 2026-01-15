# Frontend Design Skill

## Purpose
This skill provides guidance for creating distinctive, polished frontend designs that avoid generic "AI slop" aesthetics. Use this when building UI components, screens, or layouts.

## Design Principles

### Typography
Typography instantly signals quality. Avoid boring, generic fonts.

**Never use:** Inter, Roboto, Open Sans, Lato, default system fonts

**Good choices for React Native:**
- Modern: Poppins, Montserrat, Nunito
- Editorial: Playfair Display, Crimson Pro, Lora
- Technical: IBM Plex family, Source Sans 3
- Distinctive: Bricolage Grotesque, Space Grotesk, DM Sans

**Pairing principle:** High contrast = interesting. Display + monospace, serif + geometric sans, variable font across weights.

**Use extremes:** 100/200 weight vs 800/900, not 400 vs 600. Size jumps of 3x+, not 1.5x.

Pick one distinctive font, use it decisively.

### Color & Theme
Commit to a cohesive aesthetic. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**Avoid:**
- Purple gradients on white backgrounds
- Generic blue (#007AFF) everywhere
- Low-contrast pastels
- Default system colors without customization

**Instead:**
- Create a cohesive color palette with 1-2 dominant colors
- Use sharp, purposeful accents
- Draw inspiration from real-world aesthetics (nature, architecture, culture)
- Consider dark themes, colored backgrounds, or atmospheric gradients
- Define color constants/theme objects for consistency

### Motion & Animation
Add polish through purposeful animations and micro-interactions.

**For React Native:**
- Use Animated API for smooth, performant animations
- Consider react-native-reanimated for complex gestures
- Focus on high-impact moments: page transitions, reveals, loading states
- Use staggered animations (delay) for list items
- Animate scale, opacity, and translateY for entrance effects
- Keep animations subtle and fast (200-400ms)

**Avoid:**
- Over-animating every interaction
- Slow, janky animations
- Animations that delay user actions

### Backgrounds & Depth
Create atmosphere and depth rather than defaulting to solid colors.

**Techniques:**
- Layered gradients (linear, radial)
- Subtle patterns or textures
- Atmospheric effects that match the aesthetic
- Shadow depth and elevation (especially for cards)
- Backdrop blur effects (use with caution on performance)

### Layout & Spacing
**Principles:**
- Use consistent spacing scales (4, 8, 12, 16, 24, 32, 48)
- Generous white space creates breathing room
- Asymmetric layouts are more interesting than centered grids
- Vary component sizes for visual hierarchy
- Use responsive units (wp, hp) for cross-device consistency

## What to Avoid

1. **Overused patterns:**
   - Generic card layouts with minimal styling
   - Predictable headers with centered text
   - Cookie-cutter forms
   - Standard bottom tab bars without customization

2. **Clichéd aesthetics:**
   - Purple gradients
   - Generic blue buttons
   - Times New Roman or Arial
   - Flat, lifeless interfaces

3. **Lack of personality:**
   - Designs that could belong to any app
   - No unique visual language
   - Missing brand identity

## Mobile-Specific Considerations

For React Native apps:
- Design for thumb zones and reachability
- Use platform-specific patterns where appropriate (iOS vs Android)
- Consider safe areas (notches, home indicators)
- Optimize for different screen sizes
- Use haptic feedback for important interactions
- Design empty states thoughtfully
- Consider offline states and loading patterns

## Application Strategy

When building UI:
1. **Start with mood/aesthetic**: What feeling should this convey?
2. **Choose distinctive typography**: Select fonts that match the mood
3. **Define color palette**: 1-2 dominant colors, purposeful accents
4. **Add depth**: Backgrounds, shadows, layers
5. **Animate purposefully**: Key moments, not everything
6. **Iterate on spacing**: Generous, consistent, hierarchical

**Think outside the box!** Vary between light and dark themes, different fonts, different aesthetics. Avoid converging on the same choices across projects.

## When to Use This Skill

Invoke this skill when:
- Creating new screens or components
- Redesigning existing UI
- Building landing pages or marketing materials
- Working on customer-facing interfaces
- The user asks for "better design" or "make it look nicer"
- Building prototypes or MVPs that need visual polish