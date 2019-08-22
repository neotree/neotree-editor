import uuid from 'uuidv4';

export default {
  getStructure: ({ Sequelize }) => ({
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    user: {
      type: Sequelize.UUID,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    },
    options: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        try {
          return JSON.parse(this.getDataValue('options'));
        } catch (e) {
          return this.getDataValue('options');
        }
      },
      set: function (value) {
        this.setDataValue('options', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
  })
};
