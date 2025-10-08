import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SpecialtyAttributes {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface SpecialtyCreationAttributes extends Optional<SpecialtyAttributes, 'id' | 'description' | 'is_active' | 'created_at' | 'updated_at'> {}

class Specialty extends Model<SpecialtyAttributes, SpecialtyCreationAttributes> implements SpecialtyAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Specialty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_specialty_name',
        msg: 'Esta especialidade já existe',
      },
      validate: {
        notEmpty: {
          msg: 'Nome da especialidade é obrigatório',
        },
        len: {
          args: [2, 100],
          msg: 'Nome da especialidade deve ter entre 2 e 100 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Descrição deve ter no máximo 500 caracteres',
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
    modelName: 'Specialty',
    tableName: 'specialties',
    timestamps: true,
    underscored: true,
  }
);

export { Specialty, SpecialtyAttributes, SpecialtyCreationAttributes };