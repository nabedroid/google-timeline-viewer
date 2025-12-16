import BaseTable from "./BaseTable";

export default class TimelinePathTable extends BaseTable {
  constructor(db) {
    super(db, "timelinepath", [
      ["id", "integer", "primary key"],
      ["start_time", "integer", "not null"],
      ["end_time", "integer", "not null"],
      ["start_time_timezone_utc_offset_minutes", "integer"],
      ["end_time_timezone_utc_offset_minutes", "integer"],
      ["time", "integer", "not null"],
      ["point_lat", "real", "not null"],
      ["point_lon", "real", "not null"],
    ]);
  }

  create() {
    super.create();
    this.db.run("create index if not exists idx_time on timelinepath(time)");
  }

  buildWhere(filters) {
    const cond = [];
    const params = [];

    if (filters.time != null) {
      cond.push("time = ?");
      params.push(filters.time);
    }
    if (filters.time_from != null) {
      cond.push("time >= ?");
      params.push(filters.time_from);
    }
    if (filters.time_to != null) {
      cond.push("time <= ?");
      params.push(filters.time_to);
    }

    return { cond, params };
  }
}
