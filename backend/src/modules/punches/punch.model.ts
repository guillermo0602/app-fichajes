import mongoose, { Schema } from "mongoose";

//Entrada y salida de fichaje
export enum PunchType {
    CLOCK_IN = 'CLOCK_IN',
    CLOCK_OUT = 'CLOCK_OUT',
}

//Forma del documento en la base de datos
export interface IPunch extends Document{
    employeeId: mongoose.Types.ObjectId;
    locationId: mongoose.Types.ObjectId;
    type: PunchType;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    distanceFromCenterMeters: number;
    timestamp: Date;
}

const punchSchema = new Schema<IPunch>(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(PunchType),
            required: true,
        },
        coordinates: {
            latitude: { type: Number, required: true},
            longitude: { type: Number, required: true},
        },

        //registro de la distancia en la que esta el empleado
        distanceFromCenterMeters: {
            type: Number,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const PunchModel = mongoose.model<IPunch>('Punch', punchSchema);