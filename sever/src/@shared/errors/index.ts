import * as authentication from './error.authentication';
import * as collection from './error.collection';
import * as user from './error.user';

export const Errors = {
  ...authentication,
  ...collection,
  ...user,
};
