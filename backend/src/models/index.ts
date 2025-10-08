// Importar todos os modelos
import { User } from './User';
import { Specialty } from './Specialty';
import { Doctor } from './Doctor';
import { Patient } from './Patient';
import { Appointment } from './Appointment';
import { MedicalRecord } from './MedicalRecord';
import { sequelize } from '../config/database';

// Definir todas as associações aqui para evitar problemas de dependência circular

// User associations
User.hasOne(Doctor, {
  foreignKey: 'user_id',
  as: 'doctor_profile',
});

User.hasOne(Patient, {
  foreignKey: 'user_id',
  as: 'patient_profile',
});

// Specialty associations
Specialty.hasMany(Doctor, {
  foreignKey: 'specialty_id',
  as: 'doctors',
});

// Doctor associations
Doctor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Doctor.belongsTo(Specialty, {
  foreignKey: 'specialty_id',
  as: 'specialty',
});

Doctor.hasMany(Appointment, {
  foreignKey: 'doctor_id',
  as: 'appointments',
});

Doctor.hasMany(MedicalRecord, {
  foreignKey: 'doctor_id',
  as: 'medical_records',
});

// Patient associations
Patient.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Patient.hasMany(Appointment, {
  foreignKey: 'patient_id',
  as: 'appointments',
});

Patient.hasMany(MedicalRecord, {
  foreignKey: 'patient_id',
  as: 'medical_records',
});

// Appointment associations
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor',
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
});

Appointment.hasOne(MedicalRecord, {
  foreignKey: 'appointment_id',
  as: 'medical_record',
});

// MedicalRecord associations
MedicalRecord.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor',
});

MedicalRecord.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
});

MedicalRecord.belongsTo(Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment',
});

// Exportar todos os modelos e a instância do sequelize
export {
  sequelize,
  User,
  Specialty,
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
};

// Função para sincronizar todos os modelos
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Banco de dados sincronizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    throw error;
  }
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com banco de dados:', error);
    return false;
  }
};