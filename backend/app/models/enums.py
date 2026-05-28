import enum


class UserRole(str, enum.Enum):
    ADMIN_LEADER = "Admin/Leader"
    CORE_TEAM = "Core-Team"
    MEMBER = "Member"


class Department(str, enum.Enum):
    CSE_DS = "CSE-DS"
    CSE_CYBER_SECURITY = "CSE-CyberSecurity"
    GENERAL_CSE = "General-CSE"
    OTHER = "Other"
