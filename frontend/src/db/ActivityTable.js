import BaseTable from "./BaseTable";

export default class ActivityTable extends BaseTable {
  constructor(db) {
    super(db, "activity", [
      ["id", "integer", "primary key"],
      ["start_time", "integer", "not null"],
      ["end_time", "integer", "not null"],
      ["start_time_timezone_utc_offset_minutes", "integer", "not null"],
      ["end_time_timezone_utc_offset_minutes", "integer", "not null"],
      ["start_lat", "real", "not null"],
      ["start_lon", "real", "not null"],
      ["end_lat", "real", "not null"],
      ["end_lon", "real", "not null"],
      ["distance_meters", "real", "not null"],
      ["probability", "real"],
      ["top_candidate_type", "text", "not null"],
      ["top_candidate_probability", "real", "not null"],
      ["parking_location_lat", "real"],
      ["parking_location_lon", "real"],
      ["parking_start_time", "integer"],
    ]);
  }

  create() {
    super.create();
    this.db.run("create index if not exists idx_start_time on activity(start_time)");
    this.db.run("create index if not exists idx_end_time on activity(end_time)");
  }

  buildWhere(filters) {
    const cond = [];
    const params = [];

    if (filters.start_time != null) {
      cond.push("start_time = ?");
      params.push(filters.start_time);
    }
    if (filters.start_time_from != null) {
      cond.push("start_time >= ?");
      params.push(filters.start_time_from);
    }
    if (filters.start_time_to != null) {
      cond.push("start_time <= ?");
      params.push(filters.start_time_to);
    }

    if (filters.end_time != null) {
      cond.push("end_time = ?");
      params.push(filters.end_time);
    }
    if (filters.end_time_from != null) {
      cond.push("end_time >= ?");
      params.push(filters.end_time_from);
    }
    if (filters.end_time_to != null) {
      cond.push("end_time <= ?");
      params.push(filters.end_time_to);
    }

    return { cond, params };
  }
}
