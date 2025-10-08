import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Specialty } from './Specialty';

interface DoctorAttributes {
  id: number;
  user_id: number;
  crm: string;
  specialty_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface DoctorCreationAttributes extends Optional<DoctorAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> implements DoctorAttributes {
  public id!: number;
  public user_id!: number;
  public crm!: string;
  public specialty_id!: number;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associações
  public readonly user?: User;
  public readonly specialty?: Specialty;

  public static associations: {
    user: Association<Doctor, User>;
    specialty: Association<Doctor, Specialty>;
  };
}

Doctor.init(
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
    crm: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: 'unique_crm',
        msg: 'Este CRM já está cadastrado',
      },
      validate: {
        notEmpty: {
          msg: 'CRM é obrigatório',
        },
        is: {
          args: /^CRM\/[A-Z]{2}\s\d{4,6}$/,
          msg: 'CRM deve estar no formato CRM/UF XXXXXX',
        },
      },
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'specialties',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Doctor',
    tableName: 'doctors',
    timestamps: true,
    underscored: true,
    validate: {
      async userMustBeDoctor(this: Doctor) {
        const user = await User.findByPk(this.user_id);
        if (user && user.role !== 'doctor') {
          throw new Error('Usuário deve ter o papel de médico');
        }
      },
    },
  }
);

// Definir associações
Doctor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Doctor.belongsTo(Specialty, {
  foreignKey: 'specialty_id',
  as: 'specialty',
});

User.hasOne(Doctor, {
  foreignKey: 'user_id',
  as: 'doctor_profile',
});

Specialty.hasMany(Doctor, {
  foreignKey: 'specialty_id',
  as: 'doctors',
});

export { Doctor, DoctorAttributes, DoctorCreationAttributes };