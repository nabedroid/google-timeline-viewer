import BaseTable from "./BaseTable";

export default class VisitTable extends BaseTable {
  constructor(db) {
    super(db, "visit", [
      ["id", "integer", "primary key"],
      ["start_time", "integer", "not null"],
      ["end_time", "integer", "not null"],
      ["start_time_timezone_utc_offset_minutes", "integer", "not null"],
      ["end_time_timezone_utc_offset_minutes", "integer", "not null"],
      ["hierarchy_level", "integer", "not null"],
      ["probability", "real", "not null"],
      ["top_candidate_place_id", "text", "not null"],
      ["top_candidate_semantic_type", "text", "not null"],
      ["top_candidate_probability", "real", "not null"],
      ["top_candidate_lat", "real", "not null"],
      ["top_candidate_lon", "real", "not null"],
      ["top_candidate_is_timeless_visit", "boolean"],
    ]);
  }

  create() {
    super.create();
    this.db.run("create index if not exists idx_start_time on visit(start_time)");
    this.db.run("create index if not exists idx_end_time on visit(end_time)");
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
