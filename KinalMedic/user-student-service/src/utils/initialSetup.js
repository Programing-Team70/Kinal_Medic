import Student from '../models/student.model.js';

export const createAdmin = async () => {
    try {
        const adminExists = await Student.findOne({ role: 'admin' });

        if (!adminExists) {
            const newAdmin = new Student({
                name: "Profesor Medico",
                email: "admin@kinal.edu.gt",
                phone: "12345678",
                password: "adminKinal123", 
                role: "admin"
            });
            await newAdmin.save();
            console.log("Administrador creado correctamente.");
        } else {
            console.log("El administrador ya existe en la base de datos.");
        }
    } catch (error) {
        console.error("Error al crear el admin por esta razón:", error);
    }
};