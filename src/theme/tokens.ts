export const tokens = {
  spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32},
  radius: {sm: 6, md: 12, lg: 20, pill: 999},
  fontSize: {xs: 12, sm: 14, md: 16, lg: 20, xl: 28},
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type Tokens = typeof tokens;

/** Fixed row height for the task list — required for FlatList getItemLayout. */
export const TASK_ROW_HEIGHT = 88;
