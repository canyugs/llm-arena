# Frontend Development Guidelines

## REACT_CODING_STANDARDS

- Use functional components with hooks instead of class components
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Use the new use hook for data fetching in React 19+ projects
- Leverage Server Components for {{data_fetching_heavy_components}} when using React with Next.js or similar frameworks
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

## 1. Frontend (Next.js)
- **Separation of Concerns**: Separate pages and shared components; encapsulate core logic in Hooks (`hooks/`) or React Contexts (`contexts/`) to adhere to the single responsibility principle.
- **Component Design**: Place shared components under `app/_components/` to enforce DRY and split into subcomponents as needed.
- Use App Router and Server Components for improved performance and SEO
- Implement route handlers for API endpoints instead of the pages/api directory
- Use server actions for form handling and data mutations from Server Components
- Leverage Next.js Image component with proper sizing for core web vitals optimization
- Implement the Metadata API for dynamic SEO optimization
- Use React Server Components for {{data_fetching_operations}} to reduce client-side JavaScript
- Implement Streaming and Suspense for improved loading states
- Use the new Link component without requiring a child <a> tag
- Leverage parallel routes for complex layouts and parallel data fetching
- Implement intercepting routes for modal patterns and nested UIs


## 2. Styling (Tailwind CSS)
- **Mobile-First**: Write responsive styles with mobile devices in mind to ensure consistent rendering across screen sizes.
- **Utility-First**: Favor native Tailwind utility classes, minimize custom CSS, and centralize style management.
- **Maintainability**: Avoid complex custom CSS; manage colors and spacing via variables or design tokens.

## 3. UI Components (Radix UI + Custom)
- **Accessibility**: When building on Radix UI primitives, follow a11y best practices, including keyboard support and ARIA attributes.
- **Modularity**: Extract common behaviors and styles into custom UI components under `components/ui/` to remove duplication.
- **Theme Consistency**: Ensure custom components support global theming (Light / Dark) in sync with Tailwind theme tokens.