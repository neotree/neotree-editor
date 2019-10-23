export default {
  getStructure: ({ User, Sequelize }) => ({ // eslint-disable-line
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    data: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('data') || '{}');
      },
      set: function (value) {
        this.setDataValue('data', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    details: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('details') || '{}');
      },
      set: function (value) {
        this.setDataValue('details', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    author: {
      type: Sequelize.UUID,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    }
  })
};
