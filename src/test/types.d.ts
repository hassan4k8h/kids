/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest/globals" />

import '@testing-library/jest-dom';

// Extend Jest matchers with Testing Library matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      // Core Jest matchers
      toBe(expected: T): void;
      toEqual(expected: T): void;
      toStrictEqual(expected: T): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeNull(): void;
      toBeUndefined(): void;
      toBeDefined(): void;
      toContain(expected: any): void;
      toMatch(expected: string | RegExp): void;
      toThrow(expected?: string | RegExp | Error): void;
      
      // Testing Library specific matchers
      toBeInTheDocument(): void;
      toHaveAccessibleDescription(description?: string | RegExp): void;
      toHaveAccessibleName(name?: string | RegExp): void;
      toHaveAttribute(attr: string, value?: string | RegExp): void;
      toHaveClass(className: string): void;
      toHaveFocus(): void;
      toHaveFormValues(expectedValues: Record<string, any>): void;
      toHaveStyle(css: string | Record<string, any>): void;
      toHaveTextContent(text: string | RegExp): void;
      toHaveValue(value: string | string[] | number): void;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): void;
      toBeChecked(): void;
      toBePartiallyChecked(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeEmptyDOMElement(): void;
      toBeInvalid(): void;
      toBeRequired(): void;
      toBeValid(): void;
      toBeVisible(): void;
    }
  }
}