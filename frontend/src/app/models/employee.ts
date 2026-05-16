export interface Employee{
    id?:number;
    name: string;
    department:string;
    email: string;
    sal: number;
}

export interface EmployeeSearchRequest {
  name?: string;
  email?: string;
  department?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
}