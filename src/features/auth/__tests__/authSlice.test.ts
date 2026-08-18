import reducer, {clearAuthError, setUser, signInThunk} from '../authSlice';

const initial = {user: null, status: 'idle' as const, error: null};

describe('authSlice', () => {
  it('starts signed out', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual(initial);
  });

  it('marks the user authenticated when set', () => {
    const next = reducer(initial, setUser({uid: 'u1', email: 'a@b.com'}));
    expect(next.user).toEqual({uid: 'u1', email: 'a@b.com'});
    expect(next.status).toBe('authenticated');
  });

  it('returns to idle when the user is cleared', () => {
    const signedIn = reducer(initial, setUser({uid: 'u1', email: 'a@b.com'}));
    const next = reducer(signedIn, setUser(null));
    expect(next.user).toBeNull();
    expect(next.status).toBe('idle');
  });

  it('records loading while signing in', () => {
    const next = reducer(initial, {type: signInThunk.pending.type});
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('stores a rejection message', () => {
    const next = reducer(initial, {
      type: signInThunk.rejected.type,
      error: {message: 'Email or password is incorrect.'},
    });
    expect(next.status).toBe('error');
    expect(next.error).toBe('Email or password is incorrect.');
  });

  it('clears the error on demand', () => {
    const errored = {...initial, status: 'error' as const, error: 'nope'};
    expect(reducer(errored, clearAuthError()).error).toBeNull();
  });
});
