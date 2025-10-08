import { DataTypes, Model, Optional, Association, Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Doctor } from './Doctor';
import { Patient } from './Patient';

interface AppointmentAttributes {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_date: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  duration_minutes: number;
  created_at?: Date;
  updated_at?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id' | 'status' | 'notes' | 'duration_minutes' | 'created_at' | 'updated_at'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: number;
  public doctor_id!: number;
  public patient_id!: number;
  public appointment_date!: Date;
  public status!: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  public notes?: string;
  public duration_minutes!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associações
  public readonly doctor?: Doctor;
  public readonly patient?: Patient;

  public static associations: {
    doctor: Association<Appointment, Doctor>;
    patient: Association<Appointment, Patient>;
  };

  // Método para verificar se a consulta pode ser cancelada
  public canBeCancelled(): boolean {
    const now = new Date();
    const appointmentTime = new Date(this.appointment_date);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return this.status === 'scheduled' && hoursDiff > 2; // Pode cancelar até 2 horas antes
  }

  // Método para verificar se a consulta está no passado
  public isPast(): boolean {
    const now = new Date();
    return new Date(this.appointment_date) < now;
  }

  // Método para obter o horário de fim da consulta
  public getEndTime(): Date {
    const endTime = new Date(this.appointment_date);
    endTime.setMinutes(endTime.getMinutes() + this.duration_minutes);
    return endTime;
  }
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Data e hora da consulta são obrigatórias',
        },
        isDate: {
          msg: 'Data da consulta deve ser uma data válida',
          args: true,
        },
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Data da consulta deve ser futura',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: {
          args: [['scheduled', 'completed', 'cancelled', 'no_show']],
          msg: 'Status deve ser scheduled, completed, cancelled ou no_show',
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Observações devem ter no máximo 1000 caracteres',
        },
      },
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: {
          args: [15],
          msg: 'Duração mínima da consulta é 15 minutos',
        },
        max: {
          args: [240],
          msg: 'Duração máxima da consulta é 240 minutos',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['doctor_id', 'appointment_date'],
        name: 'unique_doctor_appointment_time',
      },
      {
        fields: ['appointment_date'],
        name: 'idx_appointment_date',
      },
      {
        fields: ['status'],
        name: 'idx_appointment_status',
      },
    ],
    validate: {
      // Validação para evitar conflitos de horário
      async noConflictingAppointments(this: Appointment) {
        const startTime = new Date(this.appointment_date);
        const endTime = new Date(startTime.getTime() + this.duration_minutes * 60000);
        
        const conflictingAppointment = await Appointment.findOne({
          where: {
            doctor_id: this.doctor_id,
            status: 'scheduled',
            id: { [Op.ne]: this.id || 0 },
          },
          attributes: ['appointment_date', 'duration_minutes'],
        });
        
        if (conflictingAppointment) {
          const existingStart = new Date(conflictingAppointment.appointment_date);
          const existingEnd = new Date(existingStart.getTime() + (conflictingAppointment as any).duration_minutes * 60000);
          
          // Verificar se há sobreposição
          if (
            (startTime >= existingStart && startTime < existingEnd) ||
            (endTime > existingStart && endTime <= existingEnd) ||
            (startTime <= existingStart && endTime >= existingEnd)
          ) {
            throw new Error('Já existe uma consulta agendada neste horário para este médico');
          }
        }
      },
      
      // Validação para horário comercial
      businessHours(this: Appointment) {
        const appointmentDate = new Date(this.appointment_date);
        const hour = appointmentDate.getHours();
        const dayOfWeek = appointmentDate.getDay();
        
        // Segunda a sexta: 7h às 18h, Sábado: 7h às 12h
        if (dayOfWeek === 0) { // Domingo
          throw new Error('Consultas não podem ser agendadas aos domingos');
        }
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a sexta
          if (hour < 7 || hour >= 18) {
            throw new Error('Consultas de segunda a sexta devem ser entre 7h e 18h');
          }
        }
        
        if (dayOfWeek === 6) { // Sábado
          if (hour < 7 || hour >= 12) {
            throw new Error('Consultas aos sábados devem ser entre 7h e 12h');
          }
        }
      },
    },
  }
);

// Definir associações
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor',
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
});

Doctor.hasMany(Appointment, {
  foreignKey: 'doctor_id',
  as: 'appointments',
});

Patient.hasMany(Appointment, {
  foreignKey: 'patient_id',
  as: 'appointments',
});

export { Appointment, AppointmentAttributes, AppointmentCreationAttributes };