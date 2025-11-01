// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// export function withAuthEffects() {
//   return signalStoreFeature(
//     { state: type<AuthState>() },
//     withEffects(
//       (
//         store,
//         events = inject(Events),
//         storage = inject(StorageService),
//         injector = inject(Injector),
//         api = inject(AuthApi)
//       ) => {
//         const storageTokens = storage.use<AuthTokens>("auth");

//         return {
//           login: events.on(authEvents.login).pipe(
//             exhaustMap(({ payload }) => {
//               return api.login(payload.credentials).pipe(
//                 map(tokens => authApiEvents.loginSuccess({ tokens })),
//                 catchError(error =>
//                   of(
//                     authApiEvents.loginFailure({
//                       error,
//                     })
//                   )
//                 )
//               );
//             })
//           ),

//           refreshToken: events.on(authEvents.refreshToken).pipe(
//             exhaustMap(({ payload }) => {
//               return api.refresh(payload.refreshToken).pipe(
//                 map(tokens => authApiEvents.refreshTokenSuccess({ tokens })),
//                 catchError(error =>
//                   of(
//                     authApiEvents.refreshTokenFailure({
//                       error,
//                     })
//                   )
//                 )
//               );
//             })
//           ),

//           initializer: events.on(authEvents.initializer).pipe(
//             map(() => {
//               const localTokens = storageTokens.get();
//               if (localTokens) {
//                 patchState(store, { tokens: localTokens });
//               }

//               effect(
//                 () => {
//                   const tokens = store.tokens();
//                   storageTokens.set(tokens);
//                 },
//                 { injector }
//               );

//               if (localTokens) {
//                 return authEvents.refreshToken({
//                   refreshToken: localTokens.refreshToken,
//                 });
//               } else {
//                 return authEvents.logout();
//               }
//             })
//           ),
//         };
//       }
//     )
//   );
// }
