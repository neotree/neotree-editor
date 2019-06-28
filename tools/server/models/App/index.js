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
        const data = this.getDataValue(value);
        this.setDataValue(value, typeof data === 'object' ? JSON.stringify(data) : data);
      }
    },
    admin_password: {
      type: Sequelize.STRING
    }
  })
};
