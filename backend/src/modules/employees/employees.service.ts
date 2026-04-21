import { UserModel, UserRole } from "../auth/user.model";
import bcrypt from "bcryptjs";
import { LocationModel } from "../locations/location.model";

//crea un nuevo empleado
export async function createEmployee(
    fullName: string,
    email: string,
    password: string
) {
    //Verifica que no exista un usuario con el mismo email
    const existingUser = await UserModel.findOne({ email });
    if(existingUser){
        throw new Error('Ya existe un usuario con ese email');
    }

    //encriptar la contraseña anntes de guardarla
    const passwordHash = await bcrypt.hash(password, 12);

    //Crea un empleado en la base de datos
    const employee = await UserModel.create({
        fullName,
        email,
        passwordHash,
        role: UserRole.EMPLOYEE,
    });

    //devolver el empleado sin la contraseña
    return{
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        assignedLocationId: employee.assignedLocationId ?? null,
        createdAt: employee.createdAt,
    };
}

//Obtiene todos los empleados que no tienen contraseña
export async function getAllEmployees() {
    const employees = await UserModel.find(
        { role: UserRole.EMPLOYEE},
        { passwordHash : 0}
    ).sort({ createdAt: -1 });

    return employees;
}

//Obtiene un empleado por su ID
export async function getEmployeeById(employeeId: string) {
    const employee = await UserModel.findOne(
        { _id: employeeId, role: UserRole.EMPLOYEE},
        { passwordHash: 0}
    );

    if (!employee){
        throw new Error('Empleado no encontrado');
    }
    return employee;
}

//Asigna una ubicación a un empleado
export async function assignLocation(
    employeeId: string,
    locationId: string
) {
    //Verifica que la ubicacion existe antes de asignar
    const location = await LocationModel.findById(locationId);
    if(!location){
        throw new Error('Ubicación no encontrada');
    }

    //Actualizar el empleado con la nueva ubicación
    const employee = await UserModel.findByIdAndUpdate(
        employeeId,
        { assignedLocationId: locationId},
        {new: true, projection: {passwordHash: 0}}
    );

    if(!employee){
        throw new Error ('Empleado no encontrado');
    }
    return employee;
}

//Elimina un empleado
export async function deleteEmployee(employeeId: string) {
    const employee = await UserModel.findOneAndDelete({
        _id: employeeId,
        role: UserRole.EMPLOYEE,
    });

    if(!employee){
        throw new Error('Empleado no encontrado');
    }
}