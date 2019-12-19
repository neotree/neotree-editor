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
      get: function () {
        return JSON.parse(this.getDataValue('info') || '{}');
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
