const dayjs = require("dayjs");

function getFadaIdStatus(employee) {
  if (!employee?.fadaId) return "none";
  if (employee.isActive && employee.isVerified) return "active";
  return "created";
}

function getProfileCompletionStatus(employee) {
  return {
    completed: Boolean(employee?.isProfileCompleted),
    percentage: employee?.isProfileCompleted ? 100 : employee?.isRegistrationCompleted ? 50 : 0,
  };
}

function getVerificationStatus(employee, assignment) {
  if (employee?.status === "rejected" || assignment?.status === "rejected") {
    return "rejected";
  }
  if (employee?.isVerified && assignment?.status === "verified") {
    return "verified";
  }
  if (employee?.status === "pending" || assignment?.status === "pending") {
    return "pending";
  }
  return employee?.status || assignment?.status || "unknown";
}

function getMembershipStatus(employee, assignment) {
  if (assignment?.status === "verified" && employee?.status === "approved") {
    return "active";
  }
  return "pending";
}

function getEmployeeCode(employee) {
  if (employee?.fadaId) return employee.fadaId;
  return `EMP-${employee?.id}`;
}

function getEmploymentStatus(assignment) {
  if (!assignment) return "unassigned";
  if (assignment.isCurrentlyWorking) return "active";
  if (assignment.status === "completed") return "completed";
  if (assignment.status === "rejected") return "rejected";
  if (assignment.status === "pending") return "pending";
  if (!assignment.isActive) return "inactive";
  return "inactive";
}

function getOnboardingStage(employee, docStats = {}) {
  if (
    employee?.isJourneyCompleted &&
    employee?.isVerified &&
    employee?.isKycCompleted
  ) {
    return "fully_completed";
  }
  if (employee?.isVerified) return "verified";
  if (docStats.submittedCount > 0 || employee?.isKycCompleted) {
    return "documents_submitted";
  }
  if (employee?.isProfileCompleted) return "profile_completed";
  if (employee?.isRegistrationCompleted) return "registered";
  return "registered";
}

function getAgeingDays(pendingSince) {
  if (!pendingSince) return 0;
  return Math.max(0, dayjs().diff(dayjs(pendingSince), "day"));
}

function getAgeingBucket(pendingSince) {
  const days = getAgeingDays(pendingSince);
  if (days <= 2) return "0-2";
  if (days <= 7) return "3-7";
  if (days <= 15) return "8-15";
  return "15+";
}

function getAdoptionPercentage(withFadaId, total) {
  if (!total) return 0;
  return Math.round((withFadaId / total) * 10000) / 100;
}

function getActionRequired(employee, docStats = {}) {
  if (docStats.rejectedCount > 0) return "Resubmit rejected documents";
  if (!employee?.isProfileCompleted) return "Complete profile";
  if (!employee?.isKycCompleted) return "Submit documents";
  if (!employee?.isVerified) return "Awaiting verification";
  if (!employee?.isJourneyCompleted) return "Complete onboarding journey";
  return "None";
}

function getDealerOnboardingStage(dealer, profile, docStats = {}, employeeCount = 0) {
  if (dealer?.isActive && employeeCount > 0) return "active";
  if (dealer?.isActive) return "activated";
  if (dealer?.status === "approved") return "verified";
  if (docStats.submittedCount > 0) return "documentsSubmitted";
  if (profile?.typeOfDealership && profile?.panNumber) return "profileCompleted";
  if (dealer?.status !== "temporary") return "registered";
  return "invited";
}

module.exports = {
  getFadaIdStatus,
  getProfileCompletionStatus,
  getVerificationStatus,
  getMembershipStatus,
  getEmployeeCode,
  getEmploymentStatus,
  getOnboardingStage,
  getAgeingDays,
  getAgeingBucket,
  getAdoptionPercentage,
  getActionRequired,
  getDealerOnboardingStage,
};
