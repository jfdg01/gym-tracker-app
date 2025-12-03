# Project Architecture & Structure Guidelines

This document outlines the mandatory architectural standards for the Gym Tracker App, ensuring scalability, performance, and modern best practices.

## 1. Directory Structure

We follow a strict separation of concerns using the **Expo Router** standard.

| Directory | Purpose | Rules |
| :--- | :--- | :--- |
| `app/` | **Routes & Screens**. | Contains `index.tsx`, `_layout.tsx`, and file-based routes. **No reusable components here.** |
| `src/components/` | **UI Components**. | Reusable UI elements. **No URL mapping.** |
| `src/hooks/` | **Custom Hooks**. | Reusable logic (e.g., `useTheme`, `useAuth`). |
| `src/services/` | **Business Logic**. | API calls, data transformation. **No UI code.** |
| `src/types/` | **TypeScript Types**. | Global type definitions. |
| `src/config.ts` | **Configuration**. | Centralized environment variable access. |

## 2. Safe Area Handling (Strict Mandate)

**❌ DEPRECATED:**
*   Do **NOT** use `SafeAreaView` (neither from React Native nor `react-native-safe-area-context`).
*   Do **NOT** wrap the entire app in a single safe area container.

**✅ REQUIRED:**
1.  **Provider**: Wrap the root application in `<SafeAreaProvider>` inside `app/_layout.tsx`.
2.  **Granular Control**: Use the `useSafeAreaInsets` hook to apply padding/margins specifically where needed.

```typescript
// Example: Applying safe area to a specific header
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export const CustomHeader = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ paddingTop: insets.top, height: 60 + insets.top }}>
      {/* Header Content */}
    </View>
  );
};
```

## 3. Navigation

*   **Framework**: **Expo Router**.
*   **Routing**: File-based routing in `app/`.
*   **Type Safety**: Automatic with TypeScript. Use typed aliases (e.g., `@/components/...`).

## 4. State Management

*   **Global State**: **Zustand**.
    *   Use for shared data (User session, Theme, Global Settings).
    *   Use selectors to minimize re-renders: `const value = useStore(state => state.value)`.
*   **Local/Complex State**: **Jotai** (Optional, for atomic updates).
*   **Server State**: Use React Query (TanStack Query) if strictly necessary, otherwise encapsulate in Services.

## 5. Performance Standards

*   **List Rendering**: Always use `FlatList` or `SectionList`.
    *   **Must** implement `getItemLayout`.
    *   **Must** tune `maxToRenderPerBatch` (start with ~10-20).
*   **Images**: Use WebP format.
*   **Memory**: Clean up listeners and subscriptions in `useEffect`.

## 6. Environment Variables

*   **Access**: **NEVER** access `process.env` directly in components.
*   **Pattern**: Use `src/config.ts`.

```typescript
// src/config.ts
export const config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.dev.com",
};
```

*   **Secrets**: Manage via **EAS Secrets**. Do not bundle sensitive keys in client code.

## 7. Data Layer Architecture (DDD Approach)

We follow a **Domain-Driven Design (DDD)** inspired layered architecture to ensure separation of concerns and testability.

### 7.1. The Layers

1.  **Presentation Layer (UI)**: Components and Screens. **Allowed to call**: Services only. **Forbidden**: Calling Repositories or Database directly.
2.  **Service Layer (`src/services`)**: Contains business logic and orchestrates data flow.
    *   **Role**: The entry point for all application logic.
    *   **Dependency Injection**: Services receive Repositories via constructor injection.
    *   **Composition Root**: `src/services/index.ts` instantiates and wires all services and repositories.
3.  **Repository Layer (`src/repositories`)**: Handles data access and persistence.
    *   **Role**: Abstract the database implementation (Drizzle ORM).
    *   **Inheritance**: Repositories extend `BaseRepository` for common CRUD operations.
4.  **Data Layer**: The underlying database (SQLite/Drizzle).

### 7.2. Implementation Rules

*   **Dependency Injection**: Always inject dependencies to allow for easy mocking during testing.
    ```typescript
    // ✅ Correct: Dependency Injection
    export class ExerciseService {
      constructor(private repo: ExerciseRepository) {}
    }
    ```
*   **Singleton Instances**: Use the exported instances from `src/services/index.ts` in your UI components.
    ```typescript
    import { exerciseService } from '@/services';
    ```
*   **Rich Domain Models**: (Future Goal) Encapsulate business logic within Domain Entities rather than just passing DTOs.

