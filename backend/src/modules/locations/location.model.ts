import mongoose, { Document, Schema } from "mongoose";

//Define la forma del documento rn la base de datos
export interface ILocation extends Document{
    name: string;
    center: {
        latitude: number;
        longitude: number;
    };
    radiusMeters: number;
    createdAt: Date;
    updateAt: Date;
}

const locationSchema= new Schema<ILocation>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        center: {
            latitude: {type: Number, require: true},
            longitude: {type: Number, require: true},
        },
        radiusMeters: {
            type: Number,
            required: true,
            default: 100, //100 metros para la geolocalizacion 
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const LocationModel = mongoose.model<ILocation>('Location', locationSchema);