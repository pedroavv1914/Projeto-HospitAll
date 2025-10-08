import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  role: 'admin' | 'doctor' | 'patient';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public cpf!: string;
  public phone!: string;
  public role!: 'admin' | 'doctor' | 'patient';
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Método para validar senha
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método para hash da senha
  public async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Método para retornar dados públicos (sem senha)
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() } as any;
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório',
        },
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Este email já está em uso',
      },
      validate: {
        isEmail: {
          msg: 'Email deve ter um formato válido',
        },
        notEmpty: {
          msg: 'Email é obrigatório',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória',
        },
        len: {
          args: [6, 255],
          msg: 'Senha deve ter pelo menos 6 caracteres',
        },
      },
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: {
        name: 'unique_cpf',
        msg: 'Este CPF já está cadastrado',
      },
      validate: {
        notEmpty: {
          msg: 'CPF é obrigatório',
        },
        is: {
          args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          msg: 'CPF deve estar no formato XXX.XXX.XXX-XX',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Telefone é obrigatório',
        },
        is: {
          args: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
          msg: 'Telefone deve estar no formato (XX) XXXXX-XXXX',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'doctor', 'patient'),
      allowNull: false,
      defaultValue: 'patient',
      validate: {
        isIn: {
          args: [['admin', 'doctor', 'patient']],
          msg: 'Tipo de usuário deve ser admin, doctor ou patient',
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          await user.hashPassword();
        }
      },
    },
  }
);

export { User, UserAttributes, UserCreationAttributes };