import React, {useCallback, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {EmptyState, Screen, SyncBadge} from '../../components';
import {TaskRow} from './components/TaskRow';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {loadTasks, toggleTask} from '../../features/tasks/taskSlice';
import {
  selectAllTasks,
  selectPendingCount,
  selectTaskStats,
  selectTasksLoading,
} from '../../features/tasks/selectors';
import {scheduleSync} from '../../features/sync/syncController';
import {useTheme} from '../../theme/useTheme';
import {TASK_ROW_HEIGHT} from '../../theme/tokens';
import type {AppStackParamList} from '../../navigation/types';
import type {Task} from '../../types/task';

const TaskListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const dispatch = useAppDispatch();
  const {palette, tokens} = useTheme();

  const userId = useAppSelector(state => state.auth.user?.uid ?? null);
  const tasks = useAppSelector(selectAllTasks);
  const loading = useAppSelector(selectTasksLoading);
  const pendingCount = useAppSelector(selectPendingCount);
  const stats = useAppSelector(selectTaskStats);
  const syncStatus = useAppSelector(state => state.sync.status);

  useEffect(() => {
    if (userId) {
      dispatch(loadTasks(userId));
    }
  }, [dispatch, userId]);

  const handleToggle = useCallback(
    (id: string) => {
      dispatch(toggleTask(id));
      if (userId) {
        scheduleSync(dispatch, userId);
      }
    },
    [dispatch, userId],
  );

  const handlePress = useCallback(
    (id: string) => {
      navigation.navigate('TaskForm', {taskId: id});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Task}) => (
      <TaskRow task={item} onToggle={handleToggle} onPress={handlePress} />
    ),
    [handleToggle, handlePress],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Task> | null | undefined, index: number) => ({
      length: TASK_ROW_HEIGHT,
      offset: TASK_ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const onRefresh = useCallback(() => {
    if (userId) {
      dispatch(loadTasks(userId));
      scheduleSync(dispatch, userId);
    }
  }, [dispatch, userId]);

  return (
    <Screen>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: tokens.spacing.lg,
            paddingTop: tokens.spacing.md,
          },
        ]}>
        <View style={styles.headerText}>
          <Text
            style={{
              color: palette.text,
              fontSize: tokens.fontSize.xl,
              fontWeight: '700',
            }}>
            My Tasks
          </Text>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: tokens.fontSize.sm,
              marginTop: 2,
            }}>
            {stats.remaining} remaining of {stats.total}
          </Text>
        </View>

        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Text
            style={{
              color: palette.primary,
              fontSize: tokens.fontSize.sm,
              fontWeight: '600',
            }}>
            Settings
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.sm,
        }}>
        <SyncBadge status={syncStatus} pendingCount={pendingCount} />
      </View>

      {loading && tasks.length === 0 ? (
        <ActivityIndicator style={{marginTop: tokens.spacing.xl}} />
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 96,
            paddingHorizontal: tokens.spacing.lg,
          }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
          refreshing={loading}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <EmptyState
              title="No tasks yet"
              message="Add your first task. It saves locally straight away and syncs when you are online."
            />
          }
        />
      )}

      <Pressable
        accessibilityLabel="Add task"
        accessibilityRole="button"
        onPress={() => navigation.navigate('TaskForm', {})}
        style={[styles.fab, {backgroundColor: palette.primary}]}>
        <Text style={{color: palette.onPrimary, fontSize: 30, lineHeight: 34}}>
          +
        </Text>
      </Pressable>
    </Screen>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {flex: 1},
  fab: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: 28,
    elevation: 6,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    width: 60,
  },
});
