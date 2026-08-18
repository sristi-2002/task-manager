import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Checkbox} from '../../../components';
import {useTheme} from '../../../theme/useTheme';
import {TASK_ROW_HEIGHT} from '../../../theme/tokens';
import type {Task} from '../../../types/task';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
};

const TaskRowComponent = ({task, onToggle, onPress}: Props) => {
  const {palette, tokens} = useTheme();

  const handleToggle = useCallback(() => onToggle(task.id), [onToggle, task.id]);
  const handlePress = useCallback(() => onPress(task.id), [onPress, task.id]);

  const subtitle = task.reminderAt
    ? new Date(task.reminderAt).toLocaleString()
    : task.description || 'No reminder';

  return (
    <Pressable
      onPress={handlePress}
      style={({pressed}) => [
        styles.row,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: tokens.radius.md,
          opacity: pressed ? 0.9 : 1,
          paddingHorizontal: tokens.spacing.md,
        },
      ]}>
      <Checkbox checked={task.completed} onToggle={handleToggle} />

      <View style={styles.text}>
        <Text
          numberOfLines={1}
          style={{
            color: task.completed ? palette.textMuted : palette.text,
            fontSize: tokens.fontSize.md,
            fontWeight: '600',
            textDecorationLine: task.completed ? 'line-through' : 'none',
          }}>
          {task.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: palette.textMuted,
            fontSize: tokens.fontSize.xs,
            marginTop: 2,
          }}>
          {subtitle}
        </Text>
      </View>

      {task.syncStatus !== 'synced' ? (
        <View style={[styles.dot, {backgroundColor: palette.warning}]} />
      ) : null}
    </Pressable>
  );
};

/** Re-render only when the fields this row actually paints change. */
export const TaskRow = memo(
  TaskRowComponent,
  (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.description === next.task.description &&
    prev.task.completed === next.task.completed &&
    prev.task.reminderAt === next.task.reminderAt &&
    prev.task.syncStatus === next.task.syncStatus,
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    // Height plus margin must total TASK_ROW_HEIGHT for getItemLayout to be right.
    height: TASK_ROW_HEIGHT - 12,
    marginBottom: 12,
  },
  text: {flex: 1},
  dot: {borderRadius: 5, height: 10, width: 10},
});
