export type Employee = {
  employee_id: string;
  name: string;
  position: string;
  image_url: string;
  join_date: string;
  location_id: number;
  department_id: number;
  location_name: string;
  department_name: string;
  image_file?: File;
};
//db operation
export const findAllEmployees = async (db: D1Database) => {
  const query = `
      SELECT employees.*, locations.location_name, departments.department_name 
      FROM employees
      JOIN locations ON employees.location_id = locations.location_id
      JOIN departments ON employees.department_id = departments.department_id
      `;
  const { results } = await db.prepare(query).all();
  const employees = results;
  return employees;
};

export const findEmployeeById = async (db: D1Database, id: string) => {
  const query = `
      SELECT employees.*, locations.location_name, departments.department_name 
      FROM employees
      JOIN locations ON employees.location_id = locations.location_id
      JOIN departments ON employees.department_id = departments.department_id
      WHERE employee_id = ?`;

  const employee = await db.prepare(query).bind(id).first();
  return employee;
};

export const createEmployee = async (
  db: D1Database,
  employee: Employee
) => {
  const query = `
      INSERT INTO employees (name, position, join_date, image_url, department_id, location_id)
      VALUES (?, ?, ?, ?, ?, ?)`;

  const results  = await db
    .prepare(query)
    .bind(employee.name, employee.position,  employee.join_date, employee.image_url, employee.department_id, employee.location_id)
    .run();
  const employees = results;
  return employees;
};

export const findAllLocations = async (db: D1Database) => {
  const { results } = await db
    .prepare("SELECT * FROM locations ORDER BY location_name ASC")
    .all();
  const locations = results;
  return locations;
};

export const findAllDepartments = async (db: D1Database) => {
  const { results } = await db
    .prepare("SELECT * FROM departments ORDER BY department_name ASC")
    .all();
  const locations = results;
  return locations;
};

export const updateEmployee = async (
  db: D1Database,
  employeeId: string,
  updatedEmployee: Partial<Employee>
) => {
  const updateFields: string[] = [];
  const values: any[] = [];

  if (updatedEmployee.name) {
    updateFields.push('name = ?');
    values.push(updatedEmployee.name);
  }

  const query = `
    UPDATE employees
    SET ${updateFields.join(', ')}
    WHERE employee_id = ?
  `;
  values.push(employeeId);
  const results = await db.prepare(query).bind(...values).run();
  return results;
};

export const deleteEmployee = async (db: D1Database, employeeId: string) => {
  const query = `DELETE FROM employees WHERE employee_id = ?`;
  const result = await db.prepare(query).bind(employeeId).run();
  return result.success;
};

// 搜索引擎
export type SearchEngine = {
  name: string;
  image_url: string;
  created_date: number;
  status: number;
};
// 添加搜索引擎
export const createSearchEngine = async (
  db: D1Database,
  engine: SearchEngine
) => {
  const query = `
      INSERT INTO search_engine (name, image_url, created_date, status)
      VALUES (?, ?, ?, ?)`;

  const results  = await db
    .prepare(query)
    .bind(engine.name,engine.image_url, engine.created_date, engine.status)
    .run();
  const engines = results;
  return engines;
};

//查询搜索引擎列表
export const findSearchEngines = async (db: D1Database, page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const query = `
      SELECT * FROM search_engine WHERE status = 1
      LIMIT ? OFFSET ?
  `;
  const { results } = await db.prepare(query).bind(pageSize, offset).all();
  return results;
};

// 查找单个引擎
export const findSearchEngineById = async (db: D1Database, id: string) => {
  const query = `SELECT * FROM search_engine WHERE id = ? AND status = 1`;
  const result = await db.prepare(query).bind(id).first();
  return result;
};

// 更新引擎
export const updateSearchEngine = async (db: D1Database, id: string, updatedData: { name: string, status: number }) => {
  const { name, status } = updatedData;
  const query = `UPDATE search_engine SET name = ?, status = ? WHERE id = ?`;
  const result   = await db.prepare(query).bind(name, status, id).run();
  return result.success;
};

// 删除引擎
export const deleteSearchEngine = async (db: D1Database, id: string) => {
  const query = `DELETE FROM search_engine WHERE id = ?`;
  const result = await db.prepare(query).bind(id).run();
  return result.success;
};
