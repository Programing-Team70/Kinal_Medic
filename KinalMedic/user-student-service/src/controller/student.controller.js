import Student from '../models/student.model.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, carnet, carrera } = req.body;
        const newStudent = new Student({
            name, email, password, carnet, carrera,
            role: 'student' 
        });
        await newStudent.save();
        res.status(201).json({ message: "Registro concretado! Puede iniciar sesión" });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar por esto", error: error.message });
    }
};

export const createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ message: "Estudiante creado por Admin", student });
    } catch (error) {
        res.status(500).json({ message: "Error al crear estudiante", error: error.message });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener perfil" });
    }
};

export const getStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Error al listar" });
    }
};

export const getStudentByCarnet = async (req, res) => {
    try {
        const student = await Student.findOne({ carnet: req.params.carnet }).select('-password');
        if (!student) return res.status(404).json({ message: "Estudiante no encontrado" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar" });
    }
};