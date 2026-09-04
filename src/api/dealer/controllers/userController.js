const {
  sequelize,
  Dealer,
  DealerLocation,
  DealerProfile,
  Employee,
  EmployeeAssignment,
  EmployeeLeaveEmployeement,
  EmployeeEmployerStatus,
  Outlet,
  ScoreStage,
} = require("../../../database/models");
const Validator = require("validatorjs");
const dayjs = require("dayjs");
const { Op } = require("sequelize");

function parseDashboardDateRange(query) {
  const startDate = query.startDate
    ? dayjs(query.startDate).startOf("day")
    : dayjs().startOf("month");
  const endDate = query.endDate
    ? dayjs(query.endDate).endOf("day")
    : dayjs().endOf("day");

  if (!startDate.isValid() || !endDate.isValid()) {
    return { error: "Invalid startDate or endDate" };
  }

  if (startDate.isAfter(endDate)) {
    return { error: "startDate cannot be after endDate" };
  }

  return {
    startDate,
    endDate,
    weekStart: dayjs().startOf("week"),
    weekEnd: dayjs().endOf("week"),
  };
}

function buildStatCount(count, changeThisWeek) {
  return { count, changeThisWeek };
}

async function resolveScoreStage(averageScore, scoreStages) {
  if (!scoreStages.length) {
    return { statusLabel: "Needs Work", statusColor: "#EF4444" };
  }

  const stage = scoreStages.find(
    (item) =>
      averageScore >= item.minScore && averageScore <= item.maxScore,
  );

  if (stage) {
    return { statusLabel: stage.name, statusColor: stage.colorHex };
  }

  if (averageScore < scoreStages[0].minScore) {
    return { statusLabel: "Needs Work", statusColor: "#EF4444" };
  }

  const lastStage = scoreStages[scoreStages.length - 1];
  return { statusLabel: lastStage.name, statusColor: lastStage.colorHex };
}

async function calculateTop25Percent(dealerId) {
  const dealerEmployees = await Employee.findAll({
    attributes: ["score"],
    include: [
      {
        model: EmployeeAssignment,
        as: "assignment",
        attributes: [],
        required: true,
        where: {
          dealerId,
          isCurrentlyWorking: true,
          isActive: true,
        },
      },
    ],
  });

  if (!dealerEmployees.length) {
    return { top25Percent: 0, averageScore: null, employeeCount: 0 };
  }

  const scores = dealerEmployees.map((employee) => employee.score ?? 0);
  const averageScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length,
  );

  const globalScores = await Employee.findAll({
    attributes: ["score"],
    order: [["score", "ASC"]],
  });

  let top25Percent = 0;

  if (globalScores.length) {
    const thresholdIndex = Math.floor(globalScores.length * 0.75);
    const threshold = globalScores[thresholdIndex]?.score ?? 0;
    const inTop25 = scores.filter((score) => score >= threshold).length;
    top25Percent = Math.round((inTop25 / scores.length) * 100);
  }

  return {
    top25Percent,
    averageScore,
    employeeCount: scores.length,
  };
}

async function fetchRecentEmploymentRequests(dealerId, limit = 5) {
  const [joinRequests, exitRequests, transferRequests] = await Promise.all([
    EmployeeAssignment.findAll({
      where: { dealerId, status: "pending" },
      attributes: ["id", "status", "createdAt"],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "fadaId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    }),
    EmployeeLeaveEmployeement.findAll({
      where: { dealerId, status: "pending" },
      attributes: ["id", "status", "createdAt"],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "fadaId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    }),
    EmployeeAssignment.findAll({
      where: { dealerId },
      attributes: ["id", "status", "createdAt"],
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "fadaId"],
        },
        {
          model: EmployeeEmployerStatus,
          as: "statuses",
          attributes: ["status"],
          where: {
            slug: "joining",
            status: "transfered",
          },
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
    }),
  ]);

  const recentRequests = [
    ...joinRequests.map((item) => ({
      id: item.id,
      type: "join",
      employeeId: item.employee?.id ?? null,
      employeeName: item.employee?.name ?? null,
      fadaId: item.employee?.fadaId ?? null,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...exitRequests.map((item) => ({
      id: item.id,
      type: "exit",
      employeeId: item.employee?.id ?? null,
      employeeName: item.employee?.name ?? null,
      fadaId: item.employee?.fadaId ?? null,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...transferRequests.map((item) => ({
      id: item.id,
      type: "transfer",
      employeeId: item.employee?.id ?? null,
      employeeName: item.employee?.name ?? null,
      fadaId: item.employee?.fadaId ?? null,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, limit);

  return recentRequests;
}

/*
@API: GET /dealers/profile
@Desc: Get dealer profile
@Access: Private     
*/
exports.getProfile = async (req, res) => {
  try {
    const id = req.currentDealerId;

    const profile = await Dealer.findOne({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "dealerCode",
        "dealerId",
        "brands",
        "status",
        "isActive",
        "profilePicture",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Outlets
            WHERE Outlets.dealerId = ${id}
          )`),
          "totalOutlets",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM EmployeeAssignments
            WHERE EmployeeAssignments.dealerId = ${id}
            AND EmployeeAssignments.isActive = true
          )`),
          "allEmployees",
        ],
      ],
      where: { id },
      include: [
        {
          model: DealerProfile,
          as: "profile",
          required: false,
        },
        {
          model: DealerLocation,
          as: "location",
          required: false,
        },
      ],
    });

    return res.apiSuccess("Profile fetched successfully", profile);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/profile
@Desc: Update dealer profile
@Body: {
    typeOfDealership: string,
    yearOfEstablishment: string,
    panNumber: string,
    fadaMembershipId: string,
    fadaMemberSince: date,
    name: string,
    phone: string,
    dealerLocations : {

    }
}
@Access: Private     
*/
exports.updateProfile = async (req, res) => {
  const validator = new Validator(req.body, {
    typeOfDealership: "string",
    yearOfEstablishment: "string",
    panNumber: "required|string",
    fadaMembershipId: "string",
    fadaMemberSince: "date",
    brandsRepresented: "required",
    name: "required|string",
    phone: "required|string",
    address: "required|string",
    city: "required|string",
    pinCode: "required|string",
    state: "required|string",
  });

  if (validator.fails()) {
    return res.apiError(validator.errors.all(), 400);
  }

  try {
    const id = req.currentDealerId;

    const {
      typeOfDealership,
      yearOfEstablishment,
      panNumber,
      fadaMembershipId,
      fadaMemberSince,
      name,
      phone,
      brandsRepresented,
      dealerLocations,
    } = req.body;

    await sequelize.transaction(async (transaction) => {
      // Profile Data
      const profileData = {};

      if (typeOfDealership !== undefined) {
        profileData.typeOfDealership = typeOfDealership;
      }

      if (yearOfEstablishment !== undefined) {
        profileData.yearOfEstablishment = yearOfEstablishment;
      }

      if (panNumber !== undefined) {
        profileData.panNumber = panNumber;
      }

      if (fadaMembershipId !== undefined) {
        profileData.fadaMembershipId = fadaMembershipId || "";
      }

      if (fadaMemberSince !== undefined) {
        profileData.fadaMemberSince = fadaMemberSince !== "" ? fadaMemberSince : null;
      }

      // Dealer Data
      const dealerData = {};

      if (name !== undefined) {
        dealerData.name = name;
      }

      if (phone !== undefined) {
        dealerData.phone = phone;
      }

      if (brandsRepresented !== undefined) {
        dealerData.brands = brandsRepresented;
      }

      // Update/Create Dealer Profile
      if (Object.keys(profileData).length > 0) {
        const profile = await DealerProfile.findOne({ where: { dealerId: id }, transaction });

        if (profile) {
          await profile.update(profileData, { transaction });
        } else {
          await DealerProfile.create({ dealerId: id, ...profileData }, { transaction });
        }
      }

      // Update Dealer
      if (Object.keys(dealerData).length > 0) {
        await Dealer.update(dealerData, {
          where: { id },
          transaction,
        });
      }

      // Update/Create Dealer Location
      if (dealerLocations !== undefined) {
        const dealerLocation = await DealerLocation.findOne({ where: { dealerId: id }, transaction });

        if (dealerLocation) {
          await dealerLocation.update(dealerLocations, { transaction });
        } else {
          await DealerLocation.create({ dealerId: id, ...dealerLocations }, { transaction });
        }
      }
    });

    return res.apiSuccess("Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);

    return res.apiError(
      error.message || "Something went wrong",
      500,
      error
    );
  }
};


/*
@API: GET /dealers/group-dealers
@Desc: Get group dealers
@Access: Private     
*/
exports.getGroupDealers = async (req, res) => {
  try {
    const id = req.currentDealerId;

    const groupDealers = await Dealer.findAll({
      where: { parentDealerId: id, isActive: true },
      attributes: ["id", "name", "dealerCode"]
    });

    return res.apiSuccess("Group dealers fetched successfully", groupDealers);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

/*
@API: PUT /dealers/user/upload-profile-picture
@Desc: Update dealer profile picture
@Body: {
  fileUrl: string, 
}
@Access: Private     
*/
exports.uploadProfilePicture = async (req, res) => {
  try {

    const validator = new Validator(req.body, {
      fileUrl: "required|string",
    });

    if (validator.fails()) {
      return res.apiError(Object.values(validator.errors.all()).flat()[0], 422);
    }

    const id = req.currentDealerId;

    await Dealer.update({ profilePicture: req.body.fileUrl }, { where: { id } });

    return res.apiSuccess("Profile picture uploded successfully.");
  } catch (error) {
    return res.apiError("Internal server error", 500);
  }
};

/*
@API: GET /dealers/user/dashboard
@Desc: Get dealer dashboard statistics
@Query: startDate, endDate (YYYY-MM-DD)
@Access: Private
*/
exports.getDashboard = async (req, res) => {
  try {
    const dealerId = Number(req.currentDealerId);
    const dateRange = parseDashboardDateRange(req.query);

    if (dateRange.error) {
      return res.apiError(dateRange.error, 422);
    }

    const { startDate, endDate, weekStart, weekEnd } = dateRange;
    const periodStart = startDate.format("YYYY-MM-DD");
    const periodEnd = endDate.format("YYYY-MM-DD");
    const weekStartDate = weekStart.format("YYYY-MM-DD HH:mm:ss");
    const weekEndDate = weekEnd.format("YYYY-MM-DD HH:mm:ss");

    const assignmentBaseWhere = { dealerId };
    const activeAssignmentWhere = {
      dealerId,
      isCurrentlyWorking: true,
      isActive: true,
    };

    const [
      totalEmployees,
      activeEmployees,
      newJoinsInPeriod,
      exitsInPeriod,
      totalEmployeesThisWeek,
      activeEmployeesThisWeek,
      newJoinsThisWeek,
      exitsThisWeek,
      employeesByOutlet,
      pendingJoinRequests,
      pendingExitRequests,
      pendingTransferRequests,
      scoreStages,
      recentEmploymentRequests,
    ] = await Promise.all([
      EmployeeAssignment.count({
        where: assignmentBaseWhere,
        distinct: true,
        col: "employeeId",
      }),
      EmployeeAssignment.count({ where: activeAssignmentWhere }),
      EmployeeAssignment.count({
        where: {
          ...assignmentBaseWhere,
          startDate: {
            [Op.between]: [periodStart, periodEnd],
          },
        },
      }),
      EmployeeLeaveEmployeement.count({
        where: {
          dealerId,
          status: { [Op.in]: ["accepted", "completed"] },
          [Op.or]: [
            {
              lastWorkingDate: {
                [Op.between]: [periodStart, periodEnd],
              },
            },
            {
              updatedAt: {
                [Op.between]: [startDate.toDate(), endDate.toDate()],
              },
            },
          ],
        },
      }),
      EmployeeAssignment.count({
        where: {
          ...assignmentBaseWhere,
          createdAt: {
            [Op.between]: [weekStartDate, weekEndDate],
          },
        },
      }),
      EmployeeAssignment.count({
        where: {
          ...activeAssignmentWhere,
          startDate: {
            [Op.between]: [weekStart.format("YYYY-MM-DD"), weekEnd.format("YYYY-MM-DD")],
          },
        },
      }),
      EmployeeAssignment.count({
        where: {
          ...assignmentBaseWhere,
          startDate: {
            [Op.between]: [weekStart.format("YYYY-MM-DD"), weekEnd.format("YYYY-MM-DD")],
          },
        },
      }),
      EmployeeLeaveEmployeement.count({
        where: {
          dealerId,
          status: { [Op.in]: ["accepted", "completed"] },
          [Op.or]: [
            {
              lastWorkingDate: {
                [Op.between]: [
                  weekStart.format("YYYY-MM-DD"),
                  weekEnd.format("YYYY-MM-DD"),
                ],
              },
            },
            {
              updatedAt: {
                [Op.between]: [weekStartDate, weekEndDate],
              },
            },
          ],
        },
      }),
      Outlet.findAll({
        attributes: [
          "id",
          "name",
          "code",
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM EmployeeAssignments
              WHERE EmployeeAssignments.outletId = Outlet.id
              AND EmployeeAssignments.dealerId = ${dealerId}
              AND EmployeeAssignments.isCurrentlyWorking = true
              AND EmployeeAssignments.isActive = true
              AND EmployeeAssignments.deletedAt IS NULL
            )`),
            "employeeCount",
          ],
        ],
        where: { dealerId, isActive: true },
        order: [["name", "ASC"]],
      }),
      EmployeeAssignment.count({
        where: { dealerId, status: "pending" },
      }),
      EmployeeLeaveEmployeement.count({
        where: { dealerId, status: "pending" },
      }),
      EmployeeAssignment.count({
        where: { dealerId },
        include: [
          {
            model: EmployeeEmployerStatus,
            as: "statuses",
            required: true,
            attributes: [],
            where: {
              slug: "joining",
              status: "transfered",
            },
          },
        ],
        distinct: true,
        col: "id",
      }),
      ScoreStage.findAll({
        where: { isActive: true },
        order: [["minScore", "ASC"]],
      }),
      fetchRecentEmploymentRequests(dealerId),
    ]);

    const scoreMetrics = await calculateTop25Percent(dealerId);
    const scoreStage = await resolveScoreStage(
      scoreMetrics.averageScore ?? 0,
      scoreStages,
    );

    const dashboard = {
      dateRange: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      employeeStats: {
        total: buildStatCount(totalEmployees, totalEmployeesThisWeek),
        active: buildStatCount(activeEmployees, activeEmployeesThisWeek),
        newJoins: buildStatCount(newJoinsInPeriod, newJoinsThisWeek),
        exits: buildStatCount(exitsInPeriod, exitsThisWeek),
      },
      employeesByOutlet: employeesByOutlet.map((outlet) => ({
        outletId: outlet.id,
        outletName: outlet.name,
        outletCode: outlet.code,
        employeeCount: Number(outlet.get("employeeCount") || 0),
      })),
      pendingRequests: {
        join: pendingJoinRequests,
        exit: pendingExitRequests,
        transfer: pendingTransferRequests,
      },
      fadaScoreSummary: {
        statusLabel: scoreStage.statusLabel,
        statusColor: scoreStage.statusColor,
        top25Percent: scoreMetrics.top25Percent,
        averageScore: scoreMetrics.averageScore,
        employeeCount: scoreMetrics.employeeCount,
      },
      recentEmploymentRequests,
    };

    return res.apiSuccess("Dashboard fetched successfully", dashboard);
  } catch (error) {
    return res.apiError(error.message, 500, error);
  }
};

