const TAG_GROUPS = {
  Admin: [
    {
      source: "Admin Auth",
      name: "Auth",
      description: "Admin login, logout, password reset, and token refresh",
    },
    {
      source: "Admin Dealers",
      name: "Dealers",
      description: "Admin dealer management, locations, contacts, and documents",
    },
    {
      source: "Admin Employees",
      name: "Employees",
      description: "Admin employee management and statistics",
    },
    {
      source: "Admin Outlets",
      name: "Outlets",
      description: "Admin outlet management across dealerships",
    },
    {
      source: "Master Documents",
      name: "Master Documents",
      description: "Document type master data",
    },
    {
      source: "Master Brands",
      name: "Master Brands",
      description: "Brand master data",
    },
    {
      source: "Master Organization",
      name: "Master Organization",
      description: "Department and designation master data",
    },
    {
      source: "Master Outlet Functions",
      name: "Master Outlet Functions",
      description: "Outlet function master data",
    },
  ],
  Dealer: [
    {
      source: "Dealer Auth",
      name: "Auth",
      description: "Dealer registration, login, OTP, and password management",
    },
    {
      source: "Dealer Profile",
      name: "Profile",
      description: "Dealer profile and business details",
    },
    {
      source: "Dealer Contact Persons",
      name: "Contact Persons",
      description: "Dealer key contact person management",
    },
    {
      source: "Dealer Outlets",
      name: "Outlets",
      description: "Dealer outlet management",
    },
    {
      source: "Dealer Employees",
      name: "Employees",
      description: "Dealer employee management",
    },
    {
      source: "Dealer Business Documents",
      name: "Business Documents",
      description: "Dealer business document uploads",
    },
  ],
  Employee: [
    {
      source: "Employee Auth",
      name: "Auth",
      description: "Employee registration, login, OTP, and token management",
    },
  ],
  Common: [
    {
      source: "Common",
      name: "Utilities",
      description: "File upload, health check, and shared utilities",
    },
    {
      source: "App Auth",
      name: "App Auth",
      description: "Mobile app authentication",
    },
  ],
};

const buildTagMaps = () => {
  const sourceToGrouped = {};
  const groupedTags = [];
  const xTagGroups = [];

  Object.entries(TAG_GROUPS).forEach(([groupName, tags]) => {
    const groupTagNames = [];

    tags.forEach(({ source, name, description }) => {
      const groupedName = `${groupName} - ${name}`;
      sourceToGrouped[source] = groupedName;
      groupTagNames.push(groupedName);
      groupedTags.push({ name: groupedName, description });
    });

    xTagGroups.push({ name: groupName, tags: groupTagNames });
  });

  return { sourceToGrouped, groupedTags, xTagGroups };
};

const applyTagGroups = (spec) => {
  const { sourceToGrouped, groupedTags, xTagGroups } = buildTagMaps();

  Object.values(spec.paths || {}).forEach((pathItem) => {
    Object.values(pathItem).forEach((operation) => {
      if (!operation?.tags) return;

      operation.tags = operation.tags.map(
        (tag) => sourceToGrouped[tag] || tag,
      );
    });
  });

  spec.tags = groupedTags;
  spec["x-tagGroups"] = xTagGroups;

  return spec;
};

module.exports = {
  TAG_GROUPS,
  applyTagGroups,
};
