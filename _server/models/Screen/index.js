export default {
  getStructure: ({ User, Script, Sequelize }) => ({ // eslint-disable-line
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
    type: {
      type: Sequelize.STRING
    },
    position: {
      type: Sequelize.INTEGER
    },
    script_id: {
      type: Sequelize.STRING,
      // references: {
      //   model: Script,
      //   key: 'id'
      // }
    },
  })
};
