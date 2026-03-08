import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del medicamento es requerido.'],
        trim: true
    },
    genericName: {
        type: String,
        required: [true, 'El nombre generico del medicamento es requerido.']
    },
    description: {
        type: String,
        required: [true, 'La descripcion del medicamento es requerido.'],
    },
    category: {
        type: String,
        required: [true, 'La categoria del medicamento es requerido.'],
        enum: ["analgesico", "antibiotico", "anti inflammatorio", "antipirético", "otro"],
        default: "other"
    },
    dosageForm: {
        type: String,
        required: [true, 'La forma de aplicacion es requerida.'],
        enum: ["tableta", "capsula", "jarabe", "inyección", "crema", "gotas"]
    },
    stock: {
        type: Number,
        required: [true, 'La cantidad del medicamento en el inventario es requerida.'],
        min: 0
    },
    expirationDate: {
        type: Date,
        required: [true, 'La fecha de vencimiento del medicamento es requerida.'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false, });

medicineSchema.pre(/^find/, async function () {
    this.where({ isActive: true });
});

medicineSchema.index({ isActive: 1 });
export default mongoose.model("Medicine", medicineSchema);