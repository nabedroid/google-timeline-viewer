export default class BaseTable {
  constructor(db, tableName, columns) {
    // id がカラムになければ先頭に追加
    const hasId = columns.some(c => c[0] === "id");
    if (!hasId) {
      columns.unshift(["id", "integer", "primary key"]);
    }
    this.db = db;
    this.tableName = tableName;
    this.columns = columns;
    // buildWhere のオーバーライドチェック
    if (this.buildWhere === BaseTable.prototype.buildWhere) {
      console.warn(`Warning: ${tableName} does not override buildWhere()`);
    }
  }

  create() {
    const cols = this.columns.map(c => c.join(" "));
    const sql = `create table if not exists ${this.tableName} (${cols.join(",")})`;
    this.db.run(sql);
  }

  buildWhere(filters) {
    console.log("Warning: buildWhere is not implemented in BaseTable");
    return { cond: [], params: [] };
  }

  select(filters = {}) {    
    const { cond, params } = this.buildWhere(filters);
    const where = cond.length > 0 ? "where " + cond.join(" and ") : "";
    const sql = `select * from ${this.tableName} ${where}`;
    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const result = [];
    while (stmt.step()) {
      const vals = stmt.get();
      const row = {};

      for (let i = 0; i < this.columns.length; i++) {
        const colName = this.columns[i][0];
        row[colName] = vals[i];
      }
      result.push(row);
    }
    stmt.free();

    return result;
  }

  insert(params) {
    if (!Array.isArray(params)) throw new Error("params must be an array");
    if (params.length === 0) return;

    const valuesArray = Array.isArray(params[0]) ? params : [params];
    const columns = this.columns.slice(1).map(c => c[0]);
    const placeholders = this.columns.slice(1).map(() => "?");
    const sql = `insert into ${this.tableName} (${columns.join(",")}) values (${placeholders.join(",")})`;

    this.db.run("begin transaction");
    const stmt = this.db.prepare(sql);
    try {
      for (const values of valuesArray) {
        stmt.run(values);
      }
      this.db.run("commit");
    } catch (err) {
      this.db.run("rollback");
      throw err;
    } finally {
      stmt.free();
    }
  }

  delete() {
    const sql = `delete from ${this.tableName}`;
    this.db.run(sql);
  }
}
