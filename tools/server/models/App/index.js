import uuid from 'uuidv4';

export default {
  getStructure: ({ Sequelize }) => ({
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    info: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () { return JSON.parse(this.getDataValue('info') || '{}'); }, // eslint-disable-line
    },
    admin_password: {
      type: Sequelize.STRING
    }
  })
};
