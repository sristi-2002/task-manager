import {isAfter} from '../../utils/datetime';

/**
 * Last-write-wins on updatedAt. Exact ties resolve to remote: an arbitrary but
 * fixed rule means two devices reaching the same tie agree on the outcome.
 */
export const resolveConflict = (
  local: {updatedAt: string},
  remote: {updatedAt: string},
): 'local' | 'remote' =>
  isAfter(local.updatedAt, remote.updatedAt) ? 'local' : 'remote';
