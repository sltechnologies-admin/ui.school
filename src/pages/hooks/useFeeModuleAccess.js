
const rolePermissions = {
    Founder: "RW",
    "Principal/HM": "R",
    "School Admin": "RW",
    "Class Incharge": "R",
    "Class Teacher": "R",
    Teacher: "R",
    "App Admin": "RW",
    "Admin": "RW",
};

export function useFeeModuleAccess(role) {
    return {
        canRead: rolePermissions[role]?.includes("R") ?? false,
        canWrite: rolePermissions[role]?.includes("W") ?? false,
    };
}
