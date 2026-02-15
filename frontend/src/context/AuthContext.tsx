"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: string | null;
    refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
    refreshRole: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const refreshRole = async () => {
        if (!auth.currentUser) {
            setRole(null);
            return;
        }
        try {
            setLoading(true);
            const idTokenResult: IdTokenResult = await auth.currentUser.getIdTokenResult(true);
            const newRole = (idTokenResult.claims.role as string) || 'student';
            setRole(newRole);
        } catch (error) {
            console.error("[AuthContext] Error refreshing role", error);
            setRole('student');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            setRole(null); // Clear role immediately to prevent stale UI

            if (currentUser) {
                setUser(currentUser);
                try {
                    const idTokenResult: IdTokenResult = await currentUser.getIdTokenResult(true);
                    const newRole = (idTokenResult.claims.role as string) || 'student';
                    setRole(newRole);
                } catch (error) {
                    console.error("[AuthContext] Error getting token result", error);
                    setRole('student');
                }
            } else {
                setUser(null);
                // Role already cleared above
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role, refreshRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
