import uuid from 'uuidv4';

export default {
  getStructure: ({ User, Sequelize }) => ({ // eslint-disable-line
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    profile_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    },
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING }
  })
};
