import Student from '../models/student.model.js';
import { ROLES } from './roles.js';

const PRINCIPAL_EMAIL = 'admin@kinal.edu.gt';
const PRINCIPAL_PASSWORD = 'adminKinal123';

export const createAdmin = async () => {
    try {
        const principalExists = await Student.findOne({ role: ROLES.PRINCIPAL });
        if (principalExists) {
            console.log('El Administrador Principal ya existe en la base de datos.');
            return;
        }

        const defaultAccount = await Student.findOne({ email: PRINCIPAL_EMAIL });
        if (defaultAccount) {
            defaultAccount.role = ROLES.PRINCIPAL;
            if (!defaultAccount.phone) {
                defaultAccount.phone = '12345678';
            }
            await defaultAccount.save();
            console.log(
                'Cuenta por defecto promocionada a ADMIN_PRINCIPAL (Administrador Principal).'
            );
            return;
        }

        const newPrincipal = new Student({
            name: 'Administrador Principal',
            email: PRINCIPAL_EMAIL,
            password: PRINCIPAL_PASSWORD,
            role: ROLES.PRINCIPAL,
            phone: '40896488',
        });

        await newPrincipal.save();
        console.log('Administrador Principal creado con éxito (ADMIN_PRINCIPAL).');
    } catch (error) {
        console.error('Error al crear el Administrador Principal:', error);
    }
};
