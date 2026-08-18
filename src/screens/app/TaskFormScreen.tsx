import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import {Button, Input, Screen} from '../../components';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {addTask, editTask, removeTask} from '../../features/tasks/taskSlice';
import {selectTaskById} from '../../features/tasks/selectors';
import {scheduleSync} from '../../features/sync/syncController';
import {validateTitle} from '../../utils/validation';
import {useTheme} from '../../theme/useTheme';
import type {AppStackParamList} from '../../navigation/types';

type FormRoute = RouteProp<AppStackParamList, 'TaskForm'>;

const TaskFormScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<FormRoute>();
  const dispatch = useAppDispatch();
  const {palette, tokens} = useTheme();

  const taskId = route.params?.taskId;
  const userId = useAppSelector(state => state.auth.user?.uid ?? null);

  const selectTask = useMemo(() => selectTaskById(taskId ?? ''), [taskId]);
  const existing = useAppSelector(selectTask);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [reminderAt, setReminderAt] = useState<string | null>(
    existing?.reminderAt ?? null,
  );
  const [titleError, setTitleError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [draftDate, setDraftDate] = useState<Date | null>(null);

  const onPickerChange = useCallback(
    (event: {type: string}, selected?: Date) => {
      if (event.type === 'dismissed' || !selected) {
        setPicker(null);
        return;
      }

      if (picker === 'date') {
        // Keep the chosen day, then ask for the time in a second pass.
        setDraftDate(selected);
        setPicker('time');
        return;
      }

      const base = draftDate ?? new Date();
      const combined = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        selected.getHours(),
        selected.getMinutes(),
        0,
        0,
      );

      setPicker(null);

      if (combined.getTime() <= Date.now()) {
        setReminderError('Pick a time in the future.');
        return;
      }

      setReminderError(null);
      setReminderAt(combined.toISOString());
    },
    [draftDate, picker],
  );

  const onSubmit = useCallback(() => {
    const error = validateTitle(title);
    setTitleError(error);
    if (error || !userId) {
      return;
    }

    if (existing) {
      dispatch(editTask({task: existing, title, description, reminderAt}));
    } else {
      dispatch(addTask({userId, title, description, reminderAt}));
    }

    scheduleSync(dispatch, userId);
    navigation.goBack();
  }, [
    description,
    dispatch,
    existing,
    navigation,
    reminderAt,
    title,
    userId,
  ]);

  const onDelete = useCallback(() => {
    if (!taskId || !userId) {
      return;
    }

    Alert.alert('Delete task', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(removeTask(taskId));
          scheduleSync(dispatch, userId);
          navigation.goBack();
        },
      },
    ]);
  }, [dispatch, navigation, taskId, userId]);

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{padding: tokens.spacing.lg}}
          keyboardShouldPersistTaps="handled">
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={titleError}
            placeholder="What needs doing?"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Optional details"
            style={{minHeight: 100, paddingTop: tokens.spacing.sm, textAlignVertical: 'top'}}
          />

          <Text
            style={{
              color: palette.textMuted,
              fontSize: tokens.fontSize.xs,
              fontWeight: '600',
              marginBottom: tokens.spacing.xs,
            }}>
            REMINDER
          </Text>

          <View style={{flexDirection: 'row', gap: tokens.spacing.sm}}>
            <Pressable
              onPress={() => {
                setDraftDate(reminderAt ? new Date(reminderAt) : new Date());
                setPicker('date');
              }}
              style={{
                backgroundColor: palette.surface,
                borderColor: reminderError ? palette.danger : palette.border,
                borderRadius: tokens.radius.md,
                borderWidth: 1,
                flex: 1,
                justifyContent: 'center',
                minHeight: 48,
                paddingHorizontal: tokens.spacing.md,
              }}>
              <Text style={{color: reminderAt ? palette.text : palette.textMuted}}>
                {reminderAt
                  ? new Date(reminderAt).toLocaleString()
                  : 'Set a reminder'}
              </Text>
            </Pressable>

            {reminderAt ? (
              <Pressable
                onPress={() => {
                  setReminderAt(null);
                  setReminderError(null);
                }}
                style={{justifyContent: 'center', paddingHorizontal: tokens.spacing.sm}}>
                <Text style={{color: palette.primary, fontWeight: '600'}}>
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>

          {reminderError ? (
            <Text
              style={{
                color: palette.danger,
                fontSize: tokens.fontSize.xs,
                marginTop: tokens.spacing.xs,
              }}>
              {reminderError}
            </Text>
          ) : null}

          {picker ? (
            <DateTimePicker
              value={draftDate ?? new Date()}
              mode={picker}
              onChange={onPickerChange}
            />
          ) : null}

          <View style={{marginTop: tokens.spacing.xl}}>
            <Button
              title={existing ? 'Save changes' : 'Add task'}
              onPress={onSubmit}
            />
          </View>

          {existing ? (
            <View style={{marginTop: tokens.spacing.md}}>
              <Button title="Delete task" variant="danger" onPress={onDelete} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default TaskFormScreen;
