import * as authentication from "./error.authentication";
import * as collection from "./error.collection";
import * as user from "./error.user";

// TODO: add description to exception
export const Errors = { ...authentication, ...user, ...collection };
