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
      defaultValue: {},
      get: function (value) {
        return JSON.parse(this.getDataValue(value) || '{}');
      },
      set: function (value) {
        this.setDataValue('info', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    admin_password: {
      type: Sequelize.STRING
    }
  })
};
