# Experiment List Design Overhaul

## Problem
The user reported that the subject experiment pages (Physics, Chemistry, Biology) looked "monotonous". 
- **Issue**: Every element on the page (borders, backgrounds, badges, buttons) used the exact same subject-specific color (e.g., all Green for Biology).
- **Result**: A "wall of color" effect that lacked visual hierarchy and looked repetitive.

## Solution Implemented
Refactored `ExperimentList.tsx` to introduce a cleaner, more modern card design that uses color strategically rather than overwhelmingly.

### Key Changes
1.  **Removed Heavy Borders**: 
    - Old: `border-2 border-green-500` on every card.
    - New: Clean white card with a subtle shadow and a `4px` top accent bar.

2.  **Section-Based Color Coding**:
    - Introduced `getSectionMetadata(section)` helper function.
    - Instead of coloring every card by Subject (Physics=Blue), cards are now colored by **Topic/Section** (e.g., Mechanics=Blue, Optics=Cyan, Thermodynamics=Red).
    - This breaks up the visual monotony while keeping the page cohesive.

3.  **Modern Typography & Spacing**:
    - Increased padding and whitespace.
    - Added a large, gradient-styled header for the Page Title to establish identity immediately.
    - Improved Badge styling to be lighter and more professional (`bg-slate-50` vs saturated colors).

4.  **Interactive Elements**:
    - "Start Simulation" buttons retain the strong Subject Brand color to serve as clear Calls to Action (CTA).
    - Hover effects now lift the card slightly (`-translate-y-1`) rather than just glowing.

### File Modified
- `src/pages/student/experimentSimulation/ExperimentList.tsx`

### Visual Result
- **Physics Page**: Still feels like "Physics", but individual cards have varied accent colors (Blue, Purple, Amber) based on their specific topic.
- **Biology Page**: No longer a "Green Wall".
