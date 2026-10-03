import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  UsersRound,
  UserRound,
  BriefcaseBusiness,
  TrendingUp,
  CalendarDays,
  ChevronDown,
  Activity,
  UserPlus,
  ShieldAlert,
  CircleCheck,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  superAdminFetch,
} from "../../../services/superAdminApi";

import "./Dashboard.css";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(
    Number(value || 0),
  );

const timeAgo = (dateValue) => {
  const createdAt = new Date(dateValue);
  const seconds = Math.max(
    Math.floor((Date.now() - createdAt.getTime()) / 1000),
    0,
  );

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return createdAt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

const defaultRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 29);

  const toInput = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`;

  return {
    startDate: toInput(start),
    endDate: toInput(end),
  };
};

const activityIcon = (type) => {
  if (type === "company") return Building2;
  if (type === "admin") return UserPlus;
  if (type === "user") return UserRound;
  return BriefcaseBusiness;
};

function Dashboard() {
  const [range, setRange] = useState(defaultRange);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rangeOpen, setRangeOpen] = useState(false);

  const loadDashboard = async (nextRange = range) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        startDate: nextRange.startDate,
        endDate: nextRange.endDate,
      });

      const data = await superAdminFetch(
        `/api/super-admin/dashboard?${params.toString()}`,
      );

      setDashboard(data);
    } catch (error) {
      console.error("Super Admin Dashboard Error:", error);
      toast.error(
        error.message || "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(range);
    // Initial dashboard load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registrations = dashboard?.registrations || [];
  const jobStatus = dashboard?.jobStatus || {};

  const chartModel = useMemo(() => {
    if (!registrations.length) {
      return {
        candidates: "0",
        companies: "0",
        max: 1,
      };
    }

    const maxValue = Math.max(
      ...registrations.map((item) =>
        Math.max(
          Number(item.candidates || 0),
          Number(item.companies || 0),
        ),
      ),
      1,
    );

    const toPoints = (key) => {
      const width = 700;
      const height = 220;
      const left = 18;
      const right = 10;
      const top = 15;
      const bottom = 25;
      const usableWidth = width - left - right;
      const usableHeight = height - top - bottom;
      const divisor = Math.max(registrations.length - 1, 1);

      return registrations
        .map((item, index) => {
          const value = Number(item[key] || 0);
          const x = left + (index / divisor) * usableWidth;
          const y =
            top +
            usableHeight -
            (value / maxValue) * usableHeight;

          return `${x},${y}`;
        })
        .join(" ");
    };

    return {
      candidates: toPoints("candidates"),
      companies: toPoints("companies"),
      max: maxValue,
    };
  }, [registrations]);

  const donutTotal =
    Number(jobStatus.active || 0) +
    Number(jobStatus.closed || 0) +
    Number(jobStatus.draft || 0) +
    Number(jobStatus.expired || 0);

  const donutStops = useMemo(() => {
    if (!donutTotal) {
      return "#e2e8f0 0 100%";
    }

    let cursor = 0;
    const segments = [
      [jobStatus.active || 0, "#10b981"],
      [jobStatus.closed || 0, "#2563eb"],
      [jobStatus.draft || 0, "#f59e0b"],
      [jobStatus.expired || 0, "#ef4444"],
    ];

    return segments
      .map(([value, color]) => {
        const start = cursor;
        cursor += (Number(value) / donutTotal) * 100;
        return `${color} ${start}% ${cursor}%`;
      })
      .join(", ");
  }, [donutTotal, jobStatus]);

  const cardData = [
    {
      label: "Companies",
      value: dashboard?.stats?.companies,
      trend: "Platform companies",
      icon: Building2,
      iconClass: "blue",
    },
    {
      label: "Company Admins",
      value: dashboard?.stats?.companyAdmins,
      trend: "Registered admins",
      icon: UsersRound,
      iconClass: "green",
    },
    {
      label: "Users (Candidates)",
      value: dashboard?.stats?.users,
      trend: "Registered users",
      icon: UserRound,
      iconClass: "purple",
    },
    {
      label: "Active Jobs",
      value: dashboard?.stats?.activeJobs,
      trend: "Currently published",
      icon: BriefcaseBusiness,
      iconClass: "orange",
    },
  ];

  const applyRange = () => {
    setRangeOpen(false);
    loadDashboard(range);
  };

  return (
    <section className="superDashboardPage">
      <div className="superPageHeader">
        <div>
          <h1>Welcome back, Super Admin!</h1>
          <p>Here’s an overview of your platform.</p>
        </div>

        <div className="superDatePickerWrap">
          <button
            type="button"
            className="superDatePicker"
            onClick={() => setRangeOpen((previous) => !previous)}
          >
            <CalendarDays size={16} />
            <span>
              {range.startDate} — {range.endDate}
            </span>
            <ChevronDown size={15} />
          </button>

          {rangeOpen && (
            <div className="superDateMenu">
              <label>
                Start date
                <input
                  type="date"
                  value={range.startDate}
                  onChange={(event) =>
                    setRange((previous) => ({
                      ...previous,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={range.endDate}
                  onChange={(event) =>
                    setRange((previous) => ({
                      ...previous,
                      endDate: event.target.value,
                    }))
                  }
                />
              </label>

              <button
                type="button"
                onClick={applyRange}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="superStatsGrid">
        {cardData.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="superStatCard"
              key={card.label}
            >
              <div className={`superStatIcon ${card.iconClass}`}>
                <Icon size={21} />
              </div>

              <div className="superStatContent">
                <span>{card.label}</span>
                <strong>
                  {loading
                    ? "—"
                    : formatNumber(card.value)}
                </strong>
                <small>
                  <TrendingUp size={13} />
                  {card.trend}
                </small>
              </div>
            </article>
          );
        })}
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="superDashboardGrid">
        <section className="superPanel registrationPanel">
          <div className="superPanelHeader">
            <div>
              <h2>User Registrations</h2>
              <p>
                Daily candidate and company registrations for the selected range.
              </p>
            </div>

            <div className="chartLegend">
              <span>
                <i className="legendDot candidates" />
                Candidates
              </span>
              <span>
                <i className="legendDot companies" />
                Companies
              </span>
            </div>
          </div>

          <div className="registrationChart">
            {loading ? (
              <div className="chartEmptyState">
                Loading registration data...
              </div>
            ) : registrations.length === 0 ? (
              <div className="chartEmptyState">
                No registration data for this range.
              </div>
            ) : (
              <svg
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
                role="img"
                aria-label="User registration chart"
              >
                <g className="chartGridLines">
                  <line x1="18" y1="15" x2="690" y2="15" />
                  <line x1="18" y1="60" x2="690" y2="60" />
                  <line x1="18" y1="105" x2="690" y2="105" />
                  <line x1="18" y1="150" x2="690" y2="150" />
                  <line x1="18" y1="195" x2="690" y2="195" />
                </g>

                <polyline
                  className="registrationLine candidatesLine"
                  points={chartModel.candidates}
                />

                <polyline
                  className="registrationLine companiesLine"
                  points={chartModel.companies}
                />
              </svg>
            )}

            {!loading && registrations.length > 0 && (
              <div className="chartXAxis">
                <span>
                  {formatShortDate(registrations[0].date)}
                </span>
                <span>
                  {formatShortDate(
                    registrations[Math.floor(registrations.length / 2)].date,
                  )}
                </span>
                <span>
                  {formatShortDate(
                    registrations[registrations.length - 1].date,
                  )}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="superPanel jobStatusPanel">
          <div className="superPanelHeader">
            <div>
              <h2>Job Status Overview</h2>
              <p>Current job distribution across the platform.</p>
            </div>
          </div>

          <div className="jobStatusBody">
            <div
              className="jobDonut"
              style={{
                background: `conic-gradient(${donutStops})`,
              }}
            >
              <div className="jobDonutCenter">
                <strong>
                  {loading
                    ? "—"
                    : formatNumber(donutTotal)}
                </strong>
                <span>Total Jobs</span>
              </div>
            </div>

            <div className="jobStatusLegend">
              <div>
                <span><i className="statusDot active" />Active</span>
                <strong>{formatNumber(jobStatus.active)}</strong>
              </div>
              <div>
                <span><i className="statusDot closed" />Closed</span>
                <strong>{formatNumber(jobStatus.closed)}</strong>
              </div>
              <div>
                <span><i className="statusDot draft" />Draft</span>
                <strong>{formatNumber(jobStatus.draft)}</strong>
              </div>
              <div>
                <span><i className="statusDot expired" />Expired</span>
                <strong>{formatNumber(jobStatus.expired)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="superPanel activityPanel">
          <div className="superPanelHeader">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest platform events.</p>
            </div>
            <Activity size={17} />
          </div>

          <div className="activityList">
            {!dashboard?.recentActivity?.length ? (
              <div className="activityEmpty">
                <CircleCheck size={18} />
                <span>No recent activity yet.</span>
              </div>
            ) : (
              dashboard.recentActivity.map((item) => {
                const Icon = activityIcon(item.type);

                return (
                  <div
                    className="activityItem"
                    key={item.id}
                  >
                    <span className={`activityIcon ${item.type}`}>
                      <Icon size={17} />
                    </span>

                    <div className="activityCopy">
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                      <small>{timeAgo(item.createdAt)}</small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="superDashboardFooterNote">
        <ShieldAlert size={15} />
        Platform data is pulled from the current JobHub database.
      </div>
    </section>
  );
}

export default Dashboard;
