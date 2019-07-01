import uuid from 'uuidv4';

export default {
  getStructure: ({ User, Sequelize }) => ({ // eslint-disable-line
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    metadata: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('metadata') || '{}');
      },
      set: function (value) {
        this.setDataValue('metadata', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    filename: { type: Sequelize.STRING },
    content_type: { type: Sequelize.STRING },
    size: { type: Sequelize.BIGINT },
    data: { type: Sequelize.BLOB('long') },
    uploaded_by: {
      type: Sequelize.UUID,
      // references: {
      //   model: User,
      //   key: 'id'
      // }
    }
  })
};
