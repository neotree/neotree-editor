import uuid from 'uuidv4';

export default {
  getStructure: ({ User, Script, Sequelize }) => ({ // eslint-disable-line
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    data: {
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
    type: {
      type: Sequelize.STRING
    },
    position: {
      type: Sequelize.INTEGER
    },
    script_id: {
      type: Sequelize.UUID,
      // references: {
      //   model: Script,
      //   key: 'id'
      // }
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
