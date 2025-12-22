
/**
 * Persistence Reverted to LocalStorage.
 * This file is now inactive but kept to prevent import errors.
 */
export const supabase = {
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error("Local mode active") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        resetPasswordForEmail: async () => ({ error: null })
    },
    from: (table: string) => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }), single: () => ({ data: null, error: null }) }),
        insert: () => ({ error: null }),
        update: () => ({ eq: () => ({ error: null }) }),
        delete: () => ({ eq: () => ({ error: null }) })
    })
} as any;
