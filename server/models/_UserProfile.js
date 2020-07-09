import uuid from 'uuidv4';
import Sequelize from 'sequelize';
import sqlz from './sequelize';

const UserProfile = sqlz.define(
  'user_profile',
  {
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
  }
);

export default UserProfile;
