// Lovable Cloud auth stub — package removed from runtime bundle.
// Restore @lovable.dev/cloud-auth-js if you re-enable Lovable auth.

export const lovable = {
  auth: {
    signInWithOAuth: async () => ({
      error: new Error("Lovable auth is not configured in this build."),
    }),
  },
};
