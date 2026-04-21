import mongoose, { Document, Schema } from 'mongoose';
import { ref } from 'node:process';

// Define los dos roles posibles en la app
export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
}

// Define la forma del documento en la base de datos
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    assignedLocationId: mongoose.Types.ObjectId | null;
}

const userSchema = new Schema<IUser>(
    {
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        },
        passwordHash: {
        type: String,
        required: true,
        },
        fullName: {
        type: String,
        required: true,
        trim: true,
        },
        role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
        default: UserRole.EMPLOYEE,
        },
        assignedLocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null,
        },
    },
    {
        timestamps: true, // Añade createdAt y updatedAt automáticamente
        versionKey: false,
    }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);