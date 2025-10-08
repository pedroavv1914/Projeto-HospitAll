import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { Doctor } from './Doctor';
import { Patient } from './Patient';
import { Appointment } from './Appointment';

interface MedicalRecordAttributes {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  diagnosis: string;
  treatment?: string;
  medications?: string;
  observations?: string;
  vital_signs?: string;
  exam_results?: string;
  follow_up_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface MedicalRecordCreationAttributes extends Optional<MedicalRecordAttributes, 'id' | 'appointment_id' | 'treatment' | 'medications' | 'observations' | 'vital_signs' | 'exam_results' | 'follow_up_date' | 'created_at' | 'updated_at'> {}

class MedicalRecord extends Model<MedicalRecordAttributes, MedicalRecordCreationAttributes> implements MedicalRecordAttributes {
  public id!: number;
  public patient_id!: number;
  public doctor_id!: number;
  public appointment_id?: number;
  public diagnosis!: string;
  public treatment?: string;
  public medications?: string;
  public observations?: string;
  public vital_signs?: string;
  public exam_results?: string;
  public follow_up_date?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associações
  public readonly doctor?: Doctor;
  public readonly patient?: Patient;
  public readonly appointment?: Appointment;

  public static associations: {
    doctor: Association<MedicalRecord, Doctor>;
    patient: Association<MedicalRecord, Patient>;
    appointment: Association<MedicalRecord, Appointment>;
  };

  // Método para verificar se precisa de acompanhamento
  public needsFollowUp(): boolean {
    if (!this.follow_up_date) return false;
    const now = new Date();
    return new Date(this.follow_up_date) > now;
  }

  // Método para obter resumo do prontuário
  public getSummary(): string {
    let summary = `Diagnóstico: ${this.diagnosis}`;
    
    if (this.treatment) {
      summary += `\nTratamento: ${this.treatment}`;
    }
    
    if (this.medications) {
      summary += `\nMedicações: ${this.medications}`;
    }
    
    return summary;
  }
}

MedicalRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Diagnóstico é obrigatório',
        },
        len: {
          args: [5, 2000],
          msg: 'Diagnóstico deve ter entre 5 e 2000 caracteres',
        },
      },
    },
    treatment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Tratamento deve ter no máximo 2000 caracteres',
        },
      },
    },
    medications: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Medicações devem ter no máximo 1000 caracteres',
        },
      },
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Observações devem ter no máximo 2000 caracteres',
        },
      },
    },
    vital_signs: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Sinais vitais em formato JSON: {pressure, temperature, heart_rate, etc}',
    },
    exam_results: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 3000],
          msg: 'Resultados de exames devem ter no máximo 3000 caracteres',
        },
      },
    },
    follow_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Data de acompanhamento deve ser uma data válida',
          args: true,
        },
        isAfter: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Data de acompanhamento deve ser futura',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'MedicalRecord',
    tableName: 'medical_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['patient_id'],
        name: 'idx_medical_record_patient',
      },
      {
        fields: ['doctor_id'],
        name: 'idx_medical_record_doctor',
      },
      {
        fields: ['appointment_id'],
        name: 'idx_medical_record_appointment',
      },
      {
        fields: ['created_at'],
        name: 'idx_medical_record_date',
      },
      {
        fields: ['follow_up_date'],
        name: 'idx_medical_record_follow_up',
      },
    ],
    validate: {
      // Validação para garantir que o médico pode acessar o paciente
      async doctorCanAccessPatient(this: MedicalRecord) {
        // Esta validação pode ser expandida com regras de negócio específicas
        // Por exemplo, verificar se o médico tem permissão para tratar este paciente
        if (this.doctor_id && this.patient_id) {
          // Lógica de validação pode ser implementada aqui
          // Por enquanto, permitimos qualquer médico tratar qualquer paciente
        }
      },
    },
  }
);

// Definir associações
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

Doctor.hasMany(MedicalRecord, {
  foreignKey: 'doctor_id',
  as: 'medical_records',
});

Patient.hasMany(MedicalRecord, {
  foreignKey: 'patient_id',
  as: 'medical_records',
});

Appointment.hasOne(MedicalRecord, {
  foreignKey: 'appointment_id',
  as: 'medical_record',
});

export { MedicalRecord, MedicalRecordAttributes, MedicalRecordCreationAttributes };