import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface PatientAttributes {
  id: number;
  user_id: number;
  birth_date: Date;
  address: string;
  emergency_contact: string;
  blood_type?: string;
  allergies?: string;
  medical_history?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'blood_type' | 'allergies' | 'medical_history' | 'is_active' | 'created_at' | 'updated_at'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: number;
  public user_id!: number;
  public birth_date!: Date;
  public address!: string;
  public emergency_contact!: string;
  public blood_type?: string;
  public allergies?: string;
  public medical_history?: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associações
  public readonly user?: User;

  public static associations: {
    user: Association<Patient, User>;
  };

  // Método para calcular idade
  public getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Data de nascimento é obrigatória',
        },
        isDate: {
          msg: 'Data de nascimento deve ser uma data válida',
          args: true,
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Data de nascimento deve ser anterior à data atual',
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Endereço é obrigatório',
        },
        len: {
          args: [10, 500],
          msg: 'Endereço deve ter entre 10 e 500 caracteres',
        },
      },
    },
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Contato de emergência é obrigatório',
        },
        len: {
          args: [5, 100],
          msg: 'Contato de emergência deve ter entre 5 e 100 caracteres',
        },
      },
    },
    blood_type: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
          msg: 'Tipo sanguíneo deve ser um dos valores válidos',
        },
      },
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Alergias deve ter no máximo 1000 caracteres',
        },
      },
    },
    medical_history: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Histórico médico deve ter no máximo 2000 caracteres',
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: true,
    underscored: true,
    validate: {
      async userMustBePatient(this: Patient) {
        const user = await User.findByPk(this.user_id);
        if (user && user.role !== 'patient') {
          throw new Error('Usuário deve ter o papel de paciente');
        }
      },
    },
  }
);

// Definir associações
Patient.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasOne(Patient, {
  foreignKey: 'user_id',
  as: 'patient_profile',
});

export { Patient, PatientAttributes, PatientCreationAttributes };