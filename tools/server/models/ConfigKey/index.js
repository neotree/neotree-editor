import uuid from 'uuidv4';

export default {
  getStructure: ({ User, Sequelize }) => ({ // eslint-disable-line
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
    author: {
      type: Sequelize.UUID,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    }
  })
};
