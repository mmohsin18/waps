/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_seed_public from "../actions/seed_public.js";
import type * as actions_websites from "../actions/websites.js";
import type * as boardItems from "../boardItems.js";
import type * as boards from "../boards.js";
import type * as waitlist from "../waitlist.js";
import type * as websites from "../websites.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/seed_public": typeof actions_seed_public;
  "actions/websites": typeof actions_websites;
  boardItems: typeof boardItems;
  boards: typeof boards;
  waitlist: typeof waitlist;
  websites: typeof websites;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
